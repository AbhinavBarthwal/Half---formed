import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommonsMap from '../components/CommonsMap.jsx';
import { usePods } from '../hooks/usePods.js';
import { useTopics } from '../hooks/useTopics.js';
import { Loader2, Search, Users, ArrowRight, CheckCircle2, LayoutGrid, MapPin, Plus, Tag } from 'lucide-react';

export default function DiscoverView({ onEnterPod, user, onOpenTopicManager }) {
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
      color: pod.topic?.color || '#778da9',
    }));
  }, [filteredPods]);

  const handleJoinClick = async (e, pod) => {
    e.stopPropagation();
    if (!user) {
      onEnterPod(pod);
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
    <div className="relative w-full h-full flex flex-col items-center pt-6 sm:pt-10 overflow-y-auto no-scrollbar pb-32 md:pb-24">

      {/* Hero Header */}
      <div className="z-10 text-center max-w-3xl px-4 sm:px-6 mb-6">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl mb-3 text-navy-900 dark:text-navy-100 leading-tight font-bold tracking-tight">
          A quiet space for ideas that aren't ready yet.
        </h1>
        <p className="text-navy-400 dark:text-navy-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-sans">
          No public scoreboards. Small bounded pods. Enforced good faith.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-md mx-auto relative">
          <div className="flex items-center gap-3 glass-3 border border-navy-400/20 rounded-full px-4 py-2.5 shadow-xl focus-within:border-crimson-700 dark:focus-within:border-navy-400 transition-all">
            <Search size={16} className="text-navy-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pods or topic verticals..."
              className="w-full bg-transparent text-xs sm:text-sm text-navy-900 dark:text-navy-100 outline-none placeholder-navy-400 font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-navy-400 hover:text-navy-900 dark:hover:text-navy-100 font-mono">Clear</button>
            )}
          </div>
        </div>

        {/* Topic filter pills & View Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border ${
              !selectedTopic
                ? 'bg-navy-900 text-white dark:bg-navy-100 dark:text-navy-900 border-transparent font-bold shadow-md'
                : 'border-navy-400/20 text-navy-400 hover:border-navy-400/40 glass-1'
            }`}
          >
            All Verticals
          </button>

          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(selectedTopic === t.slug ? null : t.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                selectedTopic === t.slug ? 'font-bold shadow-md' : 'hover:bg-white/10 glass-1'
              }`}
              style={{
                borderColor: selectedTopic === t.slug ? t.accent_hex : `${t.accent_hex}55`,
                backgroundColor: selectedTopic === t.slug ? t.accent_hex : 'transparent',
                color: selectedTopic === t.slug ? '#ffffff' : t.accent_hex,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: t.accent_hex }} />
              {t.name}
            </button>
          ))}

          {/* Add Vertical Button */}
          <button
            onClick={onOpenTopicManager}
            className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-navy-400 border border-dashed border-navy-400/30 hover:border-navy-400 hover:text-navy-900 dark:hover:text-navy-100 transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> Vertical
          </button>

          {/* View Switcher Toggle */}
          <div className="ml-2 hidden sm:flex items-center gap-1 glass-3 p-1 rounded-full border border-navy-400/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white/20 dark:bg-navy-700/80 text-navy-900 dark:text-navy-100' : 'text-navy-400 hover:text-navy-900 dark:hover:text-navy-100'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'map' ? 'bg-white/20 dark:bg-navy-700/80 text-navy-900 dark:text-navy-100' : 'text-navy-400 hover:text-navy-900 dark:hover:text-navy-100'}`}
              title="Constellation Map"
            >
              <MapPin size={14} />
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
              <Loader2 className="animate-spin text-navy-400" size={24} />
            </div>
          ) : podsWithPositions.length > 0 ? (
            <CommonsMap
              pods={podsWithPositions}
              onPodHover={setHoveredPod}
              onPodSelect={() => hoveredPod && onEnterPod(hoveredPod)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-navy-400 font-mono text-sm">No active pods found.</p>
            </div>
          )}
        </div>
      ) : (
        /* Cards Grid View (Apple HIG Hierarchy: Title First) */
        <div className="w-full max-w-6xl px-4 sm:px-6 z-10">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-navy-400" size={28} />
            </div>
          ) : filteredPods.length === 0 ? (
            <div className="text-center py-16 glass-2 rounded-3xl p-8 border border-navy-400/20 max-w-md mx-auto">
              <p className="text-navy-400 font-mono text-sm mb-4">No pods match your criteria.</p>
              <button
                onClick={() => { setSelectedTopic(null); setSearchQuery(''); }}
                className="text-xs font-mono text-crimson-700 dark:text-navy-400 underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-4">
              {filteredPods.map((pod, idx) => {
                const isMember = user && pod.members?.includes(user.id);
                const isFull = pod.memberCount >= pod.capacity;

                return (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => onEnterPod(pod)}
                    className="glass-2 rounded-3xl overflow-hidden border border-navy-400/20 shadow-xl cursor-pointer flex flex-col justify-between group transition-all"
                  >
                    {/* Optional Cover Banner */}
                    {pod.imageUrl && (
                      <div className="h-36 w-full relative overflow-hidden bg-black/30 border-b border-navy-400/10">
                        <img
                          src={pod.imageUrl}
                          alt={pod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* HIG Hierarchy: Primary Title first */}
                      <div>
                        <h3 className="font-serif text-xl sm:text-2xl text-navy-900 dark:text-navy-100 font-semibold mb-2 line-clamp-2 leading-snug group-hover:text-crimson-700 dark:group-hover:text-crimson-400 transition-colors">
                          {pod.title}
                        </h3>

                        {pod.seedPrompt && (
                          <p className="text-navy-400 dark:text-navy-400 text-xs sm:text-sm line-clamp-3 leading-relaxed font-sans">
                            "{pod.seedPrompt}"
                          </p>
                        )}
                      </div>

                      {/* Footer Metadata & Actions */}
                      <div className="pt-4 border-t border-navy-400/15 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-navy-400/20 bg-black/10 dark:bg-white/10 font-semibold"
                            style={{ color: pod.topic?.color || '#778da9' }}
                          >
                            {pod.topic?.name}
                          </span>
                          <span className="text-xs font-mono text-navy-400 flex items-center gap-1">
                            <Users size={12} /> {pod.memberCount}/{pod.capacity}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleJoinClick(e, pod)}
                          className={`px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1 shadow-sm interactive-scale ${
                            isMember
                              ? 'bg-crimson-700/20 text-crimson-700 dark:text-navy-100 border border-crimson-700/30'
                              : 'bg-navy-900 text-white dark:bg-navy-100 dark:text-navy-900 hover:opacity-90'
                          }`}
                        >
                          {isMember ? 'Enter' : 'Join'} <ArrowRight size={12} />
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
            className="fixed z-30 pointer-events-none glass-1 p-5 rounded-2xl shadow-2xl max-w-sm"
            style={{
              left: Math.min(Math.max(hoveredPod.x * window.innerWidth + 20, 20), window.innerWidth - 350),
              top: Math.max(hoveredPod.y * window.innerHeight - 60, 80),
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: hoveredPod.color }} />
              <span className="text-[10px] uppercase tracking-widest font-mono text-navy-400">{hoveredPod.topic?.name}</span>
            </div>
            <h3 className="font-serif text-xl text-navy-900 dark:text-navy-100 mb-2">{hoveredPod.title}</h3>
            <div className="flex justify-between items-center text-xs font-mono mt-4 pt-3 border-t border-navy-400/20">
              <span className="text-navy-400">
                {hoveredPod.memberCount}/{hoveredPod.capacity} present
              </span>
              <span className="text-navy-400">Click to enter →</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
