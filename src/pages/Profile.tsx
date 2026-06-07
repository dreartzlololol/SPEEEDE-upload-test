import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, CheckCircle, Edit3, LogOut, Save, X, Camera, Clock, Briefcase, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth, User } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJobs, Application } from '@/contexts/JobContext';
import { useSettings } from '@/contexts/SettingsContext';
import ImageCropper from '@/components/ui/ImageCropper';
import { PageTransition } from '@/components/ui/PageTransition';
import { ReviewApplicationModal } from '@/components/jobs/ReviewApplicationModal';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';
  const { jobs, applications } = useJobs();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'About' | 'History' | 'Search'>('About');
  const [selectedReviewApp, setSelectedReviewApp] = useState<Application | null>(null);

  // Search other users state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchUser, setSelectedSearchUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleTabChange = (tab: 'About' | 'History' | 'Search') => {
    setActiveTab(tab);
    if (tab === 'Search') {
      fetchUsers();
    }
  };

  const filteredUsers = searchQuery.trim() === ''
    ? []
    : usersList.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) && u.email !== user?.email
      );

  const handleStartChat = () => {
    if (selectedSearchUser) {
      const targetUser = selectedSearchUser;
      setSelectedSearchUser(null);
      navigate('/chat', { state: { startChatWith: targetUser } });
    }
  };

  const myApplications = applications.filter(app => app.applicantName === user?.name);
  const myPostedJobs = jobs.filter(job => job.employer === user?.name);
  const myPostedJobIds = myPostedJobs.map(job => job.id);
  const receivedApplications = applications.filter(app => myPostedJobIds.includes(app.jobId));

  const handleEditClick = () => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio);
      setEditAvatar(user.avatar);
      setEditSkills(user.skills);
      setIsEditing(true);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!editSkills.includes(newSkill.trim())) {
        setEditSkills([...editSkills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter(s => s !== skillToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateUser({ name: editName, bio: editBio, avatar: editAvatar, skills: editSkills });
      setIsEditing(false);
    } catch (err) {
      alert(isRot ? 'Failed to save profile lore.' : isTh ? 'บันทึกโปรไฟล์ล้มเหลว' : 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold dark:text-white">{isRot ? 'Bro who are you 💀' : isTh ? 'คุณยังไม่ได้เข้าสู่ระบบ' : 'You are not logged in'}</h2>
        <Button onClick={() => navigate('/login')}>{isRot ? 'Identify Yourself' : isTh ? 'เข้าสู่ระบบ' : 'Sign In'}</Button>
      </div>
    );
  }

  return (
    <PageTransition className="max-w-2xl mx-auto pb-20 space-y-6">
      {/* Profile Header */}
      <div
        className="theme-panel p-6 text-center relative mt-10"
      >
        {!isEditing ? (
          <Button variant="ghost" size="sm" className="absolute top-4 right-4 rounded-full w-10 h-10 p-0" onClick={handleEditClick}>
            <Edit3 className="w-5 h-5" />
          </Button>
        ) : (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 text-gray-500" onClick={() => setIsEditing(false)}>
              <X className="w-5 h-5" />
            </Button>
            <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-green-500 hover:bg-green-600 text-white" onClick={handleSave}>
              <Save className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        <div 
          className="w-24 h-24 mx-auto -mt-16 mb-4 rounded-full border-4 border-white dark:border-speede-darkGray overflow-hidden bg-gray-200 dark:bg-gray-700 relative group cursor-pointer flex items-center justify-center"
          onClick={() => isEditing && fileInputRef.current?.click()}
        >
          {(isEditing ? editAvatar : user.avatar) ? (
            <img src={isEditing ? editAvatar : user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 select-none">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        
        {isEditing ? (
          <div className="space-y-3 px-4 mb-6">
            <Input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="text-center font-bold"
              placeholder={isRot ? "Main Character Name" : isTh ? "ชื่อของคุณ" : "Your Name"}
            />
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" /> Bangkok, Thailand
            </div>
            <textarea 
              value={editBio} 
              onChange={(e) => setEditBio(e.target.value)} 
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-speede-red dark:bg-speede-black dark:border-gray-800 dark:text-white"
              rows={3}
              placeholder={isRot ? "Drop your lore..." : isTh ? "แนะนำตัวเองสั้นๆ..." : "Tell us about yourself..."}
            />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold dark:text-white mb-1">{user.name}</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <MapPin className="w-4 h-4" /> Bangkok, Thailand
            </div>
            {user.bio ? (
              <p className="text-gray-600 dark:text-gray-300 mb-6 px-4">"{user.bio}"</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 mb-6 px-4 italic text-sm">
                {isRot ? 'No lore yet. Edit your profile!' : isTh ? 'ยังไม่มีข้อมูลแนะนำตัว' : 'No bio yet. Edit your profile!'}
              </p>
            )}
          </>
        )}
        
        <div className="flex justify-center gap-8 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white flex items-center justify-center gap-1">
              {user.rating > 0 ? (
                <>{user.rating} <Star className="w-5 h-5 text-yellow-500 fill-current" /></>
              ) : (
                <span className="text-base text-gray-400 dark:text-gray-500">—</span>
              )}
            </div>
            <span className="text-xs text-gray-500">{isRot ? 'W/L Ratio' : isTh ? 'คะแนน' : 'Rating'}</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">{user.completedJobs}</div>
            <span className="text-xs text-gray-500">{isRot ? 'Quests Beaten' : isTh ? 'งานที่สำเร็จ' : 'Jobs Done'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-px">
        <button 
          onClick={() => handleTabChange('About')}
          className={`pb-2 px-4 font-bold text-sm transition-colors relative ${activeTab === 'About' ? 'text-speede-red' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          {isRot ? 'Stats & Lore' : isTh ? 'เกี่ยวกับฉัน' : 'About'}
          {activeTab === 'About' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-speede-red" />}
        </button>
        <button 
          onClick={() => handleTabChange('History')}
          className={`pb-2 px-4 font-bold text-sm transition-colors relative ${activeTab === 'History' ? 'text-speede-red' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          {isRot ? 'Quest Logs' : isTh ? 'ประวัติ' : 'History'}
          {activeTab === 'History' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-speede-red" />}
        </button>
        <button 
          onClick={() => handleTabChange('Search')}
          className={`pb-2 px-4 font-bold text-sm transition-colors relative ${activeTab === 'Search' ? 'text-speede-red' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          {isRot ? 'Find Homies' : isTh ? 'ค้นหาผู้ใช้' : 'Search'}
          {activeTab === 'Search' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-speede-red" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'About' && (
          <motion.div 
            key="about"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Skills */}
            <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-speede-red" /> {isRot ? 'Stats' : isTh ? 'ทักษะ' : 'Skills'}
              </h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-speede-red text-white text-sm rounded-full font-medium flex items-center gap-1">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer hover:text-red-200" onClick={() => handleRemoveSkill(skill)} />
                      </span>
                    ))}
                  </div>
                  <Input 
                    placeholder={isRot ? "Type a stat and smash Enter..." : isTh ? "พิมพ์ทักษะแล้วกด Enter..." : "Type a skill and press Enter..."} 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skills.length > 0 ? (
                    user.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-speede-black text-sm rounded-full font-medium dark:text-gray-300">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      {isRot ? 'No stats yet. Flex on \'em!' : isTh ? 'ยังไม่มีทักษะ กดแก้ไขเพื่อเพิ่ม' : 'No skills yet. Edit your profile to add some!'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold mb-4 dark:text-white">{isRot ? 'Vibe Checks' : isTh ? 'รีวิวล่าสุด' : 'Recent Reviews'}</h3>
              <div className="space-y-4">
                {user.reviews.length > 0 ? (
                  user.reviews.map(review => (
                    <div key={review.id} className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm dark:text-white">{review.reviewer}</span>
                        <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">"{review.text}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {isRot ? 'No vibe checks yet. Grind more!' : isTh ? 'ยังไม่มีรีวิว' : 'No reviews yet. Complete some jobs to earn reviews!'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'History' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* My Posted Jobs */}
            <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-speede-red" /> {isRot ? 'Quests Dropped' : isTh ? 'งานที่คุณประกาศ' : 'Jobs Posted by You'}
              </h3>
              {myPostedJobs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {isRot ? "You haven't dropped any quests yet." : isTh ? "คุณยังไม่ได้ประกาศงานใดๆ" : "You haven't posted any jobs yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {myPostedJobs.map(job => (
                    <div key={job.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm dark:text-white">{job.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {job.time}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-speede-red">{job.salary}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Applications */}
            <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-speede-red" /> {isRot ? 'Active Quests' : isTh ? 'งานที่สมัคร' : 'Your Applications'}
              </h3>
              {myApplications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {isRot ? "You haven't tried to secure any bags yet." : isTh ? "คุณยังไม่ได้สมัครงานใดๆ" : "You haven't applied to any jobs yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {myApplications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    return (
                      <div key={app.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium text-sm dark:text-white">{job?.title || 'Unknown Job'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(app.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === 'accepted' && job && (
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full transition-colors"
                            >
                              <MapPin className="w-3 h-3" />
                              {isRot ? 'GPS to Ops' : isTh ? 'นำทาง GPS' : 'Navigate'}
                            </a>
                          )}
                          <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                            app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                          }`}>
                            {app.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Received Applications */}
            <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-speede-red" /> {isRot ? 'Applicants & vibe checks' : isTh ? 'ใบสมัครที่ได้รับ' : 'Received Applications'}
              </h3>
              {receivedApplications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {isRot ? "No one applied to your quests yet." : isTh ? "ยังไม่มีผู้สมัครงานของคุณ" : "No one has applied to your jobs yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {receivedApplications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    return (
                      <div 
                        key={app.id} 
                        onClick={() => setSelectedReviewApp(app)}
                        className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-speede-black/30 p-2 rounded-2xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.applicantName}`} alt="avatar" />
                          </div>
                          <div>
                            <div className="font-bold text-sm dark:text-white">{app.applicantName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {isRot ? 'Applied for:' : isTh ? 'สมัครงาน:' : 'Applied for:'} <span className="text-speede-red font-semibold">{job?.title}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                            app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                          }`}>
                            {app.status.toUpperCase()}
                          </div>
                          {app.status === 'pending' && (
                            <Button size="sm" className="h-7 text-xs rounded-lg px-2">
                              {isRot ? 'Vibe Check' : isTh ? 'ตรวจทาน' : 'Review'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'Search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 theme-panel">
              <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                {isRot ? 'Find the Homies 🔍' : isTh ? 'ค้นหาผู้ใช้รายอื่น' : 'Search Other Users'}
              </h3>
              <Input
                placeholder={isRot ? "Type name no cap..." : isTh ? "ค้นหาด้วยชื่อผู้ใช้..." : "Search by user name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Results */}
            <div className="space-y-4">
              {loadingUsers ? (
                <p className="text-center text-gray-500 italic py-8">
                  {isRot ? 'Loading lore...' : isTh ? 'กำลังค้นหา...' : 'Searching...'}
                </p>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-white dark:bg-speede-darkGray rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-800 theme-panel text-gray-500">
                  {searchQuery ? (isRot ? 'No one matching that vibe 💀' : isTh ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'No users found matching that name.') : (isRot ? 'Type a name to search...' : isTh ? 'กรุณาพิมพ์ชื่อเพื่อค้นหา' : 'Type a name to search for other users.')}
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div 
                    key={u.email}
                    onClick={() => setSelectedSearchUser(u)}
                    className="bg-white dark:bg-speede-darkGray rounded-3xl p-5 shadow-soft border border-gray-100 dark:border-gray-800 theme-panel hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-theme-border-color overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-gray-400 select-none">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg dark:text-white truncate">{u.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {u.rating > 0 && (
                          <div className="flex items-center text-yellow-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current mr-0.5" /> {u.rating}
                          </div>
                        )}
                        <span>{u.completedJobs} {isTh ? 'งานที่สำเร็จ' : 'jobs done'}</span>
                      </div>
                      {u.bio && <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1.5 italic">"{u.bio}"</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-4 flex justify-center">
        <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut className="w-5 h-5 mr-2" />
          {isRot ? 'Dip ✌️' : isTh ? 'ออกจากระบบ' : 'Log Out'}
        </Button>
      </div>

      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          onCropComplete={(croppedImage) => {
            setEditAvatar(croppedImage);
            setCropImageSrc(null);
          }}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* Other User Detail Modal */}
      <AnimatePresence>
        {selectedSearchUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-speede-darkGray w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-theme-border-color"
              style={{ boxShadow: 'var(--theme-shadow)' }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold dark:text-white">
                  {isRot ? 'User Card 💳' : isTh ? 'โปรไฟล์ผู้ใช้' : 'User Profile'}
                </h2>
                <button 
                  onClick={() => setSelectedSearchUser(null)} 
                  className="p-2 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-2 border-theme-border-color"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-theme-border-color overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {selectedSearchUser.avatar ? (
                      <img src={selectedSearchUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-gray-400 select-none">
                        {selectedSearchUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold dark:text-white mb-1">{selectedSearchUser.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 inline mr-1" /> Bangkok, Thailand
                  </p>
                  {selectedSearchUser.bio && (
                    <p className="mt-3 text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-speede-black/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                      "{selectedSearchUser.bio}"
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-8 border-t border-b border-gray-100 dark:border-gray-800 py-4">
                  <div className="text-center">
                    <div className="text-xl font-bold dark:text-white flex items-center justify-center gap-1">
                      {selectedSearchUser.rating > 0 ? (
                        <>{selectedSearchUser.rating} <Star className="w-4 h-4 text-yellow-500 fill-current" /></>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{isRot ? 'W/L Ratio' : isTh ? 'คะแนน' : 'Rating'}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold dark:text-white">{selectedSearchUser.completedJobs}</div>
                    <span className="text-xs text-gray-500">{isRot ? 'Quests Beaten' : isTh ? 'งานที่สำเร็จ' : 'Jobs Done'}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
                    {isRot ? 'Stats' : isTh ? 'ทักษะ' : 'Skills'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSearchUser.skills && selectedSearchUser.skills.length > 0 ? (
                      selectedSearchUser.skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-speede-black text-sm rounded-full font-medium dark:text-gray-300 border border-theme-border-color">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {isRot ? 'No stats.' : isTh ? 'ไม่มีข้อมูลทักษะ' : 'No skills listed.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
                    {isRot ? 'Vibe Checks' : isTh ? 'รีวิว' : 'Reviews'}
                  </h4>
                  <div className="space-y-3">
                    {selectedSearchUser.reviews && selectedSearchUser.reviews.length > 0 ? (
                      selectedSearchUser.reviews.map(review => (
                        <div key={review.id} className="p-3 bg-gray-50 dark:bg-speede-black/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-xs dark:text-white">{review.reviewer}</span>
                            <div className="flex text-yellow-500">
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">"{review.text}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        {isRot ? 'No vibe checks yet.' : isTh ? 'ยังไม่มีรีวิว' : 'No reviews yet.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-speede-black/50 shrink-0 flex">
                <Button 
                  className="w-full h-12 rounded-xl text-base font-bold bg-speede-red hover:bg-speede-red-dark text-white shadow-md shadow-speede-red/20 flex items-center justify-center"
                  onClick={handleStartChat}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isRot ? 'Yap with \'em (Chat) 💬' : isTh ? 'ส่งข้อความ (ทักแชท)' : 'Start Chat'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedReviewApp && (
          <ReviewApplicationModal
            application={selectedReviewApp}
            onClose={() => setSelectedReviewApp(null)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
