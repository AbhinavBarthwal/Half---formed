import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Shield, ArrowRight, X, Compass, Feather } from 'lucide-react';

export default function SplashScreen({ onDismiss, isAuthenticated }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      icon: Feather,
      tag: "WELCOME TO HALF-FORMED",
      title: "A quiet space for ideas that aren't ready yet.",
      description: "No public scoreboards. No vanity metrics. Small, bounded conversation pods designed for raw thinking and genuine connection.",
      badgeColor: "text-crimson-800 dark:text-crimson-300 border-crimson-700/30 bg-crimson-700/10 font-bold"
    },
    {
      icon: Shield,
      tag: "CORE PRINCIPLES",
      title: "Built for good-faith discussion.",
      description: "Steelman responses first before pointing out flaws. Choose pseudonymous handles to speak freely without performance anxiety.",
      badgeColor: "text-amber-800 dark:text-amber-300 border-amber-500/30 bg-amber-500/10 font-bold"
    },
    {
      icon: Users,
      tag: "JOIN THE COMMONS",
      title: "Small pods. Real presence.",
      description: "Rooms auto-cap at 6-12 members. When conversations conclude, key consensus points are preserved in the Pod Archive.",
      badgeColor: "text-navy-900 dark:text-navy-200 border-navy-700/30 bg-navy-700/10 font-bold"
    }
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onDismiss();
    }
  };

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="w-full max-w-lg glass-3 p-6 sm:p-8 rounded-3xl border border-slateContrast-300/40 dark:border-navy-400/30 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[440px]"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slateContrast-300/30 dark:border-navy-400/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-crimson-700 dark:bg-navy-300 animate-pulse" />
            <span className="font-serif text-sm tracking-wider text-slateContrast-900 dark:text-slateContrast-50 font-extrabold">half-formed</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-slateContrast-700 dark:text-slateContrast-300 hover:text-slateContrast-900 dark:hover:text-white p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-bold"
            title="Skip Intro"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide Content */}
        <div className="my-auto py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25, type: 'spring', damping: 25 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono tracking-widest uppercase ${current.badgeColor}`}>
                  <Icon size={13} /> {current.tag}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold leading-tight">
                {current.title}
              </h2>

              <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm sm:text-base leading-relaxed font-medium">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slateContrast-300/30 dark:border-navy-400/20">
          {/* Indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  slide === idx ? 'w-6 bg-crimson-700 dark:bg-navy-300' : 'w-2 bg-slateContrast-300 dark:bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {slide > 0 && (
              <button
                onClick={() => setSlide(slide - 1)}
                className="px-4 py-2 text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300 hover:text-slateContrast-900 dark:hover:text-white transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slateContrast-900 text-white dark:bg-slateContrast-50 dark:text-slateContrast-900 font-bold text-xs hover:opacity-90 transition-all shadow-lg interactive-scale"
            >
              {slide === slides.length - 1 ? (
                <>Enter App <Compass size={14} /></>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
