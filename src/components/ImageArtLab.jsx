import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Palette, Hash, Circle, Type } from 'lucide-react';

export default function ImageArtLab({ onClose }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('halftone');
  const [density, setDensity] = useState(40);
  const [imageSrc, setImageSrc] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop');
  const [asciiText, setAsciiText] = useState('');

  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const containerWidth = canvas.parentElement.clientWidth || 500;
      const containerHeight = canvas.parentElement.clientHeight || 400;
      const ratio = Math.min(containerWidth / img.width, containerHeight / img.height);
      const w = Math.floor(img.width * ratio);
      const h = Math.floor(img.height * ratio);
      
      canvas.width = w;
      canvas.height = h;

      if (mode === 'original') {
        ctx.drawImage(img, 0, 0, w, h);
        setAsciiText('');
        return;
      }

      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      offCanvas.width = w;
      offCanvas.height = h;
      offCtx.drawImage(img, 0, 0, w, h);
      const imgData = offCtx.getImageData(0, 0, w, h).data;

      ctx.clearRect(0, 0, w, h);
      
      const step = Math.max(4, Math.floor(100 - density));
      let asciiStr = '';
      const chars = ' .:-=+*#%@';

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a === 0) {
            if (mode === 'ascii') asciiStr += ' ';
            continue;
          }

          const brightness = (r + g + b) / 3;
          
          if (mode === 'halftone') {
            const radius = (1 - (brightness / 255)) * (step / 1.5);
            if (radius > 0.5) {
              ctx.beginPath();
              ctx.arc(x + step/2, y + step/2, radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.fill();
            }
          } else if (mode === 'ascii') {
            const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
            asciiStr += chars[charIdx];
          }
        }
        if (mode === 'ascii') asciiStr += '\n';
      }

      if (mode === 'ascii') {
        setAsciiText(asciiStr);
      } else {
        setAsciiText('');
      }
    };
    img.src = imageSrc;
  }, [imageSrc, mode, density]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-deep/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-5xl h-[85vh] bg-ink-deep border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Controls Panel */}
        <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl flex items-center gap-2 text-parchment">
              <Palette size={18} className="text-philosophy-gold" /> Art Lab
            </h2>
            <button onClick={onClose} className="md:hidden text-ash hover:text-white"><X size={20} /></button>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-ash">1. Source Image</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-ash hover:text-parchment hover:border-parchment hover:bg-white/5 transition-all cursor-pointer"
            >
              <Upload size={20} className="mb-2" />
              <span className="text-xs font-medium">Upload Custom Photo</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            
            <div className="flex gap-2">
              <button onClick={() => setImageSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop')} className="flex-1 py-1.5 text-[11px] font-mono bg-white/5 hover:bg-white/10 rounded-lg text-parchment border border-white/5">Preset 1</button>
              <button onClick={() => setImageSrc('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop')} className="flex-1 py-1.5 text-[11px] font-mono bg-white/5 hover:bg-white/10 rounded-lg text-parchment border border-white/5">Preset 2</button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-ash">2. Render Mode</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => setMode('original')} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${mode === 'original' ? 'border-sage-signal bg-sage-signal/10 text-sage-signal font-semibold' : 'border-white/10 text-ash hover:bg-white/5'}`}>
                <Circle size={16} /> <span className="text-xs">Original</span>
              </button>
              <button onClick={() => setMode('halftone')} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${mode === 'halftone' ? 'border-clay-thread bg-clay-thread/10 text-clay-thread font-semibold' : 'border-white/10 text-ash hover:bg-white/5'}`}>
                <Hash size={16} /> <span className="text-xs">Pixel Halftone</span>
              </button>
              <button onClick={() => setMode('ascii')} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${mode === 'ascii' ? 'border-dusk-lavender bg-dusk-lavender/10 text-dusk-lavender font-semibold' : 'border-white/10 text-ash hover:bg-white/5'}`}>
                <Type size={16} /> <span className="text-xs">ASCII Matrix</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-ash">3. Density / Grid</h3>
            <input 
              type="range" min="10" max="95" 
              value={density} onChange={(e) => setDensity(Number(e.target.value))}
              className="w-full accent-sage-signal"
            />
          </div>
        </div>

        {/* Right Canvas Area */}
        <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 hidden md:block text-ash hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md z-10"><X size={20} /></button>
          
          <div className="w-full h-full flex items-center justify-center relative">
            <canvas ref={canvasRef} className={`max-w-full max-h-full object-contain ${mode === 'ascii' ? 'hidden' : 'block'}`} />
            
            {mode === 'ascii' && asciiText && (
              <pre className="ascii-pre absolute inset-0 flex items-center justify-center text-center leading-none tracking-widest font-mono text-[9px] text-parchment overflow-auto">
                {asciiText}
              </pre>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <button onClick={onClose} className="px-6 py-2.5 bg-parchment text-ink-deep font-semibold text-sm rounded-full hover:bg-white transition-colors shadow-xl">
              Attach Art to Thought →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
