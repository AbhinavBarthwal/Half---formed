import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Images, BookOpen, Library, Plus, Sparkles, User, Tag } from 'lucide-react';

export default function Navigation({ onNavigate, currentView, user, isAuthenticated, onOpenArtLab, onOpenTopicManager }) {

  const navItems = [
    { key: 'discover', label: 'Discover', icon: Compass },
    { key: 'gallery', label: 'Gallery', icon: Images },
    { key: 'articles', label: 'Articles', icon: BookOpen },
    { key: 'archive', label: 'Archive', icon: Library },
  ];

  return (
    <>
      {/* Desktop & Top Header Navigation — Borderless Apple HIG Design */}
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-black/10 dark:border-white/10 glass-4 z-40 sticky top-0 transition-colors">

        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate('discover')}
        >
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border border-black dark:border-white border-dashed animate-spin-slow" />
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-crimson-700 dark:bg-amber-400 group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
          </div>
          <span className="font-serif text-xl tracking-wide text-black dark:text-white font-black group-hover:opacity-80 transition-opacity">
            half-formed
          </span>
        </div>

        {/* Desktop Nav Links — Pure Apple HIG Segmented Control */}
        <nav className="hidden md:flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1.5 rounded-full backdrop-blur-md">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = currentView === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className="relative px-4 py-1.5 rounded-full text-xs font-mono font-black transition-all flex items-center gap-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-black dark:bg-white rounded-full shadow-md"
                    transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${
                  isActive ? 'text-white dark:text-black font-black' : 'text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white font-extrabold'
                }`}>
                  <Icon size={14} /> {label}
                </span>
              </button>
            );
          })}

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('start')}
              className="relative px-4 py-1.5 rounded-full text-xs font-mono font-black transition-all flex items-center gap-1.5"
            >
              {currentView === 'start' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-black dark:bg-white rounded-full shadow-md"
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${
                currentView === 'start' ? 'text-white dark:text-black font-black' : 'text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white font-extrabold'
              }`}>
                <Plus size={14} /> Start Pod
              </span>
            </button>
          )}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">

          {/* Verticals Button */}
          <button
            onClick={onOpenTopicManager}
            className="flex items-center gap-1.5 text-xs font-mono font-black text-black dark:text-white px-3.5 py-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-all border border-black/10 dark:border-white/10"
            title="Explore & Manage Verticals"
          >
            <Tag size={13} /> <span className="hidden sm:inline">Verticals</span>
          </button>



          {/* Art Lab Button */}
          <button
            onClick={onOpenArtLab}
            className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black py-1.5 px-3.5 rounded-full transition-all shadow-md interactive-scale"
          >
            <Sparkles size={13} className="text-amber-400 dark:text-amber-600" /> Art Lab
          </button>

          {/* User Profile / Sign In */}
          {isAuthenticated && user ? (
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 p-0.5 rounded-full transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase flex items-center justify-center overflow-hidden border border-black/20 dark:border-white/20 shadow-sm">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user.display_name || user.handle || '??').substring(0, 2)
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('onboarding')}
              className="flex items-center gap-1 text-xs font-mono uppercase bg-black text-white dark:bg-white dark:text-black font-black py-1.5 px-3.5 rounded-full transition-colors interactive-scale shadow-sm"
            >
              <User size={13} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* HIG Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-4 border-t border-black/10 dark:border-white/10 px-3 py-2 flex items-center justify-around z-40 pb-safe">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = currentView === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-black dark:text-white font-black scale-105' : 'text-black/70 dark:text-white/70 font-extrabold'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-mono tracking-tight">{label}</span>
            </button>
          );
        })}

        {isAuthenticated && (
          <button
            onClick={() => onNavigate('start')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              currentView === 'start' ? 'text-black dark:text-white font-black scale-105' : 'text-black/70 dark:text-white/70 font-extrabold'
            }`}
          >
            <Plus size={18} />
            <span className="text-[10px] font-mono tracking-tight">Start</span>
          </button>
        )}
      </nav>
    </>
  );
}
