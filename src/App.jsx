import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import DiscoverView from './views/DiscoverView.jsx';
import PodRoomView from './views/PodRoomView.jsx';
import ArchiveView from './views/ArchiveView.jsx';
import StartPodView from './views/StartPodView.jsx';
import ProfileView from './views/ProfileView.jsx';
import OnboardingView from './views/OnboardingView.jsx';
import ImageArtLab from './components/ImageArtLab.jsx';
import { useAuth } from './hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

const viewTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, type: 'spring', damping: 26 },
};

export default function App() {
  const [currentView, setCurrentView] = useState('discover');
  const [activePod, setActivePod] = useState(null);
  const [artLabOpen, setArtLabOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('hf_seen_splash'));

  const { user, session, loading, isAuthenticated, signOut } = useAuth();

  const navigateTo = (view, pod = null) => {
    setCurrentView(view);
    if (pod) setActivePod(pod);
  };

  const handleDismissSplash = () => {
    localStorage.setItem('hf_seen_splash', '1');
    setShowSplash(false);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-deep">
        <Loader2 className="animate-spin text-sage-signal" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden bg-ink-deep text-parchment relative">

      {/* Intro Splash Screen for first-time visitors */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onDismiss={handleDismissSplash}
            isAuthenticated={isAuthenticated}
          />
        )}
      </AnimatePresence>

      <Navigation
        onNavigate={navigateTo}
        currentView={currentView}
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenArtLab={() => setArtLabOpen(true)}
      />

      <main className="flex-1 relative w-full h-full">
        <AnimatePresence mode="wait">
          {currentView === 'discover' && (
            <motion.div key="discover" {...viewTransition} className="absolute inset-0">
              <DiscoverView
                user={user}
                onEnterPod={(pod) => {
                  if (!isAuthenticated) { navigateTo('onboarding'); return; }
                  navigateTo('pod', pod);
                }}
              />
            </motion.div>
          )}

          {currentView === 'pod' && (
            <motion.div key="pod" {...viewTransition} className="absolute inset-0">
              <PodRoomView
                pod={activePod}
                user={user}
                onBack={() => navigateTo('discover')}
              />
            </motion.div>
          )}

          {currentView === 'archive' && (
            <motion.div key="archive" {...viewTransition} className="h-full overflow-y-auto">
              <ArchiveView />
            </motion.div>
          )}

          {currentView === 'start' && (
            <motion.div key="start" {...viewTransition} className="h-full overflow-y-auto">
              {isAuthenticated ? (
                <StartPodView onPodCreated={(pod) => navigateTo('pod', pod)} />
              ) : (
                <OnboardingView onComplete={() => navigateTo('start')} />
              )}
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div key="profile" {...viewTransition} className="h-full overflow-y-auto">
              {isAuthenticated ? (
                <ProfileView user={user} onSignOut={signOut} />
              ) : (
                <OnboardingView onComplete={() => navigateTo('discover')} />
              )}
            </motion.div>
          )}

          {currentView === 'onboarding' && (
            <motion.div key="onboarding" {...viewTransition} className="h-full overflow-y-auto">
              <OnboardingView onComplete={() => navigateTo('discover')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {artLabOpen && <ImageArtLab onClose={() => setArtLabOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
