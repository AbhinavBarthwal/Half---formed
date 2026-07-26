import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Images, BookOpen, Library, Plus, Sparkles, User, Sun, Moon, Tag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Navigation({ onNavigate, currentView, user, isAuthenticated, onOpenArtLab, onOpenTopicManager }) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { key: 'discover', label: 'Discover', icon: Compass },
    { key: 'gallery', label: 'Gallery', icon: Images },
    { key: 'articles', label: 'Articles', icon: BookOpen },
    { key: 'archive', label: 'Archive', icon: Library },
  ];

  return (
    <>
      {/* Desktop & Top Header Navigation */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-navy-400/20 glass-4 z-40 sticky top-0">

        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate('discover')}
        >
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border border-navy-400/40 border-dashed animate-spin-slow" />
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-crimson-700 dark:bg-crimson-400 group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-navy-400" />
          </div>
          <span className="font-serif text-xl tracking-wide text-navy-900 dark:text-navy-100 font-bold group-hover:text-crimson-700 dark:group-hover:text-crimson-400 transition-colors">
            half-formed
          </span>
        </div>

        {/* Desktop Nav Links with HIG Spring Underline */}
        <nav className="hidden md:flex items-center gap-2 bg-navy-900/10 dark:bg-navy-800/40 p-1 rounded-full border border-navy-400/20">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = currentView === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? 'text-navy-900 dark:text-navy-100 font-bold' : 'text-navy-400 hover:text-navy-900 dark:hover:text-navy-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/80 dark:bg-navy-700/80 rounded-full shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} /> {label}
                </span>
              </button>
            );
          })}

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('start')}
              className={`relative px-4 py-1.5 rounded-full text-xs font-mono transition-colors flex items-center gap-1.5 ${
                currentView === 'start' ? 'text-navy-900 dark:text-navy-100 font-bold' : 'text-navy-400 hover:text-navy-900 dark:hover:text-navy-100'
              }`}
            >
              {currentView === 'start' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white/80 dark:bg-navy-700/80 rounded-full shadow-sm"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Plus size={14} /> Start Pod
              </span>
            </button>
          )}
        </nav>

        {/* Header Actions (Verticals, Theme Toggle, Art Lab, Profile) */}
        <div className="flex items-center gap-2.5">

          {/* Verticals Search & Manage Button */}
          <button
            onClick={onOpenTopicManager}
            className="flex items-center gap-1 text-xs font-mono text-navy-400 hover:text-navy-900 dark:hover:text-navy-100 px-2.5 py-1.5 rounded-full border border-navy-400/20 hover:border-navy-400/40 transition-colors"
            title="Explore & Manage Verticals"
          >
            <Tag size={13} /> <span className="hidden sm:inline">Verticals</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-navy-400 hover:text-navy-900 dark:hover:text-navy-100 border border-navy-400/20 hover:border-navy-400/40 transition-all interactive-scale"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-navy-800" />}
          </button>

          {/* Art Lab Button */}
          <button
            onClick={onOpenArtLab}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson-700 text-white dark:bg-navy-700 dark:text-navy-100 py-1.5 px-3 rounded-full transition-all shadow-md interactive-scale border border-white/10"
          >
            <Sparkles size={13} className="animate-pulse" /> Art Lab
          </button>

          {/* User Profile / Sign In */}
          {isAuthenticated && user ? (
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1 px-1.5 rounded-full transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-crimson-700 dark:bg-navy-400 text-white font-bold text-xs uppercase flex items-center justify-center overflow-hidden border border-white/20">
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
              className="flex items-center gap-1 text-xs font-mono uppercase bg-navy-800 text-navy-100 dark:bg-navy-100 dark:text-navy-900 font-bold py-1.5 px-3 rounded-full transition-colors interactive-scale"
            >
              <User size={13} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* HIG Mobile Bottom Tab Bar (Fixed at bottom on phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-4 border-t border-navy-400/20 px-3 py-2 flex items-center justify-around z-40 pb-safe">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = currentView === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-crimson-700 dark:text-navy-100 font-bold scale-105' : 'text-navy-400'
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
              currentView === 'start' ? 'text-crimson-700 dark:text-navy-100 font-bold scale-105' : 'text-navy-400'
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
