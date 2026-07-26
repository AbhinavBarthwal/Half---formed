import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Palette, Hash, Circle, Type, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useThoughts } from '../hooks/useThoughts.js';

export default function ImageArtLab({ onClose, onThoughtCreated }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('halftone');
  const [density, setDensity] = useState(40);
  const [imageSrc, setImageSrc] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop');
  const [asciiText, setAsciiText] = useState('');
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

  const handleAttachThought = async () => {
    setAttaching(true);
    try {
      let imageUrl = null;
      if (mode === 'ascii') {
        // Create offscreen canvas for ASCII render snapshot
        const asciiCanvas = document.createElement('canvas');
        asciiCanvas.width = 800;
        asciiCanvas.height = 600;
        const actx = asciiCanvas.getContext('2d');
        actx.fillStyle = '#0E1411';
        actx.fillRect(0, 0, 800, 600);
        actx.fillStyle = '#EDE6D3';
        actx.font = '10px monospace';
        const lines = asciiText.split('\n');
        lines.forEach((line, idx) => {
          actx.fillText(line, 20, 20 + idx * 10);
        });
        imageUrl = await uploadCanvas(asciiCanvas, 'ascii_thoughts');
      } else {
        imageUrl = await uploadCanvas(canvasRef.current, 'art_thoughts');
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-5xl max-h-[92vh] glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/15 my-auto"
      >
        {/* Left Controls Panel */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto bg-black/40 max-h-[50vh] md:max-h-none">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl flex items-center gap-2 text-parchment font-medium">
              <Palette size={18} className="text-philosophy-gold" /> Visual Art Lab
            </h2>
            <button onClick={onClose} className="md:hidden text-ash hover:text-white p-1"><X size={20} /></button>
          </div>

          {/* 1. Source Image */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-ash font-semibold">1. Source Photo</h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-ash hover:text-parchment hover:border-parchment hover:bg-white/5 transition-all cursor-pointer"
            >
              <Upload size={18} className="mb-1 text-sage-signal" />
              <span className="text-xs font-mono">Upload Custom Photo</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            
            <div className="flex gap-2 pt-1">
              <button onClick={() => setImageSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop')} className="flex-1 py-1.5 text-[11px] font-mono bg-white/5 hover:bg-white/10 rounded-xl text-parchment border border-white/10 transition-colors">Preset 1</button>
              <button onClick={() => setImageSrc('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop')} className="flex-1 py-1.5 text-[11px] font-mono bg-white/5 hover:bg-white/10 rounded-xl text-parchment border border-white/10 transition-colors">Preset 2</button>
            </div>
          </div>

          {/* 2. Render Mode */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-ash font-semibold">2. Filter Effect</h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setMode('original')} className={`p-2.5 rounded-xl border text-center transition-all ${mode === 'original' ? 'border-sage-signal bg-sage-signal/15 text-sage-signal font-semibold' : 'border-white/10 text-ash hover:bg-white/5'}`}>
                <Circle size={14} className="mx-auto mb-1" /> <span className="text-[11px] font-mono">Original</span>
              </button>
              <button onClick={() => setMode('halftone')} className={`p-2.5 rounded-xl border text-center transition-all ${mode === 'halftone' ? 'border-clay-thread bg-clay-thread/15 text-clay-thread font-semibold' : 'border-white/10 text-ash hover:bg-white/5'}`}>
                <Hash size={14} className="mx-auto mb-1" /> <span className="text-[11px] font-mono">Halftone</span>
              </button>
              <button onClick={() => setMode('ascii')} className={`p-2.5 rounded-xl border text-center transition-all ${mode === 'ascii' ? 'border-dusk-lavender bg-dusk-lavender/15 text-dusk-lavender font-semibold' : 'border-white/10 text-ash hover:bg-white/5'}`}>
                <Type size={14} className="mx-auto mb-1" /> <span className="text-[11px] font-mono">ASCII</span>
              </button>
            </div>
          </div>

          {/* 3. Density */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-ash">
              <span>3. Pixel Density</span>
              <span className="text-sage-signal">{density}%</span>
            </div>
            <input 
              type="range" min="10" max="95" 
              value={density} onChange={(e) => setDensity(Number(e.target.value))}
              className="w-full accent-sage-signal cursor-pointer"
            />
          </div>

          {/* 4. Add Thought Caption */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-ash font-semibold flex items-center gap-1">
              <MessageSquare size={12} className="text-philosophy-gold" /> Attach Thought
            </h3>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add your initial thought to this art piece..."
              rows={2}
              className="w-full glass-input rounded-xl p-2.5 text-xs text-parchment placeholder-ash/50 outline-none resize-none"
            />
          </div>

          {/* Desktop attach CTA */}
          <button
            onClick={handleAttachThought}
            disabled={attaching}
            className="hidden md:flex w-full py-3 bg-parchment text-ink-deep font-semibold text-xs rounded-2xl hover:bg-white transition-all shadow-xl items-center justify-center gap-2 mt-auto disabled:opacity-50"
          >
            {attaching ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={14} /> Turn Art into Thought →</>}
          </button>
        </div>

        {/* Right Canvas Display Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[350px] md:min-h-none overflow-hidden bg-black/20">
          <button onClick={onClose} className="absolute top-4 right-4 hidden md:block text-ash hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md z-10 border border-white/10"><X size={18} /></button>
          
          <div className="w-full h-full flex items-center justify-center relative my-auto">
            <canvas ref={canvasRef} className={`max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-white/10 ${mode === 'ascii' ? 'hidden' : 'block'}`} />
            
            {mode === 'ascii' && asciiText && (
              <pre className="ascii-pre absolute inset-0 flex items-center justify-center text-center leading-none tracking-widest font-mono text-[9px] text-parchment overflow-auto p-4 bg-black/60 rounded-2xl">
                {asciiText}
              </pre>
            )}
          </div>

          {/* Mobile attach CTA */}
          <div className="w-full md:hidden pt-4 mt-auto">
            <button
              onClick={handleAttachThought}
              disabled={attaching}
              className="w-full py-3 bg-parchment text-ink-deep font-semibold text-xs rounded-2xl hover:bg-white transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {attaching ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={14} /> Turn Art into Thought →</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
