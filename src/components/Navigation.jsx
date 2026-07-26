import React, { useState } from 'react';
import { Sparkles, Library, Plus, Compass, User, Menu, X } from 'lucide-react';

export default function Navigation({ onNavigate, currentView, user, isAuthenticated, onOpenArtLab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-2xl z-40 sticky top-0">

      {/* Brand */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => handleMobileNav('discover')}
      >
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full border border-parchment/30 border-dashed animate-spin-slow" />
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-sage-signal group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-clay-thread" />
        </div>
        <span className="font-serif text-xl tracking-wide text-parchment group-hover:text-white transition-colors">
          half-formed
        </span>
      </div>

      {/* Desktop Nav Links */}
      <nav className="hidden md:flex items-center gap-8">
        <button
          onClick={() => onNavigate('discover')}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            currentView === 'discover' ? 'text-sage-signal font-semibold' : 'text-ash hover:text-parchment'
          }`}
        >
          <Compass size={16} /> Discover
        </button>

        <button
          onClick={() => onNavigate('archive')}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            currentView === 'archive' ? 'text-dusk-lavender font-semibold' : 'text-ash hover:text-parchment'
          }`}
        >
          <Library size={16} /> Archive
        </button>

        {isAuthenticated && (
          <button
            onClick={() => onNavigate('start')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              currentView === 'start' ? 'text-philosophy-gold font-semibold' : 'text-ash hover:text-parchment'
            }`}
          >
            <Plus size={16} /> Start Pod
          </button>
        )}
      </nav>

      {/* Actions (Art Lab & Profile/Sign-in) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenArtLab}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-parchment/10 hover:bg-parchment/20 text-parchment py-1.5 sm:py-2 px-3 sm:px-3.5 rounded-full transition-all border border-parchment/10 shadow-sm"
        >
          <Sparkles size={14} className="text-philosophy-gold animate-pulse" /> Art Lab
        </button>

        {isAuthenticated && user ? (
          <div
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 px-2 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-harbor-teal flex items-center justify-center text-ink-deep font-bold text-xs uppercase overflow-hidden border border-white/20">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name || user.handle} className="w-full h-full object-cover" />
              ) : (
                (user.display_name || user.handle || '??').substring(0, 2)
              )}
            </div>
            <span className="text-sm text-ash hidden lg:block font-mono">
              {user.display_name || `@${user.handle}`}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('onboarding')}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider bg-sage-signal text-ink-deep font-bold py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-full hover:bg-white transition-colors"
          >
            <User size={14} /> Sign In
          </button>
        )}

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-ash hover:text-parchment p-1 rounded-lg"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-b border-white/10 p-5 shadow-2xl flex flex-col gap-4 z-50">
          <button
            onClick={() => handleMobileNav('discover')}
            className={`flex items-center gap-3 text-sm font-medium py-2 ${
              currentView === 'discover' ? 'text-sage-signal font-semibold' : 'text-ash'
            }`}
          >
            <Compass size={18} /> Discover Pods
          </button>
          <button
            onClick={() => handleMobileNav('archive')}
            className={`flex items-center gap-3 text-sm font-medium py-2 ${
              currentView === 'archive' ? 'text-dusk-lavender font-semibold' : 'text-ash'
            }`}
          >
            <Library size={18} /> Pod Archive
          </button>
          {isAuthenticated && (
            <button
              onClick={() => handleMobileNav('start')}
              className={`flex items-center gap-3 text-sm font-medium py-2 ${
                currentView === 'start' ? 'text-philosophy-gold font-semibold' : 'text-ash'
              }`}
            >
              <Plus size={18} /> Start New Pod
            </button>
          )}
        </div>
      )}
    </header>
  );
}
