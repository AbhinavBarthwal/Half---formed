import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommonsMap from '../components/CommonsMap.jsx';
import { usePods } from '../hooks/usePods.js';
import { useTopics } from '../hooks/useTopics.js';
import { Loader2, Search, Users, ArrowRight, CheckCircle2, LayoutGrid, MapPin } from 'lucide-react';

export default function DiscoverView({ onEnterPod, user }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPod, setHoveredPod] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const { topics } = useTopics();
  const { pods, loading, joinPod } = usePods(selectedTopic);

  // Filter pods by search query
  const filteredPods = useMemo(() => {
    if (!searchQuery.trim()) return pods;
    const q = searchQuery.toLowerCase();
    return pods.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.seedPrompt && p.seedPrompt.toLowerCase().includes(q)) ||
      (p.topic?.name && p.topic.name.toLowerCase().includes(q))
    );
  }, [pods, searchQuery]);

  // Assign canvas positions dynamically based on index
  const podsWithPositions = useMemo(() => {
    return filteredPods.map((pod, i) => ({
      ...pod,
      x: 0.15 + ((i * 0.22 + (i % 3) * 0.08) % 0.7),
      y: 0.2 + ((i * 0.18 + (i % 2) * 0.15) % 0.6),
      color: pod.topic?.color || '#8B9490',
    }));
  }, [filteredPods]);

  const handleJoinClick = async (e, pod) => {
    e.stopPropagation();
    if (!user) {
      onEnterPod(pod); // Auth gate trigger in App.jsx
      return;
    }
    const isMember = pod.members?.includes(user.id);
    if (!isMember) {
      try {
        await joinPod(pod.id);
      } catch (err) {
        console.error('Failed to join:', err);
      }
    }
    onEnterPod(pod);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center pt-6 sm:pt-10 overflow-y-auto no-scrollbar pb-24">

      {/* Hero text */}
      <div className="z-10 text-center max-w-3xl px-4 sm:px-6 mb-6">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl mb-4 text-parchment leading-tight font-normal">
          A quiet space for ideas that aren't ready yet.
        </h1>
        <p className="text-ash text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          No public scoreboards. Small bounded pods. The interface enforces good faith.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-md mx-auto relative">
          <div className="flex items-center gap-3 bg-black/40 border border-white/15 rounded-full px-4 py-2.5 shadow-xl backdrop-blur-xl focus-within:border-sage-signal transition-all">
            <Search size={18} className="text-ash flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pods by title or question..."
              className="w-full bg-transparent text-sm text-parchment outline-none placeholder-ash/60 font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-ash hover:text-white">Clear</button>
            )}
          </div>
        </div>

        {/* Topic filter pills & View Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border ${
              !selectedTopic ? 'bg-parchment text-ink-deep border-parchment font-bold' : 'border-parchment/20 text-ash hover:border-parchment/40 bg-black/20'
            }`}
          >
            All Verticals
          </button>

          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(selectedTopic === t.slug ? null : t.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border ${
                selectedTopic === t.slug ? 'font-bold text-ink-deep' : 'hover:bg-white/5 bg-black/20'
              }`}
              style={{
                borderColor: selectedTopic === t.slug ? t.accent_hex : `${t.accent_hex}55`,
                backgroundColor: selectedTopic === t.slug ? t.accent_hex : 'transparent',
                color: selectedTopic === t.slug ? '#1B2420' : t.accent_hex,
              }}
            >
              {t.name}
            </button>
          ))}

          {/* Toggle View */}
          <div className="ml-2 hidden sm:flex items-center gap-1 bg-black/30 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-parchment' : 'text-ash hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'map' ? 'bg-white/20 text-parchment' : 'text-ash hover:text-white'}`}
              title="Constellation Map"
            >
              <MapPin size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        /* Canvas Map View */
        <div className="w-full h-[600px] relative overflow-hidden my-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-ash" size={24} />
            </div>
          ) : podsWithPositions.length > 0 ? (
            <CommonsMap
              pods={podsWithPositions}
              onPodHover={setHoveredPod}
              onPodSelect={() => hoveredPod && onEnterPod(hoveredPod)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-ash font-mono text-sm">No active pods found.</p>
            </div>
          )}
        </div>
      ) : (
        /* Cards Grid View */
        <div className="w-full max-w-6xl px-4 sm:px-6 z-10">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-ash" size={28} />
            </div>
          ) : filteredPods.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-white/10 max-w-md mx-auto">
              <p className="text-ash font-mono text-sm mb-4">No pods match your criteria.</p>
              <button
                onClick={() => { setSelectedTopic(null); setSearchQuery(''); }}
                className="text-xs font-mono text-sage-signal underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-4">
              {filteredPods.map(pod => {
                const isMember = user && pod.members?.includes(user.id);
                const isFull = pod.memberCount >= pod.capacity;

                return (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3 }}
                    onClick={() => onEnterPod(pod)}
                    className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-pointer flex flex-col justify-between group transition-all"
                  >
                    {/* Optional Cover Banner */}
                    {pod.imageUrl && (
                      <div className="h-36 w-full relative overflow-hidden bg-black/40 border-b border-white/10">
                        <img
                          src={pod.imageUrl}
                          alt={pod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/10 bg-black/30 font-semibold"
                            style={{ color: pod.topic?.color || '#8B9490' }}
                          >
                            {pod.topic?.name}
                          </span>
                          <span className="text-xs font-mono text-ash flex items-center gap-1">
                            <Users size={13} /> {pod.memberCount}/{pod.capacity}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl text-parchment font-medium mb-2 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                          {pod.title}
                        </h3>

                        {pod.seedPrompt && (
                          <p className="text-ash text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                            "{pod.seedPrompt}"
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                        {isMember ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-sage-signal font-semibold">
                            <CheckCircle2 size={14} /> Joined Pod
                          </span>
                        ) : isFull ? (
                          <span className="text-xs font-mono text-clay-thread font-semibold">
                            Pod Full
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-ash group-hover:text-parchment transition-colors">
                            Click to explore
                          </span>
                        )}

                        <button
                          onClick={(e) => handleJoinClick(e, pod)}
                          className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-md ${
                            isMember
                              ? 'bg-sage-signal/20 text-sage-signal border border-sage-signal/40 hover:bg-sage-signal/30'
                              : 'bg-parchment text-ink-deep hover:bg-white'
                          }`}
                        >
                          {isMember ? 'Enter' : 'Join'} <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tooltip for map mode */}
      <AnimatePresence>
        {hoveredPod && viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed z-30 pointer-events-none glass-panel p-5 rounded-2xl shadow-2xl max-w-sm"
            style={{
              left: Math.min(Math.max(hoveredPod.x * window.innerWidth + 20, 20), window.innerWidth - 350),
              top: Math.max(hoveredPod.y * window.innerHeight - 60, 80),
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: hoveredPod.color }} />
              <span className="text-[10px] uppercase tracking-widest font-mono text-ash">{hoveredPod.topic?.name}</span>
            </div>
            <h3 className="font-serif text-xl text-parchment mb-2">{hoveredPod.title}</h3>
            <div className="flex justify-between items-center text-xs font-mono mt-4 pt-3 border-t border-white/10">
              <span className={hoveredPod.memberCount >= hoveredPod.capacity ? 'text-clay-thread font-bold' : 'text-sage-signal'}>
                {hoveredPod.memberCount}/{hoveredPod.capacity} present
              </span>
              <span className="text-ash">Click to enter →</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
