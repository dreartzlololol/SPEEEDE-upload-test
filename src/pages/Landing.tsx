import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MapPin, Clock, Star } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/ui/PageTransition';

export default function Landing() {
  const { language } = useSettings();
  const { user } = useAuth();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const orbs = [
    { size: 400, x: '10%', y: '20%', delay: 0, color: 'from-speede-red/20 to-transparent' },
    { size: 300, x: '80%', y: '10%', delay: 1, color: 'from-speede-cyan/15 to-transparent' },
    { size: 250, x: '60%', y: '70%', delay: 2, color: 'from-speede-purple/15 to-transparent' },
    { size: 350, x: '5%', y: '75%', delay: 0.5, color: 'from-speede-red/15 to-transparent' },
  ];

  return (
    <PageTransition className="flex flex-col items-center justify-center py-10 overflow-hidden relative">
      {/* Floating orbs background */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-radial ${orb.color} pointer-events-none -z-10`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5 + i, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-speede-lightRed/40 via-transparent to-transparent -z-10 dark:from-speede-red/10" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl px-4 z-10"
      >
        <h1 className="text-5xl md:text-7xl font-display tracking-widest mb-6 uppercase text-theme-text">
          <span>{isRot ? 'Find local side quests,' : isTh ? 'ค้นหางานใกล้บ้าน,' : 'Find local jobs,'}</span> <br />
          <span className="text-theme-primary drop-shadow-sm">
            {isRot ? 'at SpeedE. No cap.' : isTh ? 'ที่ SpeedE' : 'at SpeedE.'}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          {isRot 
            ? 'The fastest way to connect with the ops and secure the bag in your area. Real ones only.' 
            : isTh 
            ? 'วิธีที่เร็วที่สุดในการเชื่อมต่อกับนายจ้างและผู้หางานในชุมชนของคุณ คนจริงๆ โอกาสจริงๆ' 
            : 'The fastest way to connect with local employers and job seekers in your Thai community. Real people, real opportunities.'}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={user ? "/feed" : "/register"}>
            <Button size="lg" className="w-full sm:w-auto shadow-glow group">
              {isRot ? 'Secure The Bag' : isTh ? 'เริ่มหาเงินเลย' : 'Start Earning Now'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/post-job">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              {isRot ? 'Drop A Quest' : isTh ? 'ลงประกาศงาน' : 'Post a Job'}
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4"
      >
        {[
          { 
            icon: MapPin, 
            title: isRot ? "Nearby Quests" : isTh ? "โอกาสใกล้ตัวคุณ" : "Nearby Opportunities", 
            desc: isRot ? "Find ops in your hood using our map fr." : isTh ? "ค้นหางานในละแวกบ้านของคุณผ่านแผนที่แบบอินเทอร์แอกทีฟ" : "Find jobs right in your neighborhood using our interactive map." 
          },
          { 
            icon: Clock, 
            title: isRot ? "Speedrun Hiring" : isTh ? "จ้างงานรวดเร็ว" : "Fast Hiring", 
            desc: isRot ? "Connect instantly. Skip the yapping, straight to the grind." : isTh ? "เชื่อมต่อได้ทันที ไม่ต้องสัมภาษณ์ยาว เริ่มงานได้เลย" : "Connect instantly. No long interviews, just get to work." 
          },
          { 
            icon: Star, 
            title: isRot ? "Vibe Checked" : isTh ? "เชื่อถือได้" : "Community Trusted", 
            desc: isRot ? "Verified profiles so you know they aren't sus." : isTh ? "โปรไฟล์ที่ยืนยันแล้วและรีวิวช่วยให้มั่นใจในความปลอดภัย" : "Verified profiles and reviews ensure a safe working environment." 
          }
        ].map((feature, i) => (
          <div key={i} className="theme-panel p-6 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-default">
            <div className="w-12 h-12 bg-theme-secondary rounded-[var(--theme-border-radius)] border-[var(--theme-border-width)] border-[var(--theme-border-color)] flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-theme-primary" />
            </div>
            <h3 className="text-xl font-display tracking-widest mb-2 text-theme-text">{feature.title}</h3>
            <p className="text-sm font-medium text-theme-muted">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </PageTransition>
  );
}
