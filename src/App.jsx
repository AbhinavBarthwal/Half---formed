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
import ThoughtsGallery from './components/ThoughtsGallery.jsx';
import ArticlesView from './views/ArticlesView.jsx';
import TopicManagerModal from './components/TopicManagerModal.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

const viewTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, type: 'spring', damping: 26 },
};

function MainAppContent() {
  const [currentView, setCurrentView] = useState('discover');
  const [activePod, setActivePod] = useState(null);
  const [artLabOpen, setArtLabOpen] = useState(false);
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [podPrefill, setPodPrefill] = useState(null);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('hf_seen_splash'));

  const { user, session, loading, isAuthenticated, signOut } = useAuth();

  const navigateTo = (view, pod = null) => {
    setCurrentView(view);
    if (pod) setActivePod(pod);
  };

  const handleSpawnPodFromThought = (thought) => {
    setPodPrefill({
      initialTitle: `Reflection: ${thought.caption.substring(0, 45)}...`,
      initialSeed: thought.caption,
      initialImageUrl: thought.imageUrl,
    });
    navigateTo('start');
  };

  const handleSpawnPodFromArticle = (article) => {
    setPodPrefill({
      initialTitle: `Discussion: ${article.title}`,
      initialSeed: article.excerpt || article.title,
      initialImageUrl: article.coverImageUrl,
      initialTopicId: article.topic?.id,
    });
    navigateTo('start');
  };

  const handleDismissSplash = () => {
    localStorage.setItem('hf_seen_splash', '1');
    setShowSplash(false);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900 text-navy-100">
        <Loader2 className="animate-spin text-crimson-700 dark:text-navy-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden relative">

      {/* Intro Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onDismiss={handleDismissSplash}
            isAuthenticated={isAuthenticated}
          />
        )}
      </AnimatePresence>

      <Navigation
        onNavigate={(v) => navigateTo(v)}
        currentView={currentView}
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenArtLab={() => setArtLabOpen(true)}
        onOpenTopicManager={() => setTopicManagerOpen(true)}
      />

      <main className="flex-1 relative w-full h-full">
        <AnimatePresence mode="wait">
          {currentView === 'discover' && (
            <motion.div key="discover" {...viewTransition} className="absolute inset-0">
              <DiscoverView
                user={user}
                onOpenTopicManager={() => setTopicManagerOpen(true)}
                onEnterPod={(pod) => {
                  if (!isAuthenticated) { navigateTo('onboarding'); return; }
                  navigateTo('pod', pod);
                }}
              />
            </motion.div>
          )}

          {currentView === 'gallery' && (
            <motion.div key="gallery" {...viewTransition} className="h-full overflow-y-auto">
              <ThoughtsGallery
                currentUser={user}
                onSpawnPodFromThought={handleSpawnPodFromThought}
                onOpenArtLab={() => setArtLabOpen(true)}
              />
            </motion.div>
          )}

          {currentView === 'articles' && (
            <motion.div key="articles" {...viewTransition} className="h-full overflow-y-auto">
              <ArticlesView
                currentUser={user}
                onSpawnPodFromArticle={handleSpawnPodFromArticle}
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
                <StartPodView
                  prefillData={podPrefill}
                  onPodCreated={(pod) => {
                    setPodPrefill(null);
                    navigateTo('pod', pod);
                  }}
                />
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

      {/* Art Lab Modal */}
      <AnimatePresence>
        {artLabOpen && (
          <ImageArtLab
            onClose={() => setArtLabOpen(false)}
            onThoughtCreated={(thought) => {
              setArtLabOpen(false);
              navigateTo('gallery');
            }}
          />
        )}
      </AnimatePresence>

      {/* Topic Verticals Search & Management Modal */}
      <AnimatePresence>
        {topicManagerOpen && (
          <TopicManagerModal
            onClose={() => setTopicManagerOpen(false)}
            onSelectTopic={(slug) => {
              setTopicManagerOpen(false);
              navigateTo('discover');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
