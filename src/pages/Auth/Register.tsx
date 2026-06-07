import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function Register() {
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHuman) {
      setError(isRot ? 'Confirm you are a real one first.' : isTh ? 'กรุณายืนยันว่าคุณไม่ใช่บอท' : 'Please confirm you are human.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, name, phone);
      setIsLoading(false);
      navigate('/feed');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{isRot ? 'Spawn In 🌍' : isTh ? 'สร้างบัญชี' : 'Create an Account'}</CardTitle>
        <p className="text-center text-sm text-gray-500 mt-2">{isRot ? 'Join the grind today fr.' : isTh ? 'เข้าร่วมกับ SpeedE วันนี้' : 'Join the SpeedE community today.'}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium dark:bg-red-900/30 dark:border-red-900 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Main Character Name' : isTh ? 'ชื่อ-นามสกุล' : 'Full Name'}</label>
            <Input 
              type="text" 
              placeholder={isRot ? "John Based" : isTh ? "สมชาย ใจดี" : "Somchai K."} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Your @' : isTh ? 'อีเมล' : 'Email'}</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Comms 📱' : isTh ? 'เบอร์โทรศัพท์' : 'Phone Number'}</label>
            <Input 
              type="tel" 
              placeholder="08X-XXX-XXXX" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="human" 
              checked={isHuman}
              onChange={(e) => setIsHuman(e.target.checked)}
              className="w-4 h-4 text-speede-red rounded border-gray-300 focus:ring-speede-red dark:border-gray-700 dark:bg-speede-black"
            />
            <label htmlFor="human" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRot ? 'I am not an NPC 🤖🚫' : isTh ? 'ฉันไม่ใช่โปรแกรมอัตโนมัติ' : 'I am human'}
            </label>
          </div>
          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            {isRot ? 'Create Save File' : isTh ? 'ลงทะเบียน' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">{isRot ? 'Already playing?' : isTh ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?'} </span>
          <Link to="/login" className="text-speede-red font-medium hover:underline">
            {isRot ? 'Log In' : isTh ? 'เข้าสู่ระบบ' : 'Sign In'}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
