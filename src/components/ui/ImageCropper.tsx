import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './Button';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteHandler = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels!);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-speede-darkGray rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold dark:text-white">Crop Image</h2>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full text-gray-500" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-gray-500" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value))
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <ZoomIn className="w-5 h-5 text-gray-500" />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1 rounded-xl" onClick={handleSave}>Crop & Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
