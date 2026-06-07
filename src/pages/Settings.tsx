import { useSettings, Theme } from '@/contexts/SettingsContext';
import { useTutorial } from '@/contexts/TutorialContext';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card, CardContent } from '@/components/ui/Card';
import { Moon, Sun, Monitor, Globe, Palette, Bell, Sliders, Shield, Database, Download, Trash2, HelpCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { soundEffects } from '@/lib/soundEffects';

const COLORS = [
  { name: 'SpeedE Red', value: '#E52020' },
  { name: 'Grab Green', value: '#00B14F' },
  { name: 'Ocean Blue', value: '#0070F3' },
  { name: 'Sunset Orange', value: '#FF5A00' },
  { name: 'Royal Purple', value: '#7928CA' },
];

export default function Settings() {
  const { 
    theme, language, primaryColor, currency, distanceUnit, jobRadius, emailNotifs, soundNotifs, profileVisibility,
    setTheme, setLanguage, setPrimaryColor, setCurrency, setDistanceUnit, setJobRadius, setEmailNotifs, setSoundNotifs, setProfileVisibility 
  } = useSettings();
  
  const { startTutorial } = useTutorial();
  const [pushEnabled, setPushEnabled] = useState(true);
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();

  const [isInstallable, setIsInstallable] = useState(!!(window as any).deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
  );

  useEffect(() => {
    const handleInstallable = () => setIsInstallable(true);
    window.addEventListener('pwa-installable', handleInstallable);
    
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDownload = () => {
    soundEffects.play('click', theme, language);
    
    // Determine installer file name based on OS
    const userAgent = navigator.userAgent.toLowerCase();
    let fileName = 'SpeedE-Setup.exe';
    
    if (/android/.test(userAgent)) {
      fileName = 'SpeedE.apk';
    } else if (/macintosh|mac os x/.test(userAgent)) {
      fileName = 'SpeedE-Installer.dmg';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      fileName = 'SpeedE.mobileconfig';
    }
    
    // Trigger download programmatically from direct server static asset
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show download started notification
    addNotification(
      isTh ? 'เริ่มดาวน์โหลดสำเร็จ! 📥' : isRot ? 'Downloading the setup! 📥' : 'Download Started! 📥',
      isTh ? `กำลังดาวน์โหลดไฟล์ติดตั้ง "${fileName}" สำหรับอุปกรณ์ของคุณ` : isRot ? `Downloading "${fileName}" for your device.` : `Downloading installer "${fileName}" for your device.`,
      'success'
    );
  };

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    (window as any).deferredPrompt = null;
    setIsInstallable(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleClearCache = () => {
    if (window.confirm('Are you sure? This will log you out and reset everything.')) {
      localStorage.clear();
      logout();
      window.location.href = '/login';
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = isRot 
      ? 'Are you absolutely sure you want to nuke your account? There is no going back fr fr.' 
      : isTh 
        ? 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณอย่างถาวร? การดำเนินการนี้ไม่สามารถย้อนกลับได้' 
        : 'Are you absolutely sure you want to permanently delete your account? This action is irreversible.';
        
    if (window.confirm(confirmMsg)) {
      try {
        const response = await fetch('/api/auth/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.email })
        });
        if (response.ok) {
          localStorage.clear();
          logout();
          window.location.href = '/login';
        } else {
          let errMsg = 'Failed to delete account';
          try {
            const errData = await response.json();
            errMsg = errData.error || errMsg;
          } catch (_) {}
          alert(errMsg);
        }
      } catch (err) {
        console.error('Error deleting account:', err);
        alert('Failed to delete account');
      }
    }
  };

  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-speede-red' : 'bg-gray-300 dark:bg-gray-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${enabled ? 'left-[26px]' : 'left-0.5'}`}></div>
    </button>
  );

  return (
    <PageTransition className="max-w-3xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">
          {isRot ? 'Settings (W Rizz)' : isTh ? 'การตั้งค่า' : 'Settings'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isRot ? 'Configure your looksmaxxing setup here fr fr no cap.' : 'Manage your app preferences, privacy, and account settings.'}
        </p>
      </div>

      {/* Appearance Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-theme-text">
          <Palette className="w-6 h-6 text-theme-primary" /> 
          {isRot ? 'Aesthetics' : 'Appearance'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-theme-muted mb-3 flex items-center gap-2">
                <Monitor className="w-4 h-4"/> Theme Preset
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(['light', 'dark', 'cartoon', 'scifi', 'steampunk', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex flex-col items-center justify-center p-3 rounded-[var(--theme-border-radius)] border-[var(--theme-border-width)] transition-all ${
                      theme === t ? 'border-theme-primary bg-theme-primary/10 scale-105' : 'border-theme-border hover:bg-theme-bg'
                    }`}
                  >
                    {t === 'light' && <Sun className={`w-5 h-5 mb-1 ${theme === t ? 'text-theme-primary' : 'text-theme-muted'}`} />}
                    {t === 'dark' && <Moon className={`w-5 h-5 mb-1 ${theme === t ? 'text-theme-primary' : 'text-theme-muted'}`} />}
                    {t === 'cartoon' && <div className="w-5 h-5 mb-1 text-2xl leading-none">🤪</div>}
                    {t === 'scifi' && <div className="w-5 h-5 mb-1 text-2xl leading-none">🤖</div>}
                    {t === 'steampunk' && <div className="w-5 h-5 mb-1 text-2xl leading-none">⚙️</div>}
                    {t === 'system' && <Monitor className={`w-5 h-5 mb-1 ${theme === t ? 'text-theme-primary' : 'text-theme-muted'}`} />}
                    <span className={`text-xs font-bold capitalize ${theme === t ? 'text-theme-primary' : 'text-theme-muted'}`}>{t}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 h-full flex flex-col justify-center">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2"><Palette className="w-4 h-4"/> {isRot ? 'Main Color' : isTh ? 'สีหลัก' : 'Accent Color'}</h3>
              <div className="flex flex-wrap gap-4">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setPrimaryColor(c.value)}
                    className={`w-10 h-10 rounded-full border-4 transition-transform ${
                      primaryColor === c.value ? 'border-gray-300 dark:border-gray-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Language Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Globe className="w-6 h-6 text-speede-red" /> Language
        </h2>
        <Card>
          <CardContent className="p-4 flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-2xl border-2 transition-all font-medium ${
                language === 'en' ? 'border-speede-red bg-red-50 dark:bg-speede-red/10 text-speede-red' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('th')}
              className={`flex-1 py-3 rounded-2xl border-2 transition-all font-medium ${
                language === 'th' ? 'border-speede-red bg-red-50 dark:bg-speede-red/10 text-speede-red' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              ภาษาไทย (Thai)
            </button>
            <button
              onClick={() => setLanguage('brainrot')}
              className={`flex-1 py-3 rounded-2xl border-2 transition-all font-bold tracking-tight ${
                language === 'brainrot' ? 'border-speede-red bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-transparent' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Gen Z 💀
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Preferences Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Sliders className="w-6 h-6 text-speede-red" /> 
          {isRot ? 'The Vibes' : 'Preferences'}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? 'Bags' : isTh ? 'สกุลเงิน' : 'Currency'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'Show the money in this format' : isTh ? 'แสดงงานในสกุลเงินที่เลือก' : 'Display jobs in selected currency'}</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-speede-black rounded-lg p-1">
                <button 
                  onClick={() => setCurrency('THB')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md ${currency === 'THB' ? 'bg-white dark:bg-speede-darkGray shadow text-speede-red' : 'text-gray-500'}`}
                >THB (฿)</button>
                <button 
                  onClick={() => setCurrency('USD')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md ${currency === 'USD' ? 'bg-white dark:bg-speede-darkGray shadow text-speede-red' : 'text-gray-500'}`}
                >USD ($)</button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? 'Map Math' : isTh ? 'หน่วยระยะทาง' : 'Distance Unit'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'How far the ops are' : isTh ? 'วัดระยะทางบนแผนที่' : 'Measure map distances'}</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-speede-black rounded-lg p-1">
                <button 
                  onClick={() => setDistanceUnit('km')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md ${distanceUnit === 'km' ? 'bg-white dark:bg-speede-darkGray shadow text-speede-red' : 'text-gray-500'}`}
                >Kilometers</button>
                <button 
                  onClick={() => setDistanceUnit('mi')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md ${distanceUnit === 'mi' ? 'bg-white dark:bg-speede-darkGray shadow text-speede-red' : 'text-gray-500'}`}
                >Miles</button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium dark:text-white">{isRot ? 'Spawn Radius' : isTh ? 'รัศมีการค้นหางาน' : 'Job Search Radius'}</p>
                  <p className="text-sm text-gray-500">{isRot ? 'How far you willing to travel' : isTh ? 'ระยะทางสูงสุดในการแสดงงาน' : 'Maximum distance to show jobs'}</p>
                </div>
                <span className="font-bold text-speede-red">{jobRadius} {distanceUnit}</span>
              </div>
              <input 
                type="range" 
                min="5" max="100" step="5" 
                value={jobRadius} 
                onChange={(e) => setJobRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>5 {distanceUnit}</span>
                <span>100 {distanceUnit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Notifications Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Bell className="w-6 h-6 text-speede-red" /> 
          {isRot ? 'Pings & Yaps' : 'Notifications'}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? 'Phone buzz' : isTh ? 'การแจ้งเตือนแบบพุช' : 'Push Notifications'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'When the ops hit you up' : isTh ? 'แจ้งเตือนบนอุปกรณ์ของคุณ' : 'Alerts on your device'}</p>
              </div>
              <Toggle enabled={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? 'Gmail spam' : isTh ? 'งานที่ตรงกันทางอีเมล' : 'Email Matches'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'Send side quests to email' : isTh ? 'ส่งงานที่ตรงกับทักษะของคุณไปยังอีเมล' : 'Send jobs matching your skills to email'}</p>
              </div>
              <Toggle enabled={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? 'Loud noises' : isTh ? 'เสียงในแอป' : 'In-App Sounds'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'Ding when yapping' : isTh ? 'เล่นเสียงเมื่อได้รับข้อความ' : 'Play sounds when receiving messages'}</p>
              </div>
              <Toggle enabled={soundNotifs} onChange={() => setSoundNotifs(!soundNotifs)} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Shield className="w-6 h-6 text-speede-red" /> {isRot ? 'Lock it down' : isTh ? 'ความเป็นส่วนตัวและความปลอดภัย' : 'Privacy & Security'}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? 'Who can perceive me' : isTh ? 'การมองเห็นโปรไฟล์' : 'Profile Visibility'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'Hide from the ops' : isTh ? 'ใครสามารถดูรายละเอียดโปรไฟล์ของคุณได้บ้าง' : 'Who can see your profile details'}</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-speede-black rounded-lg p-1">
                <button 
                  onClick={() => setProfileVisibility('public')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md ${profileVisibility === 'public' ? 'bg-white dark:bg-speede-darkGray shadow text-speede-red' : 'text-gray-500'}`}
                >Public</button>
                <button 
                  onClick={() => setProfileVisibility('private')} 
                  className={`px-3 py-1 text-sm font-medium rounded-md ${profileVisibility === 'private' ? 'bg-white dark:bg-speede-darkGray shadow text-speede-red' : 'text-gray-500'}`}
                >Private</button>
              </div>
            </div>
            <div className="p-4">
              <button className="text-sm font-medium text-speede-red hover:underline">{isRot ? 'Change the secret' : isTh ? 'เปลี่ยนรหัสผ่าน' : 'Change Password'}</button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{isRot ? '2FA (Sweat Mode)' : isTh ? 'การตรวจสอบสิทธิ์แบบสองปัจจัย' : 'Two-Factor Authentication'}</p>
                <p className="text-sm text-gray-500">{isRot ? 'Nobody stealing this acc' : isTh ? 'ปกป้องบัญชีด้วย 2FA' : 'Protect account with 2FA'}</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">{isRot ? 'Do it' : isTh ? 'ตั้งค่า' : 'Setup'}</button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* App Installation Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Download className="w-6 h-6 text-speede-red" /> {isRot ? 'Get App (W Rizz)' : isTh ? 'การติดตั้งแอป' : 'App Installation'}
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Always show Direct Download Button */}
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-500 to-speede-red text-white hover:opacity-90 transition-all shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold">{isRot ? 'Download Installer (Direct)' : isTh ? 'ดาวน์โหลดไฟล์ติดตั้งโดยตรง' : 'Download Installer (Direct)'}</p>
                  <p className="text-xs text-white/80">{isRot ? 'Get the installer package for your device' : isTh ? 'ดาวน์โหลดไฟล์ติดตั้งสำหรับระบบปฏิบัติการของคุณโดยตรง' : 'Get the native installer package for your OS'}</p>
                </div>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                {/android/.test(navigator.userAgent.toLowerCase()) ? '.apk' : /macintosh|mac os x/.test(navigator.userAgent.toLowerCase()) ? '.dmg' : /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ? '.mobileconfig' : '.exe'}
              </span>
            </button>

            {isInstalled ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium dark:text-white">{isRot ? 'Fully Installed fr' : isTh ? 'ติดตั้งแอปเรียบร้อยแล้ว' : 'App is Installed'}</p>
                  <p className="text-xs text-gray-500">{isRot ? 'You are running SpeedE from your home screen!' : isTh ? 'คุณกำลังใช้งานแอปบนหน้าจอหลักของคุณ' : 'You are running SpeedE directly from your home screen!'}</p>
                </div>
              </div>
            ) : (
              <>
                {isInstallable && (
                  <button 
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <Download className="w-5 h-5 text-speede-red" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-speede-red">{isRot ? 'Add to Home Screen' : isTh ? 'เพิ่มลงในหน้าจอหลัก (PWA)' : 'Add to Home Screen (PWA)'}</p>
                        <p className="text-xs text-gray-500">{isRot ? 'Pin SpeedE to your home screen' : isTh ? 'ติดตั้งเป็นเว็บแอปพลิเคชันบนอุปกรณ์ของคุณ' : 'Install SpeedE as a web app on your home screen.'}</p>
                      </div>
                    </div>
                  </button>
                )}
                
                {isIOS && (
                  <div className="p-3 space-y-2 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="font-medium dark:text-white text-sm">{isRot ? 'iOS Install Steps' : isTh ? 'วิธีติดตั้งบน iOS (Safari)' : 'How to Install on iOS (Safari)'}</p>
                    <ol className="list-decimal list-inside text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <li>{isRot ? 'Tap the Share button at the bottom of Safari' : isTh ? 'แตะปุ่ม "แชร์" (Share) ที่แถบด้านล่างของ Safari' : 'Tap the "Share" button at the bottom of Safari'}</li>
                      <li>{isRot ? 'Scroll down and tap "Add to Home Screen"' : isTh ? 'เลื่อนลงมาแล้วเลือก "เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)' : 'Scroll down and select "Add to Home Screen"'}</li>
                      <li>{isRot ? 'Name it SpeedE and tap Add!' : isTh ? 'ตั้งชื่อแอป SpeedE แล้วกดเพิ่ม!' : 'Tap "Add" in the top-right corner!'}</li>
                    </ol>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Help & Support Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <HelpCircle className="w-6 h-6 text-blue-500" /> {isRot ? 'Help Desk' : isTh ? 'ความช่วยเหลือ' : 'Help & Support'}
        </h2>
        <Card>
          <CardContent className="p-4">
            <button 
              onClick={() => startTutorial()}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-blue-500 dark:text-blue-400">{isRot ? 'Re-run Tutorial fr' : isTh ? 'ดูการสอนใช้งานอีกครั้ง' : 'Replay Tutorial'}</p>
                  <p className="text-xs text-gray-500">{isRot ? 'Forgot how to use the app? Start over.' : isTh ? 'แสดงหน้าจอแนะนำการใช้งานแอปพลิเคชันใหม่ตั้งแต่ต้น' : 'Restart the onboarding walkthrough from the beginning.'}</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Data Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Database className="w-6 h-6 text-speede-red" /> {isRot ? 'The Archives' : isTh ? 'ข้อมูลและพื้นที่เก็บข้อมูล' : 'Data & Storage'}
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium dark:text-white">{isRot ? 'Steal my own info' : isTh ? 'ดาวน์โหลดข้อมูลของฉัน' : 'Download My Data'}</p>
                  <p className="text-xs text-gray-500">{isRot ? 'Get the receipts' : isTh ? 'ส่งออกโปรไฟล์และประวัติการทำงานเป็น JSON' : 'Export your profile and job history as JSON'}</p>
                </div>
              </div>
            </button>
            <button 
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-red-500">{isRot ? 'Nuke everything 💣' : isTh ? 'ล้างแคชของแอป' : 'Clear App Cache'}</p>
                  <p className="text-xs text-red-400">{isRot ? 'Obliterate the save file' : isTh ? 'ออกจากระบบและลบข้อมูลในเบราว์เซอร์' : 'Log out and wipe local browser storage'}</p>
                </div>
              </div>
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/20 transition-colors border-2 border-dashed border-red-300 dark:border-red-900/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center border border-red-300 dark:border-red-850">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-red-600 dark:text-red-400">{isRot ? 'Nuke Account 💀' : isTh ? 'ลบบัญชีผู้ใช้' : 'Delete Account'}</p>
                  <p className="text-xs text-red-500 dark:text-red-400/80">{isRot ? 'Permanently wipe your existence fr' : isTh ? 'ลบบัญชีของคุณและข้อมูลทั้งหมดอย่างถาวร' : 'Permanently wipe your profile and credentials'}</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Footer info */}
      <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm font-bold dark:text-gray-300">SpeedE App</p>
        <p className="text-xs text-gray-500 mt-1">Version 1.0.42 (Beta)</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <button className="hover:text-speede-red flex items-center gap-1"><HelpCircle className="w-3 h-3"/> Help Center</button>
          <span>•</span>
          <button className="hover:text-speede-red">Terms of Service</button>
          <span>•</span>
          <button className="hover:text-speede-red">Privacy Policy</button>
        </div>
      </div>
    </PageTransition>
  );
}
