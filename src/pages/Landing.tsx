import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MapPin, Clock, Star, DollarSign, CheckCircle, Search, Navigation } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/ui/PageTransition';

const LightningEffect = () => {
  // Realistic jagged lightning paths
  const path1 = "M 50 0 L 40 15 L 55 25 L 35 50 L 50 60 L 25 85 L 45 90 L 20 100";
  const path2 = "M 60 0 L 45 20 L 65 30 L 30 65 L 50 70 L 15 100";
  const path3 = "M 40 0 L 55 25 L 35 35 L 60 70 L 40 80 L 70 100";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Constant Background ambient flashes (Neutral, not red) */}
      <motion.div
        className="absolute inset-0 bg-white/10 dark:bg-white/5 mix-blend-overlay dark:mix-blend-lighten"
        animate={{ opacity: [0, 0, 0, 0.4, 0, 0] }}
        transition={{ 
          duration: 2.2, 
          times: [0, 0.5, 0.55, 0.6, 0.65, 1], 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      {/* Lightning Bolt 1 (Right Side) */}
      <div className="absolute top-[-5%] right-[5%] md:right-[15%] w-[150px] md:w-[250px] h-[110%] opacity-60">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_8px_var(--theme-primary)]">
          <motion.path
            d={path1}
            stroke="var(--theme-primary)"
            fill="none"
            initial={{ pathLength: 0, opacity: 0, strokeWidth: 0.2 }}
            animate={{ 
              pathLength: [0, 0, 1, 1, 1],
              opacity: [0, 0.8, 0.8, 1, 0],
              strokeWidth: [0.2, 0.2, 0.2, 2.5, 0],
            }}
            transition={{ 
              duration: 3.5, 
              times: [0, 0.75, 0.8, 0.85, 1], 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </svg>
      </div>
      
      {/* Lightning Bolt 2 (Far Left Side) */}
      <div className="absolute top-[-10%] left-[-5%] w-[200px] h-[120%] opacity-40 rotate-[20deg]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_5px_var(--theme-primary)]">
          <motion.path
            d={path2}
            stroke="var(--theme-primary)"
            fill="none"
            initial={{ pathLength: 0, opacity: 0, strokeWidth: 0.2 }}
            animate={{ 
              pathLength: [0, 0, 1, 1, 1],
              opacity: [0, 0.7, 0.7, 1, 0],
              strokeWidth: [0.2, 0.2, 0.2, 1.5, 0],
            }}
            transition={{ 
              duration: 2.2, 
              times: [0, 0.45, 0.55, 0.6, 1], 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </svg>
      </div>

      {/* Lightning Bolt 3 (Center Background) */}
      <div className="absolute top-0 left-[40%] w-[100px] h-[70%] opacity-20 -z-10 blur-[1px]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_10px_var(--theme-primary)]">
          <motion.path
            d={path3}
            stroke="var(--theme-primary)"
            fill="none"
            initial={{ pathLength: 0, opacity: 0, strokeWidth: 0.1 }}
            animate={{ 
              pathLength: [0, 0, 1, 1, 1],
              opacity: [0, 0.6, 0.6, 0.8, 0],
              strokeWidth: [0.1, 0.1, 0.1, 2, 0],
            }}
            transition={{ 
              duration: 4.8, 
              times: [0, 0.2, 0.25, 0.3, 1], 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </svg>
      </div>
    </div>
  );
};

export default function Landing() {
  const { language } = useSettings();
  const { user, showAuthModal } = useAuth();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const orbs = [
    { size: 500, x: '-10%', y: '10%', delay: 0, color: 'from-speede-red/20 to-transparent' },
    { size: 400, x: '70%', y: '40%', delay: 1, color: 'from-speede-cyan/15 to-transparent' },
    { size: 600, x: '30%', y: '60%', delay: 2, color: 'from-speede-purple/15 to-transparent' },
  ];

  return (
    <PageTransition className="flex flex-col items-center py-10 overflow-hidden relative min-h-[90vh] w-full">
      {/* Dotted Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.15] -z-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(var(--theme-text) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Floating orbs background */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-radial ${orb.color} pointer-events-none -z-10 blur-3xl`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          animate={{ y: [0, -40, 0], scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7 + i, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-speede-dark/50 dark:to-speede-dark -z-10 pointer-events-none" />
      
      <LightningEffect />
      
      {/* ---------------------------------- */}
      {/* HERO SECTION - SPLIT LAYOUT */}
      {/* ---------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 w-full mt-10 z-10 relative">
        
        {/* LEFT COLUMN: Text & Actions */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center text-center lg:text-left pt-10 lg:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-speede-red/10 text-speede-red text-xs md:text-sm font-bold mb-6 border border-speede-red/20 w-fit mx-auto lg:mx-0"
          >
            <span className="w-2 h-2 rounded-full bg-speede-red animate-pulse" />
            {isRot ? '100+ quests active rn' : isTh ? 'มีงานใหม่กว่า 100+ งานในพื้นที่คุณ' : '100+ active jobs in your area'}
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display tracking-widest mb-6 uppercase text-theme-text leading-tight">
            <span>{isRot ? 'Find local side quests,' : isTh ? 'ค้นหางานใกล้บ้าน,' : 'Find local jobs,'}</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-speede-red to-orange-500 drop-shadow-sm">
              {isRot ? 'at SpeedE.' : isTh ? 'ที่ SpeedE' : 'at SpeedE.'}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            {isRot 
              ? 'The fastest way to connect with the ops and secure the bag in your area. Real ones only. No cap.' 
              : isTh 
              ? 'วิธีที่เร็วที่สุดในการเชื่อมต่อกับนายจ้างและผู้หางานในชุมชนของคุณ คนจริงๆ โอกาสจริงๆ ทำงานวันนี้ ได้เงินวันนี้' 
              : 'The fastest way to connect with local employers and job seekers in your community. Real people, real opportunities.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {user ? (
              <Link to="/feed" className="w-full sm:w-auto">
                <Button size="lg" className="w-full shadow-xl shadow-speede-red/30 group hover:-translate-y-1 transition-all rounded-full px-8 py-6 text-lg bg-gradient-to-r from-speede-red to-rose-600 hover:from-speede-red hover:to-speede-red border-none">
                  {isRot ? 'Secure The Bag' : isTh ? 'เริ่มหาเงินเลย' : 'Start Earning Now'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Button onClick={showAuthModal} size="lg" className="w-full sm:w-auto shadow-xl shadow-speede-red/30 group hover:-translate-y-1 transition-all rounded-full px-8 py-6 text-lg bg-gradient-to-r from-speede-red to-rose-600 hover:from-speede-red hover:to-speede-red border-none">
                {isRot ? 'Secure The Bag' : isTh ? 'เริ่มหาเงินเลย' : 'Start Earning Now'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            {user ? (
              <Link to="/post-job" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full rounded-full px-8 py-6 text-lg border-2 theme-panel hover:bg-theme-secondary/50 transition-all">
                  {isRot ? 'Drop A Quest' : isTh ? 'ลงประกาศงาน' : 'Post a Job'}
                </Button>
              </Link>
            ) : (
              <Button onClick={showAuthModal} size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg border-2 theme-panel hover:bg-theme-secondary/50 transition-all">
                {isRot ? 'Drop A Quest' : isTh ? 'ลงประกาศงาน' : 'Post a Job'}
              </Button>
            )}
          </div>

          {/* Social Proof Mini */}
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map((i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-speede-dark bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e2e8f0`} alt="User" />
                 </div>
               ))}
             </div>
             <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
               <span className="text-theme-text font-bold">10k+</span> {isTh ? 'ผู้ใช้งานในระบบ' : 'Active Users'}
             </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Gorgeous App Mockup Composition */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="hidden lg:flex items-center justify-center h-[600px] perspective-1000"
        >
          {/* Wrapper to attach floating elements exactly to the phone */}
          <div className="relative">
             {/* Center Phone Frame */}
             <div className="relative w-[300px] h-[600px] theme-panel rounded-[3rem] border-[8px] border-white dark:border-gray-800 shadow-2xl overflow-hidden z-10 flex flex-col">
                {/* Fake Map Header */}
                <div className="h-48 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-speede-red/20 rounded-full"
                  />
                  <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-speede-red drop-shadow-lg" />
                  
                  {/* Fake Search Bar */}
                  <div className="absolute top-6 left-4 right-4 h-10 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full shadow-sm flex items-center px-4 gap-2">
                     <Search className="w-4 h-4 text-gray-400" />
                     <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                </div>

                {/* Fake Feed Content */}
                <div className="flex-1 bg-white dark:bg-[#1a1a1a] p-4 flex flex-col gap-4">
                   <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded-full mb-2" />
                   
                   {/* Job Card 1 */}
                   <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm relative">
                      <div className="flex justify-between items-start mb-3">
                         <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl" />
                         <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md">500 ฿</div>
                      </div>
                      <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                      <div className="w-1/2 h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
                   </div>

                   {/* Job Card 2 */}
                   <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm relative opacity-70">
                      <div className="flex justify-between items-start mb-3">
                         <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl" />
                         <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md">300 ฿</div>
                      </div>
                      <div className="w-2/3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                      <div className="w-1/3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
                   </div>
                </div>

                {/* Fake Bottom Nav */}
                <div className="h-16 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-2">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className={`w-8 h-8 rounded-full ${i === 2 ? 'bg-speede-red text-white' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                        {i === 2 ? <MapPin className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />}
                     </div>
                   ))}
                </div>
             </div>

             {/* Floating Elements ATTACHED to the Mockup */}
             <motion.div 
               animate={{ y: [-10, 10, -10] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute -left-16 top-32 z-20"
             >
               <div className="bg-white dark:bg-speede-darkGray p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 backdrop-blur-md">
                 <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                   <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">{isTh ? 'คุณได้รับงานแล้ว!' : 'You got hired!'}</p>
                   <p className="text-xs text-gray-500">SpeedE System</p>
                 </div>
               </div>
             </motion.div>

             <motion.div 
               animate={{ y: [10, -10, 10] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
               className="absolute -right-24 bottom-40 z-20"
             >
               <div className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-2 text-lg border-2 border-emerald-400">
                 <DollarSign className="w-5 h-5" />
                 500 ฿ / วัน
               </div>
             </motion.div>

             <motion.div 
               animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
               className="absolute -right-12 top-20 z-0 opacity-80"
             >
               <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-speede-red rounded-full blur-2xl opacity-40" />
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ---------------------------------- */}
      {/* FEATURES SECTION */}
      {/* ---------------------------------- */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 z-10"
      >
        {[
          { 
            icon: Navigation, 
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
          <div key={i} className="theme-panel p-8 flex flex-col items-start text-left hover:-translate-y-2 transition-transform cursor-default rounded-[2rem] border-[var(--theme-border-width)] border-[var(--theme-border-color)] group shadow-lg">
            <div className="w-14 h-14 bg-theme-secondary/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-theme-secondary/50 transition-all">
              <feature.icon className="w-7 h-7 text-theme-primary" />
            </div>
            <h3 className="text-2xl font-display tracking-widest mb-3 text-theme-text">{feature.title}</h3>
            <p className="text-base font-medium text-theme-muted leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* ---------------------------------- */}
      {/* APP DESCRIPTION SECTION */}
      {/* ---------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mt-32 w-full max-w-5xl px-4 text-center pb-32 z-10"
      >
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-speede-red blur-2xl opacity-20 rounded-full" />
          <h2 className="text-4xl md:text-6xl font-display tracking-wider text-theme-text relative">
            {isRot ? 'Built for the Ratchaburi Fam 🐉' : isTh ? 'แอพหางานอันดับ 1 ของชาวราชบุรี 🐉' : 'The #1 Job App in Ratchaburi 🐉'}
          </h2>
        </div>
        
        <div className="theme-panel p-10 md:p-16 rounded-[3rem] border border-[var(--theme-border-color)] shadow-2xl text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-speede-red/10 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -ml-32 -mb-32 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10">
            <p className="text-xl md:text-2xl text-theme-text leading-relaxed mb-8 font-medium">
              {isRot 
                ? "SpeedE is the absolute goat of gig apps designed exclusively for Ratchaburi. We're connecting the local mandem with local businesses. No more ghosting, no more cap, just pure grind and securing the bag."
                : isTh 
                ? "SpeedE คือแอปพลิเคชันหางานพาร์ทไทม์และงานชั่วคราวที่ออกแบบมาเพื่อชาวจังหวัดราชบุรีโดยเฉพาะ! เรามุ่งมั่นที่จะเชื่อมต่อคนทำงานกับธุรกิจและผู้ว่าจ้างในท้องถิ่น ไม่ว่าจะเป็นงานอีเวนต์ งานร้านอาหาร หรืองานบริการทั่วไป คุณสามารถหางานที่ใช่ใกล้บ้านได้ง่ายๆ บนแผนที่ของเรา"
                : "SpeedE is the premier part-time and temporary gig app designed exclusively for Ratchaburi province! We are dedicated to connecting local workers with local businesses. Whether it's event staffing, restaurant help, or general services, you can easily find the right job near you on our interactive map."}
            </p>
            
            <p className="text-xl md:text-2xl text-theme-muted leading-relaxed">
              {isRot
                ? "Whether you're looking for side quests at local cafes, event staffing, or just helping someone move their stuff, SpeedE gets you hired in seconds. Ratchaburi's finest, let's get this bread! 🍞"
                : isTh
                ? "เปลี่ยนเวลาว่างให้เป็นรายได้ ลดปัญหาการขาดแคลนคนทำงานกะทันหัน สร้างคอมมูนิตี้การทำงานที่โปร่งใสและไว้ใจได้ด้วยระบบรีวิวผู้ใช้ เพื่อเศรษฐกิจท้องถิ่นราชบุรีที่เติบโตไปด้วยกัน!"
                : "Turn your free time into income and help solve sudden staffing shortages. Build a transparent and trusted working community with our user review system, empowering Ratchaburi's local economy to grow together!"}
            </p>
          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
