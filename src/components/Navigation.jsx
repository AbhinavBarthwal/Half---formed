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
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slateContrast-300/30 dark:border-navy-400/20 glass-4 z-40 sticky top-0">

        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate('discover')}
        >
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border border-crimson-700/40 dark:border-navy-400/40 border-dashed animate-spin-slow" />
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-crimson-700 dark:bg-crimson-400 group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-navy-800 dark:bg-navy-400" />
          </div>
          <span className="font-serif text-xl tracking-wide text-crimson-900 dark:text-navy-100 font-extrabold group-hover:text-crimson-700 dark:group-hover:text-crimson-400 transition-colors">
            half-formed
          </span>
        </div>

        {/* Desktop Nav Links with HIG Spring Pill */}
        <nav className="hidden md:flex items-center gap-1.5 bg-black/5 dark:bg-navy-800/60 p-1.5 rounded-full border border-slateContrast-300/40 dark:border-navy-400/20">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = currentView === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-crimson-900 dark:text-navy-100'
                    : 'text-slateContrast-700 hover:text-crimson-900 dark:text-slateContrast-300 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-navy-700 rounded-full shadow-md border border-crimson-700/20 dark:border-navy-400/30"
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
              className={`relative px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                currentView === 'start'
                  ? 'text-crimson-900 dark:text-navy-100'
                  : 'text-slateContrast-700 hover:text-crimson-900 dark:text-slateContrast-300 dark:hover:text-white'
              }`}
            >
              {currentView === 'start' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-navy-700 rounded-full shadow-md border border-crimson-700/20 dark:border-navy-400/30"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
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
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slateContrast-800 dark:text-slateContrast-200 hover:text-crimson-900 dark:hover:text-white px-3 py-1.5 rounded-full border border-slateContrast-400/40 dark:border-navy-400/30 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            title="Explore & Manage Verticals"
          >
            <Tag size={13} /> <span className="hidden sm:inline">Verticals</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slateContrast-800 dark:text-slateContrast-200 border border-slateContrast-400/40 dark:border-navy-400/30 hover:bg-black/5 dark:hover:bg-white/10 transition-all interactive-scale"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-crimson-900" />}
          </button>

          {/* Art Lab Button */}
          <button
            onClick={onOpenArtLab}
            className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson-700 text-white dark:bg-navy-700 dark:text-navy-100 py-1.5 px-3.5 rounded-full transition-all shadow-md interactive-scale border border-white/20"
          >
            <Sparkles size={13} className="animate-pulse" /> Art Lab
          </button>

          {/* User Profile / Sign In */}
          {isAuthenticated && user ? (
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1 px-1.5 rounded-full transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-crimson-700 dark:bg-navy-400 text-white font-bold text-xs uppercase flex items-center justify-center overflow-hidden border border-white/30">
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
              className="flex items-center gap-1 text-xs font-mono uppercase bg-crimson-900 text-white dark:bg-navy-100 dark:text-navy-900 font-bold py-1.5 px-3.5 rounded-full transition-colors interactive-scale shadow-sm"
            >
              <User size={13} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* HIG Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-4 border-t border-slateContrast-300/40 dark:border-navy-400/20 px-3 py-2 flex items-center justify-around z-40 pb-safe">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = currentView === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-crimson-700 dark:text-navy-100 font-bold scale-105' : 'text-slateContrast-700 dark:text-slateContrast-400'
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
              currentView === 'start' ? 'text-crimson-700 dark:text-navy-100 font-bold scale-105' : 'text-slateContrast-700 dark:text-slateContrast-400'
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
