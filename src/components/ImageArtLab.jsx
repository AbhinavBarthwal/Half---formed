import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Palette, Hash, Circle, Type, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useThoughts } from '../hooks/useThoughts.js';

export default function ImageArtLab({ onClose, onThoughtCreated }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('halftone');
  const [density, setDensity] = useState(65); // Default to higher pixel density
  const [imageSrc, setImageSrc] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop');
  const [caption, setCaption] = useState('');
  const [attaching, setAttaching] = useState(false);

  const { uploadCanvas } = useImageUpload();
  const { createThought } = useThoughts();

  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const containerWidth = Math.min(canvas.parentElement.clientWidth || 600, 800);
      const containerHeight = Math.min(canvas.parentElement.clientHeight || 500, 600);
      const ratio = Math.min(containerWidth / img.width, containerHeight / img.height);
      const w = Math.floor(img.width * ratio);
      const h = Math.floor(img.height * ratio);
      
      canvas.width = w;
      canvas.height = h;

      if (mode === 'original') {
        ctx.drawImage(img, 0, 0, w, h);
        return;
      }

      // Create offscreen canvas to sample pixels
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      offCanvas.width = w;
      offCanvas.height = h;
      offCtx.drawImage(img, 0, 0, w, h);
      const imgData = offCtx.getImageData(0, 0, w, h).data;

      // Dark background fill
      ctx.fillStyle = '#0E1411';
      ctx.fillRect(0, 0, w, h);
      
      // 2x Pixel Resolution multiplier (step scaled down for 2x crisp detail)
      const step = Math.max(2, Math.floor((100 - density) / 2));
      const chars = ' .:-=+*#%@';

      if (mode === 'ascii') {
        ctx.font = `${step}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
      }

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a === 0) continue;

          const brightness = (r + g + b) / 3;
          
          if (mode === 'halftone') {
            const radius = (1 - (brightness / 255)) * (step / 1.4);
            if (radius > 0.3) {
              ctx.beginPath();
              ctx.arc(x + step/2, y + step/2, radius, 0, Math.PI * 2);
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.fill();
            }
          } else if (mode === 'ascii') {
            const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
            const char = chars[charIdx];
            if (char && char !== ' ') {
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx.fillText(char, x + step/2, y + step/2);
            }
          }
        }
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

  const handleAttachThought = async () => {
    setAttaching(true);
    try {
      const imageUrl = await uploadCanvas(canvasRef.current, 'art_thoughts');

      const thought = await createThought({
        imageUrl,
        caption: caption.trim() || 'A half-formed visual reflection',
        artMode: mode,
      });

      setAttaching(false);
      onClose();
      if (onThoughtCreated) onThoughtCreated(thought);
    } catch (err) {
      alert('Error attaching thought: ' + err.message);
      setAttaching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-5xl max-h-[92vh] glass-3 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-black/10 dark:border-white/10 my-auto"
      >
        {/* Left Controls Panel */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto glass-2 max-h-[50vh] md:max-h-none">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl flex items-center gap-2 text-black dark:text-white font-black">
              <Palette size={18} className="text-crimson-700 dark:text-amber-400" /> Visual Art Lab
            </h2>
            <button onClick={onClose} className="md:hidden text-black dark:text-white p-1 font-black"><X size={20} /></button>
          </div>

          {/* 1. Source Image */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-black/70 dark:text-white/70 font-black">1. Source Photo</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border border-dashed border-black/20 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer font-black"
            >
              <Upload size={18} className="mb-1 text-crimson-700 dark:text-amber-400" />
              <span className="text-xs font-mono">Upload Custom Photo</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            
            <div className="flex gap-2 pt-1">
              <button onClick={() => setImageSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop')} className="flex-1 py-1.5 text-[11px] font-mono font-black bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-xl text-black dark:text-white border border-black/10 dark:border-white/10 transition-colors">Preset 1</button>
              <button onClick={() => setImageSrc('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop')} className="flex-1 py-1.5 text-[11px] font-mono font-black bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-xl text-black dark:text-white border border-black/10 dark:border-white/10 transition-colors">Preset 2</button>
            </div>
          </div>

          {/* 2. Render Mode */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-black/70 dark:text-white/70 font-black">2. Filter Effect</h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setMode('original')} className={`p-2.5 rounded-xl border text-center transition-all ${mode === 'original' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-black' : 'border-black/10 dark:border-white/10 text-black dark:text-white font-bold hover:bg-black/5'}`}>
                <Circle size={14} className="mx-auto mb-1" /> <span className="text-[11px] font-mono">Original</span>
              </button>
              <button onClick={() => setMode('halftone')} className={`p-2.5 rounded-xl border text-center transition-all ${mode === 'halftone' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-black' : 'border-black/10 dark:border-white/10 text-black dark:text-white font-bold hover:bg-black/5'}`}>
                <Hash size={14} className="mx-auto mb-1" /> <span className="text-[11px] font-mono">Halftone</span>
              </button>
              <button onClick={() => setMode('ascii')} className={`p-2.5 rounded-xl border text-center transition-all ${mode === 'ascii' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-black' : 'border-black/10 dark:border-white/10 text-black dark:text-white font-bold hover:bg-black/5'}`}>
                <Type size={14} className="mx-auto mb-1" /> <span className="text-[11px] font-mono">ASCII</span>
              </button>
            </div>
          </div>

          {/* 3. Density */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-black/70 dark:text-white/70 font-black">
              <span>3. 2x Pixel Density</span>
              <span className="text-black dark:text-white font-mono">{density}%</span>
            </div>
            <input 
              type="range" min="10" max="96" 
              value={density} onChange={(e) => setDensity(Number(e.target.value))}
              className="w-full accent-black dark:accent-white cursor-pointer"
            />
          </div>

          {/* 4. Add Thought Caption */}
          <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-black/70 dark:text-white/70 font-black flex items-center gap-1">
              <MessageSquare size={12} className="text-crimson-700 dark:text-amber-400" /> Attach Thought
            </h3>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add your initial thought to this art piece..."
              rows={2}
              className="w-full glass-input rounded-xl p-2.5 text-xs outline-none resize-none font-bold text-black dark:text-white"
            />
          </div>

          {/* Desktop attach CTA */}
          <button
            onClick={handleAttachThought}
            disabled={attaching}
            className="hidden md:flex w-full py-3 bg-black text-white dark:bg-white dark:text-black font-black text-xs rounded-2xl hover:opacity-90 transition-all shadow-xl items-center justify-center gap-2 mt-auto disabled:opacity-50 interactive-scale"
          >
            {attaching ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={14} /> Turn Art into Thought →</>}
          </button>
        </div>

        {/* Right Canvas Display Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[350px] md:min-h-none overflow-hidden bg-black/50">
          <button onClick={onClose} className="absolute top-4 right-4 hidden md:block text-white hover:text-gray-200 bg-black/60 p-2 rounded-full backdrop-blur-md z-10 border border-white/20"><X size={18} /></button>
          
          <div className="w-full h-full flex items-center justify-center relative my-auto">
            <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-white/20 block" />
          </div>

          {/* Mobile attach CTA */}
          <div className="w-full md:hidden pt-4 mt-auto">
            <button
              onClick={handleAttachThought}
              disabled={attaching}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-black text-xs rounded-2xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {attaching ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={14} /> Turn Art into Thought →</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
