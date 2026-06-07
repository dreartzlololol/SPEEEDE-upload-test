import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(email, password);
      setIsLoading(false);
      if (success) {
        navigate('/feed');
      } else {
        setError(isRot ? 'Wrong email or password fam.' : isTh ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Incorrect email or password.');
      }
    } catch (err) {
      setIsLoading(false);
      setError(isRot ? 'Server issue fr' : isTh ? 'การเชื่อมต่อล้มเหลว' : 'Failed to connect to server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold dark:text-white">{isRot ? 'Welcome Back Chat 👋' : isTh ? 'ยินดีต้อนรับกลับ' : 'Welcome Back'}</h1>
        <p className="text-gray-500 mt-2">{isRot ? 'Log in to start grinding' : isTh ? 'เข้าสู่ระบบเพื่อหางานต่อ' : 'Sign in to continue to SpeedE'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium dark:bg-red-900/30 dark:border-red-900 dark:text-red-400">
            {error}
          </div>
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

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {isRot ? 'Let me in fr' : isTh ? 'เข้าสู่ระบบ' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-500">{isRot ? 'No account?' : isTh ? 'ยังไม่มีบัญชี?' : 'Don\'t have an account?'} </span>
        <Link to="/register" className="text-speede-red font-medium hover:underline">
          {isRot ? 'Spawn In' : isTh ? 'สมัครสมาชิก' : 'Sign up'}
        </Link>
      </div>
    </div>
  );
}
