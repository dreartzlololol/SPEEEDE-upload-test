import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Star, Filter, X, Zap, TrendingUp, Users, Sparkles, ChevronRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs, Job } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ApplicationModal } from '@/components/jobs/ApplicationModal';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { PageTransition } from '@/components/ui/PageTransition';
import { formatSalaryWithCurrency } from '@/utils/cn';

export default function Feed() {
  const navigate = useNavigate();
  const { language, distanceUnit } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailedJob, setDetailedJob] = useState<Job | null>(null);
  const { jobs, hiddenJobs, hideJob } = useJobs();
  const { user, showAuthModal } = useAuth();

  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'salaryHigh' | 'ratingHigh' | 'distance'>('newest');
  const [minSalary, setMinSalary] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const CENTER_LAT = 13.6922;
  const CENTER_LNG = 99.8536;

  const categories = ['All', 'Urgent', ...Array.from(new Set(jobs.map(j => j.category)))];

  const handleApply = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (!user) {
      showAuthModal();
      return;
    }
    setSelectedJob(job);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const parseSalary = (salaryStr: string) => {
    const clean = salaryStr.replace(/[^0-9]/g, '');
    return clean ? parseInt(clean) : 0;
  };

  const formatDistance = (lat: number, lng: number) => {
    let dist = getDistance(CENTER_LAT, CENTER_LNG, lat, lng);
    if (distanceUnit === 'mi') {
      dist = dist * 0.621371;
      return `${dist.toFixed(1)} mi`;
    }
    return `${dist.toFixed(1)} km`;
  };

  const resetFilters = () => {
    setSortBy('newest');
    setMinSalary('');
    setMaxDistance('');
    setOnlyUrgent(false);
  };

  const hasActiveFilters = sortBy !== 'newest' || minSalary.trim() !== '' || maxDistance !== '' || onlyUrgent;

  const filteredJobs = jobs
    .filter(j => {
      if (hiddenJobs.includes(j.id)) return false;
      
      // Category Tab
      if (activeTab === 'Urgent') {
        if (!j.isUrgent) return false;
      } else if (activeTab !== 'All' && j.category !== activeTab) {
        return false;
      }

      // Search Query
      const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            j.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            j.location.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Urgent checkbox
      if (onlyUrgent && !j.isUrgent) return false;

      // Min Salary filter
      if (minSalary.trim()) {
        const minVal = parseInt(minSalary);
        if (!isNaN(minVal) && parseSalary(j.salary) < minVal) return false;
      }

      // Max Distance filter
      if (maxDistance) {
        const maxDistVal = parseFloat(maxDistance);
        const dist = getDistance(CENTER_LAT, CENTER_LNG, j.lat, j.lng);
        if (!isNaN(maxDistVal) && dist > maxDistVal) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'salaryHigh') {
        return parseSalary(b.salary) - parseSalary(a.salary);
      }
      if (sortBy === 'ratingHigh') {
        return b.employerRating - a.employerRating;
      }
      if (sortBy === 'distance') {
        const distA = getDistance(CENTER_LAT, CENTER_LNG, a.lat, a.lng);
        const distB = getDistance(CENTER_LAT, CENTER_LNG, b.lat, b.lng);
        return distA - distB;
      }
      return b.id - a.id;
    });

  const visibleJobs = jobs.filter(j => !hiddenJobs.includes(j.id));
  const urgentJobsCount = visibleJobs.filter(j => j.isUrgent).length;
  const maxSalary = visibleJobs.length > 0 
    ? Math.max(...visibleJobs.map(j => parseSalary(j.salary))) 
    : 0;

  return (
    <PageTransition className="pb-20 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-4">
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold dark:text-white">{isRot ? 'Looking for Ops 👀' : isTh ? 'งานล่าสุด' : 'Find Jobs'}</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              className="pl-10 rounded-full" 
              placeholder={isRot ? "Search for W Rizz jobs..." : isTh ? "ค้นหางาน หรือ ทักษะ..." : "Search for jobs..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            className={`rounded-full px-4 border-gray-200 dark:border-gray-700 transition-all ${
              hasActiveFilters ? 'border-theme-primary text-theme-primary' : ''
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Expandable Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-3xl p-5 bg-white dark:bg-speede-darkGray space-y-4 shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {isRot ? 'Sort Vibe' : isTh ? 'จัดเรียงตาม' : 'Sort By'}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-speede-red dark:bg-speede-black dark:border-gray-800 dark:text-white"
                  >
                    <option value="newest">{isRot ? 'Fresh Out the Oven (Newest)' : isTh ? 'ใหม่ล่าสุด' : 'Newest'}</option>
                    <option value="salaryHigh">{isRot ? 'Big Bags First (Salary)' : isTh ? 'ค่าตอบแทนสูง-ต่ำ' : 'Salary: High to Low'}</option>
                    <option value="ratingHigh">{isRot ? 'W Rizz (Rating)' : isTh ? 'เรตติ้งผู้จ้างสูง-ต่ำ' : 'Employer Rating'}</option>
                    <option value="distance">{isRot ? 'Nearby Ops (Distance)' : isTh ? 'ใกล้ฉันที่สุด' : 'Distance: Closest'}</option>
                  </select>
                </div>

                {/* Min Salary */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {isRot ? 'Min Bag (THB)' : isTh ? 'ค่าตอบแทนขั้นต่ำ (บาท)' : 'Min Salary (THB)'}
                  </label>
                  <Input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder={isRot ? "e.g. 500 no cap" : isTh ? "เช่น 500" : "e.g. 500"}
                  />
                </div>

                {/* Max Distance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {isRot ? 'Max Distance' : isTh ? 'ระยะทางสูงสุด' : 'Max Distance'}
                  </label>
                  <select
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-speede-red dark:bg-speede-black dark:border-gray-800 dark:text-white"
                  >
                    <option value="">{isRot ? 'Anywhere (All)' : isTh ? 'ทั้งหมด' : 'Anywhere'}</option>
                    <option value="2">2 {isTh ? 'กม.' : 'km'}</option>
                    <option value="5">5 {isTh ? 'กม.' : 'km'}</option>
                    <option value="10">10 {isTh ? 'กม.' : 'km'}</option>
                    <option value="25">25 {isTh ? 'กม.' : 'km'}</option>
                    <option value="50">50 {isTh ? 'กม.' : 'km'}</option>
                  </select>
                </div>
              </div>

              {/* Extra Checkboxes / Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyUrgent}
                    onChange={(e) => setOnlyUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-speede-red focus:ring-speede-red border-gray-300 dark:border-gray-700 dark:bg-speede-black"
                  />
                  <span className="text-sm font-medium dark:text-gray-300">
                    {isRot ? '🚨 911 Ops Only (Urgent)' : isTh ? '🚨 เฉพาะงานด่วนเท่านั้น' : '🚨 Urgent Jobs Only'}
                  </span>
                </label>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-bold text-gray-400 hover:text-speede-red dark:text-gray-500"
                  onClick={resetFilters}
                >
                  {isRot ? 'Reset Vibe' : isTh ? 'ล้างตัวกรอง' : 'Reset Filters'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary Badge */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between bg-theme-primary/10 dark:bg-theme-primary/5 border border-theme-primary/20 px-4 py-2 rounded-2xl text-xs text-theme-primary font-medium">
            <span>
              {isRot ? 'Active Filter: ' : isTh ? 'ตัวกรองที่เลือก: ' : 'Active Filters: '}
              {sortBy !== 'newest' && `• ${sortBy === 'salaryHigh' ? (isRot ? 'Big Bag' : isTh ? 'ตามค่าจ้าง' : 'Salary') : sortBy === 'ratingHigh' ? (isRot ? 'W Rating' : isTh ? 'ตามเรตติ้ง' : 'Rating') : (isRot ? 'Closest' : isTh ? 'ระยะทาง' : 'Distance')}`}
              {minSalary.trim() !== '' && ` • Min: ฿${minSalary}`}
              {maxDistance !== '' && ` • Max Distance: ${maxDistance}${distanceUnit}`}
              {onlyUrgent && ` • 🚨 Urgent`}
            </span>
            <button 
              className="font-bold underline cursor-pointer hover:opacity-80" 
              onClick={resetFilters}
            >
              {isRot ? 'Reset' : isTh ? 'รีเซ็ต' : 'Clear'}
            </button>
          </div>
        )}
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 text-sm font-display tracking-wider whitespace-nowrap transition-all ${
                activeTab === cat 
                  ? 'theme-button-secondary translate-y-[-2px]' 
                  : 'theme-panel hover:bg-theme-secondary/50'
              }`}
            >
              {isRot ? (
                cat === 'All' ? 'Everything' : 
                cat === 'Urgent' ? '911 Ops 🚨' :
                cat === 'Labor' ? 'Gym Bros' : 
                cat === 'Delivery' ? 'UberEats' : 
                cat === 'Handyman' ? 'Bob the Builder' : 
                cat === 'Tutoring' ? 'Yapping Lesson' : 
                cat === 'Design' ? 'Aura Editing' : cat
              ) : isTh ? (
                cat === 'All' ? 'ทั้งหมด' : 
                cat === 'Urgent' ? 'ด่วนพิเศษ 🚨' :
                cat === 'Labor' ? 'ใช้แรงงาน' : 
                cat === 'Delivery' ? 'ส่งของ' : 
                cat === 'Handyman' ? 'ช่างซ่อม' : 
                cat === 'Tutoring' ? 'สอนพิเศษ' : 
                cat === 'Design' ? 'ออกแบบ' : cat
              ) : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{isRot ? 'Dead game. No ops found fr.' : isTh ? 'ไม่พบงานที่ค้นหา' : 'No jobs found matching your search.'}</div>
        ) : (
          filteredJobs.map((job, i) => (
            <motion.div
            key={job.id}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
            whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.15 } }}
          >
            <Card 
              className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setDetailedJob(job)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); hideJob(job.id); }}
                className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                aria-label={isRot ? 'Nah' : isTh ? 'ซ่อนงาน' : 'Hide job'}
              >
                <X className="w-4 h-4" />
              </button>
              
              {job.isUrgent && (
                <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-speede-red text-white text-xs font-bold rounded-full shadow-lg shadow-speede-red/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  {isRot ? 'URGENT' : isTh ? 'ด่วน' : 'URGENT'}
                </div>
              )}
              
              <div className="h-32 w-full overflow-hidden">
                <img src={job.image} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2 pr-10">
                  <h3 className="text-lg font-bold dark:text-white line-clamp-1 flex-1">{job.title}</h3>
                  <span className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-speede-red text-white font-extrabold text-sm rounded-2xl shadow-md border border-red-500/30 whitespace-nowrap ml-3 shrink-0">
                    {formatSalaryWithCurrency(job.salary)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{job.description}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location} ({formatDistance(job.lat, job.lng)})
                  </div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.time}</div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${job.employer}`} alt="avatar" />
                    </div>
                    <span className="text-sm font-medium dark:text-gray-300">{job.employer}</span>
                    <div className="flex items-center text-yellow-500 text-xs ml-1">
                      <Star className="w-3 h-3 fill-current" /> {job.employerRating}
                    </div>
                  </div>
                  <Button size="sm" className="h-8 rounded-xl px-4 relative z-10" onClick={(e) => handleApply(e, job)}>
                    {isRot ? 'W Rizz' : isTh ? 'สมัครงาน' : 'Apply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  </div>
  {/* End Main Feed Column */}

        {/* Desktop Right Sidebar (Visible on PC / lg screens) */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          {/* Mini Live Map Card */}
          <div className="theme-panel p-5 bg-white dark:bg-speede-darkGray border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm dark:text-white">
                  {isRot ? 'Radar Map' : isTh ? 'แผนที่บริเวณใกล้เคียง' : 'Nearby Map Radar'}
                </h3>
              </div>
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
            </div>

            <div 
              onClick={() => navigate('/map')} 
              className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white"
            >
              {/* Simulated Map Visual Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
              
              <div className="relative z-10 text-center space-y-2 p-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span>{jobs.length} {isTh ? 'งานในบริเวณใกล้เคียง' : 'Jobs Active Nearby'}</span>
                </div>
                <p className="text-xs text-blue-100 opacity-90 group-hover:scale-105 transition-transform font-medium">
                  {isTh ? 'แตะเพื่อเปิดแผนที่ Google Maps แบบเรียลไทม์ →' : 'Tap to open full interactive 3D map →'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats & Highlights */}
          <div className="theme-panel p-5 bg-white dark:bg-speede-darkGray border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-speede-red/10 text-speede-red flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm dark:text-white">
                  {isRot ? 'Ops Highlight' : isTh ? 'ไฮไลท์งานด่วน' : 'Job Market Highlights'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setActiveTab('Urgent')} 
                className={`p-3.5 bg-gray-50 dark:bg-speede-black/40 rounded-2xl border border-gray-100 dark:border-gray-800/80 cursor-pointer hover:scale-105 transition-all ${
                  activeTab === 'Urgent' ? 'ring-2 ring-speede-red bg-speede-red/5' : ''
                }`}
                title={isTh ? 'คลิกเพื่อดูเฉพาะงานด่วน' : 'Click to filter urgent jobs'}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isTh ? 'งานด่วนพิเศษ' : 'Urgent Tasks'}
                </div>
                <div className="text-xl font-extrabold text-speede-red mt-1 flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-current" /> {urgentJobsCount}
                </div>
              </div>

              <div 
                onClick={() => setSortBy('salaryHigh')}
                className={`p-3.5 bg-gray-50 dark:bg-speede-black/40 rounded-2xl border border-gray-100 dark:border-gray-800/80 cursor-pointer hover:scale-105 transition-all ${
                  sortBy === 'salaryHigh' ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : ''
                }`}
                title={isTh ? 'คลิกเพื่อจัดเรียงตามรายได้สูงสุด' : 'Click to sort by highest payout'}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isRot ? 'Big Bag' : isTh ? 'รายได้สูงสุด' : 'Highest Payout'}
                </div>
                <div className="text-xl font-extrabold text-emerald-500 mt-1">
                  ฿{maxSalary.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Community / Messaging Banner */}
          <div className="theme-panel p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h4 className="font-bold text-sm">{isTh ? 'ชุมชนผู้ใช้งาน' : 'Active Community'}</h4>
              </div>
              <span className="px-2 py-0.5 bg-white/20 text-[10px] font-bold rounded-full">Live</span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              {isTh ? 'ต้องการสอบถามหรือพูดคุยเรื่องงานกับผู้จ้าง? เริ่มการแชทได้ทันที' : 'Looking to chat or ask details about a job? Connect with employers directly.'}
            </p>
            <button
              onClick={() => {
                if (!user) showAuthModal();
                else navigate('/chat');
              }}
              className="w-full py-2.5 bg-white text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isTh ? 'เปิดหน้าข้อความ' : 'Open Messages'}</span>
            </button>
          </div>
        </div>
        {/* End Desktop Right Sidebar */}
      </div>
      {/* End Grid Container */}

      <AnimatePresence>
        {detailedJob && (
          <JobDetailsModal 
            job={detailedJob} 
            onClose={() => setDetailedJob(null)}
            onApply={() => {
              if (!user) {
                showAuthModal();
                return;
              }
              setDetailedJob(null);
              setSelectedJob(detailedJob);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedJob && (
          <ApplicationModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
            onSuccess={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-speede-black text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium z-50 whitespace-nowrap"
          >
            {isRot ? 'Secured the bag. Based.' : isTh ? 'ส่งใบสมัครสำเร็จแล้ว!' : 'Application sent successfully!'}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
