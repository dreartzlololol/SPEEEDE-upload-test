import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError('');
      setIsLoading(false);
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
    }
  }, [isAuthModalOpen, mode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          closeAuthModal();
        } else {
          setError(isRot ? 'Wrong email or password fam.' : isTh ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Incorrect email or password.');
        }
      } else {
        await register(email, password, name, phone);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || (isRot ? 'Server issue fr' : isTh ? 'การเชื่อมต่อล้มเหลว' : 'Failed to connect to server.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-speede-darkGray rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold dark:text-white">
              {mode === 'login' 
                ? (isRot ? 'Welcome Back Chat 👋' : isTh ? 'เข้าสู่ระบบ' : 'Welcome Back')
                : (isRot ? 'Spawn In 🐣' : isTh ? 'สร้างบัญชีใหม่' : 'Create Account')
              }
            </h2>
            <button 
              onClick={closeAuthModal}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium dark:bg-red-900/30 dark:border-red-900 dark:text-red-400">
                  {error}
                </div>
              )}

              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'What they call u' : isTh ? 'ชื่อ-นามสกุล' : 'Full Name'}</label>
                    <Input 
                      type="text" 
                      placeholder={isRot ? "John Doe" : "John Doe"} 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Cell' : isTh ? 'เบอร์โทรศัพท์' : 'Phone Number'}</label>
                    <Input 
                      type="tel" 
                      placeholder={isRot ? "0812345678" : "0812345678"} 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required 
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Your @' : isTh ? 'อีเมล' : 'Email Address'}</label>
                <Input 
                  type="email" 
                  placeholder={isRot ? "you@based.com" : "you@example.com"} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Secret Code 🤫' : isTh ? 'รหัสผ่าน' : 'Password'}</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                {mode === 'login' 
                  ? (isRot ? 'Let me in fr' : isTh ? 'เข้าสู่ระบบ' : 'Sign In')
                  : (isRot ? 'Create Profile' : isTh ? 'สมัครสมาชิก' : 'Sign Up')
                }
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center text-sm mt-6">
              <span className="text-gray-500">
                {mode === 'login' 
                  ? (isRot ? 'No account?' : isTh ? 'ยังไม่มีบัญชี?' : "Don't have an account?")
                  : (isRot ? 'Already spawned in?' : isTh ? 'มีบัญชีอยู่แล้ว?' : "Already have an account?")
                }
              </span>
              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-speede-red font-medium hover:underline ml-1"
              >
                {mode === 'login' 
                  ? (isRot ? 'Spawn In' : isTh ? 'สมัครเลย' : 'Sign up')
                  : (isRot ? 'Let me in' : isTh ? 'เข้าสู่ระบบ' : 'Sign in')
                }
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
