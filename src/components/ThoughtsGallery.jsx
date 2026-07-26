import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Eye, Plus, Sparkles, Loader2, Send, ArrowRight, User } from 'lucide-react';
import { useThoughts, useThoughtComments } from '../hooks/useThoughts.js';

function ThoughtCard({ thought, onSelectThought, onSpawnPod, currentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onSelectThought(thought)}
      className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-pointer flex flex-col justify-between group transition-all"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-black/40 overflow-hidden border-b border-white/10">
        <img
          src={thought.imageUrl}
          alt={thought.caption}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        
        {/* Art Mode badge */}
        <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-parchment">
          {thought.artMode}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-harbor-teal text-ink-deep font-bold text-[10px] flex items-center justify-center uppercase overflow-hidden border border-white/10">
              {thought.author.avatarUrl ? (
                <img src={thought.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                thought.author.displayName?.[0] || thought.author.handle[0]
              )}
            </div>
            <span className="text-xs font-mono text-ash font-medium truncate">
              {thought.author.displayName || `@${thought.author.handle}`}
            </span>
          </div>

          <p className="text-sm font-serif text-parchment leading-relaxed line-clamp-3 mb-4">
            "{thought.caption}"
          </p>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-ash">
          <span className="flex items-center gap-1.5 text-sage-signal">
            <MessageSquare size={14} /> {thought.commentCount} responses
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSpawnPod(thought);
            }}
            className="px-3 py-1 bg-parchment/10 hover:bg-parchment/20 text-parchment text-[11px] rounded-full border border-parchment/20 transition-colors flex items-center gap-1"
          >
            <Sparkles size={12} className="text-philosophy-gold" /> Spawn Pod
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ThoughtDetailModal({ thought, onClose, onSpawnPod, currentUser }) {
  const { comments, loading, addComment } = useThoughtComments(thought.id);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(commentText);
      setCommentText('');
    } catch (err) {
      alert('Error commenting: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex flex-col md:flex-row my-auto max-h-[90vh]"
      >
        {/* Left Image display */}
        <div className="w-full md:w-1/2 bg-black/60 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10">
          <img src={thought.imageUrl} alt="" className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain rounded-2xl shadow-xl" />
          <div className="mt-4 text-center">
            <p className="font-serif text-lg text-parchment italic">"{thought.caption}"</p>
            <p className="text-xs font-mono text-ash mt-1">
              By {thought.author.displayName || `@${thought.author.handle}`}
            </p>
          </div>
        </div>

        {/* Right Comments Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-black/40 overflow-y-auto max-h-[60vh] md:max-h-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-ash flex items-center gap-1.5">
              <MessageSquare size={14} className="text-sage-signal" /> Responses ({comments.length})
            </h3>
            <button onClick={onClose} className="text-ash hover:text-white font-mono text-xs">Close ✕</button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ash" size={20} /></div>
            ) : comments.length === 0 ? (
              <p className="text-xs font-mono text-ash/70 text-center py-8">Be the first to leave a thought on this art piece.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-parchment font-mono">{c.author.displayName || `@${c.author.handle}`}</span>
                    <span className="text-[10px] text-ash/50 ml-auto font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-parchment/90 leading-relaxed font-sans">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Actions & Comment form */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <button
              onClick={() => { onClose(); onSpawnPod(thought); }}
              className="w-full py-2.5 bg-sage-signal/20 hover:bg-sage-signal/30 text-sage-signal border border-sage-signal/30 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} /> Turn Thought into Conversation Pod →
            </button>

            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your reflection..."
                className="glass-input flex-1 rounded-xl px-3 py-2 text-xs outline-none"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-4 bg-parchment text-ink-deep font-bold text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ThoughtsGallery({ onSpawnPodFromThought, currentUser, onOpenArtLab }) {
  const { thoughts, loading } = useThoughts();
  const [selectedThought, setSelectedThought] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-philosophy-gold flex items-center gap-1.5 mb-1">
            <Sparkles size={14} /> Half-Formed Art & Ideas
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-parchment">
            Thoughts Gallery
          </h1>
          <p className="text-ash text-sm sm:text-base mt-1">
            Visual thoughts created in the Art Lab. Anyone can comment; any thought can spawn a pod.
          </p>
        </div>

        <button
          onClick={onOpenArtLab}
          className="px-5 py-2.5 bg-parchment text-ink-deep font-semibold text-xs rounded-full hover:bg-white transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
        >
          <Sparkles size={14} className="text-philosophy-gold" /> Create Visual Thought
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-ash" size={28} /></div>
      ) : thoughts.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-white/10 max-w-md mx-auto">
          <p className="text-ash font-mono text-sm mb-4">No thoughts created yet. Be the first to experiment in Art Lab!</p>
          <button onClick={onOpenArtLab} className="text-xs font-mono text-sage-signal underline">Open Art Lab</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              onSelectThought={setSelectedThought}
              onSpawnPod={onSpawnPodFromThought}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedThought && (
          <ThoughtDetailModal
            thought={selectedThought}
            onClose={() => setSelectedThought(null)}
            onSpawnPod={onSpawnPodFromThought}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
