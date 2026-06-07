import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, DollarSign, Map as MapIcon, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createCustomIcon } from '@/lib/mapIcon';
import { PageTransition } from '@/components/ui/PageTransition';

function LocationMarker({ position, setPosition, onLocationSelect }: { position: [number, number], setPosition: (pos: [number, number]) => void, onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={createCustomIcon(false)} /> : null;
}

export default function JobPosting() {
  const [isLoading, setIsLoading] = useState(false);
  const { addJob } = useJobs();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [category, setCategory] = useState('Labor');
  const [location, setLocation] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [image, setImage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [copied, setCopied] = useState(false);

  // Default coordinate center (Photharam)
  const [coordinates, setCoordinates] = useState<[number, number]>([13.6922, 99.8536]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const generatedLink = `https://www.google.com/maps?q=${latStr},${lngStr}`;
    setMapLink(generatedLink);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
      const data = await res.json();
      if (data && data.address) {
        const area = data.address.suburb || data.address.town || data.address.city || data.address.village || data.address.county;
        const province = data.address.state || data.address.province;
        if (area && province) {
          setLocation(`${area}, ${province}`);
        } else if (data.display_name) {
          const parts = data.display_name.split(',');
          setLocation(`${parts[0].trim()}, ${parts[parts.length - 1].trim()}`);
        } else {
          setLocation('');
        }
      } else {
        setLocation('');
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCopy = () => {
    if (mapLink) {
      navigator.clipboard.writeText(mapLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addJob({
        title,
        description,
        salary,
        location,
        time: 'Just now',
        employer: user?.name || 'Current User',
        employerEmail: user?.email || '',
        employerRating: 5.0,
        category: category,
        image: image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        lat: coordinates[0],
        lng: coordinates[1],
        isUrgent
      });

      setIsLoading(false);
      navigate('/feed');
    } catch (err) {
      setIsLoading(false);
      alert(isRot ? 'Failed to drop quest.' : isTh ? 'ลงประกาศงานล้มเหลว' : 'Failed to publish job.');
    }
  };

  return (
    <PageTransition className="max-w-2xl mx-auto pb-20">
      <h1 className="text-4xl font-display tracking-widest mb-6 text-theme-text">{isRot ? 'Drop a Quest 🔥' : isTh ? 'ลงประกาศงาน' : 'Post a Job'}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{isRot ? 'The Deets' : isTh ? 'รายละเอียดงาน' : 'Job Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Image Upload Area */}
            <div
              className="w-full h-40 border-[var(--theme-border-width)] border-dashed border-[var(--theme-border-color)] bg-theme-secondary/20 rounded-[var(--theme-border-radius)] flex flex-col items-center justify-center text-theme-text hover:bg-theme-secondary/40 transition-all cursor-pointer overflow-hidden relative"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">{isRot ? 'Swap Fit' : isTh ? 'เปลี่ยนรูปภาพ' : 'Change Photo'}</span>
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{isRot ? 'Add Drip' : isTh ? 'เพิ่มรูปภาพ' : 'Add Photo'}</span>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="space-y-1">
              <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Title of the Yap' : isTh ? 'ชื่องาน' : 'Job Title'}</label>
              <Input
                placeholder={isRot ? "e.g. Need a bro to move my couch" : isTh ? "เช่น ต้องการคนช่วยย้ายของ" : "e.g. Need help moving furniture"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'The Lore' : isTh ? 'รายละเอียด' : 'Description'}</label>
              <textarea
                className="w-full theme-input px-4 py-3 text-base font-bold placeholder:opacity-50 min-h-[100px]"
                placeholder={isRot ? "Spit your fax about the job..." : isTh ? "อธิบายสิ่งที่คุณต้องการให้ทำ..." : "Describe what needs to be done..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'The Bag 💰' : isTh ? 'ค่าจ้าง' : 'Salary / Pay'}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-9"
                    placeholder={isRot ? "e.g. 500 V-Bucks" : isTh ? "เช่น 500฿" : "e.g. 500฿"}
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Job Type' : isTh ? 'หมวดหมู่' : 'Category'}</label>
                <select
                  className="w-full theme-input px-4 py-2.5 text-base font-bold"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Labor">{isRot ? 'Gym Bros' : isTh ? 'ใช้แรงงาน' : 'Labor'}</option>
                  <option value="Delivery">{isRot ? 'UberEats' : isTh ? 'ส่งของ' : 'Delivery'}</option>
                  <option value="Handyman">{isRot ? 'Bob the Builder' : isTh ? 'ช่างซ่อม' : 'Handyman'}</option>
                  <option value="Tutoring">{isRot ? 'Yapping Lesson' : isTh ? 'สอนพิเศษ' : 'Tutoring'}</option>
                  <option value="Design">{isRot ? 'Aura Editing' : isTh ? 'ออกแบบ' : 'Design'}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 theme-panel bg-theme-secondary/20 hover:translate-y-[-2px] transition-all">
              <input
                type="checkbox"
                id="isUrgent"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-5 h-5 text-speede-red rounded focus:ring-speede-red"
              />
              <div className="flex flex-col">
                <label htmlFor="isUrgent" className="text-sm font-bold text-red-700 dark:text-red-400">
                  {isRot ? '911 Op (Urgent) 🚨' : isTh ? 'งานด่วนพิเศษ' : 'Mark as Urgent'}
                </label>
                <span className="text-xs text-red-600/80 dark:text-red-400/80">
                  {isRot ? 'Get pushed to the top of the feed no cap.' : isTh ? 'งานจะถูกแสดงในหมวดหมู่งานด่วนให้เห็นชัดเจนขึ้น' : 'Job will be highlighted and moved to the Urgent tab.'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Where we dropping?' : isTh ? 'ชื่อสถานที่' : 'Location Label'}</label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isGeocoding ? 'text-speede-red animate-pulse' : 'text-gray-400'}`} />
                <Input
                  className="pl-9"
                  placeholder={isGeocoding ? (isRot ? "Cooking..." : isTh ? "กำลังค้นหาตำแหน่ง..." : "Locating...") : (isRot ? "Tilted Towers" : isTh ? "โพธาราม, ราชบุรี" : "Photharam, Ratchaburi")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium dark:text-gray-300">{isRot ? 'Google Maps Link (No Cap)' : isTh ? 'ลิงก์ Google Maps' : 'Google Maps Link'}</label>
              <div className="relative flex items-center">
                <Input
                  placeholder={isRot ? "Will autofill when you drop a pin..." : isTh ? "จะกรอกอัตโนมัติเมื่อปักหมุด..." : "Will autofill when you drop a pin..."}
                  value={mapLink}
                  readOnly
                  className="bg-gray-50 dark:bg-speede-black/50 text-gray-500 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 w-8 h-8 p-0"
                  onClick={handleCopy}
                  disabled={!mapLink}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />}
                </Button>
              </div>
            </div>

            {/* Map Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300 flex items-center gap-2">
                <MapIcon className="w-4 h-4" /> {isRot ? 'Pin the ops' : isTh ? 'ปักหมุดบนแผนที่' : 'Drop a Pin on the Map'}
              </label>
              <p className="text-xs text-gray-500">{isRot ? 'Tap anywhere on the map to set the exact job location.' : isTh ? 'แตะที่ใดก็ได้บนแผนที่เพื่อกำหนดตำแหน่งของงาน' : 'Tap anywhere on the map to set the exact job location.'}</p>
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 z-0 relative">
                <MapContainer center={[13.6922, 99.8536]} zoom={14} className="w-full h-full z-0">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={coordinates} setPosition={setCoordinates} onLocationSelect={handleLocationSelect} />
                </MapContainer>
              </div>
            </div>

            <Button type="submit" className="w-full mt-8" size="lg" isLoading={isLoading}>
              {isRot ? 'Send it fr fr' : isTh ? 'ลงประกาศงาน' : 'Publish Job'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
