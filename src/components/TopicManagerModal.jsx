import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X, Tag, Sparkles, Loader2, Check } from 'lucide-react';
import { useTopics } from '../hooks/useTopics.js';

const PRESET_COLORS = [
  '#C17F56', '#9C8CA8', '#4F8583', '#B8A46E',
  '#c1121f', '#669bbc', '#7C9B7E', '#d08c5d'
];

export default function TopicManagerModal({ onClose, onSelectTopic }) {
  const { topics, createTopic } = useTopics();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New topic form state
  const [name, setName] = useState('');
  const [accentHex, setAccentHex] = useState('#c1121f');
  const [discussionMode, setDiscussionMode] = useState('open');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createTopic({
        name: name.trim(),
        accentHex,
        discussionMode,
      });
      setSubmitting(false);
      setName('');
      setShowAddForm(false);
      if (onSelectTopic) onSelectTopic(created.slug);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl glass-3 rounded-3xl p-6 sm:p-8 border border-slateContrast-300/40 dark:border-navy-400/30 shadow-2xl my-auto space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-slateContrast-700 dark:text-slateContrast-300 font-bold flex items-center gap-1">
              <Tag size={14} /> Topic Verticals
            </span>
            <h2 className="font-serif text-2xl text-slateContrast-900 dark:text-slateContrast-50 font-bold">
              Explore & Add Verticals
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slateContrast-700 dark:text-slateContrast-300 hover:text-slateContrast-900 dark:hover:text-white rounded-full transition-colors font-bold">
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateContrast-600 dark:text-slateContrast-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic verticals..."
            className="glass-input w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs outline-none font-medium"
          />
        </div>

        {/* Topics List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredTopics.length === 0 ? (
            <p className="text-xs font-mono text-slateContrast-700 dark:text-slateContrast-300 font-bold text-center py-6">No matching topic verticals found.</p>
          ) : (
            filteredTopics.map((t) => (
              <div
                key={t.id}
                onClick={() => { onSelectTopic(t.slug); onClose(); }}
                className="glass-2 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all group border border-slateContrast-300/30 dark:border-navy-400/20"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: t.accent_hex || '#c1121f' }} />
                  <div>
                    <span className="text-xs font-mono font-extrabold text-slateContrast-900 dark:text-slateContrast-50">{t.name}</span>
                    <span className="text-[10px] font-mono text-slateContrast-700 dark:text-slateContrast-300 font-bold block uppercase">{t.discussion_mode} mode</span>
                  </div>
                </div>

                {t.is_community && (
                  <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full bg-crimson-700/10 text-crimson-800 dark:text-crimson-300 border border-crimson-700/30">
                    Community
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Vertical CTA / Form */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 bg-slateContrast-900 text-white dark:bg-navy-100 dark:text-navy-900 font-bold text-xs rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg interactive-scale"
          >
            <Plus size={16} /> Create New Topic Vertical
          </button>
        ) : (
          <form onSubmit={handleCreate} className="glass-2 p-5 rounded-2xl space-y-4 border border-slateContrast-300/40 dark:border-navy-400/30 animate-entrance-up">
            <div className="flex justify-between items-center">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slateContrast-900 dark:text-slateContrast-50 font-extrabold flex items-center gap-1.5">
                <Sparkles size={14} className="text-crimson-700 dark:text-crimson-400" /> New Vertical
              </h4>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300">Cancel</button>
            </div>

            {error && <p className="text-xs text-crimson-700 dark:text-crimson-400 font-mono font-bold">{error}</p>}

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-1">Vertical Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Architecture, Urbanism, Bioethics..."
                required
                minLength={3}
                className="glass-input w-full rounded-xl p-2.5 text-xs outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-1.5">Accent Color Swatch</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentHex(color)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    style={{ background: color }}
                  >
                    {accentHex === color && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-1">Discussion Mode</label>
              <select
                value={discussionMode}
                onChange={(e) => setDiscussionMode(e.target.value)}
                className="glass-input w-full rounded-xl p-2 text-xs outline-none font-medium"
              >
                <option value="open">Open (Freeform half-formed thoughts)</option>
                <option value="steelman">Steelman First (Requires building on prior argument)</option>
                <option value="threaded">Threaded (Strict question-and-answer)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || name.trim().length < 3}
              className="w-full py-2.5 bg-crimson-700 text-white font-bold text-xs rounded-xl hover:bg-crimson-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Publish Vertical →'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
