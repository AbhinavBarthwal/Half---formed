import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Users, BarChart2 } from 'lucide-react';

export default function PollCard({ poll, votes, onVote, onAddOption, currentUser }) {
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  const pollVotes = votes.filter(v => v.poll_id === poll.id);
  const totalVotes = pollVotes.length;

  const userVote = currentUser ? pollVotes.find(v => v.user_id === currentUser.id) : null;

  const handleAddOptionSubmit = (e) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;
    onAddOption(poll.id, newOptionText.trim());
    setNewOptionText('');
    setShowAddOption(false);
  };

  return (
    <div className="glass-2 p-5 rounded-2xl border border-slateContrast-300/30 dark:border-navy-400/20 my-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slateContrast-300/30 dark:border-navy-400/20 pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-crimson-700 dark:text-crimson-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slateContrast-700 dark:text-slateContrast-300 font-extrabold">In-Pod Poll</span>
        </div>
        <span className="text-xs font-mono text-slateContrast-700 dark:text-slateContrast-300 font-bold flex items-center gap-1">
          <Users size={12} /> {totalVotes} vote{totalVotes === 1 ? '' : 's'}
        </span>
      </div>

      <h4 className="font-serif text-base sm:text-lg text-slateContrast-900 dark:text-slateContrast-50 font-bold">
        {poll.question}
      </h4>

      {/* Options List */}
      <div className="space-y-3">
        {(poll.options || []).map((option) => {
          const optionVotes = pollVotes.filter(v => v.option_id === option.id);
          const count = optionVotes.length;
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isSelected = userVote?.option_id === option.id;

          return (
            <div key={option.id} className="space-y-1.5">
              <button
                onClick={() => onVote(poll.id, option.id)}
                className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition-all border flex items-center justify-between font-bold ${
                  isSelected
                    ? 'border-crimson-700 bg-crimson-700/15 text-slateContrast-900 dark:text-white font-extrabold'
                    : 'border-slateContrast-300/40 dark:border-navy-400/20 bg-black/5 dark:bg-white/5 text-slateContrast-800 dark:text-slateContrast-200 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {/* Animated progress bar fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-crimson-700/20 transition-all duration-500 rounded-xl"
                  style={{ width: `${percentage}%` }}
                />

                <span className="relative z-10 text-xs sm:text-sm font-sans flex items-center gap-2">
                  {isSelected && <Check size={14} className="text-crimson-700 dark:text-crimson-400 flex-shrink-0" />}
                  {option.text}
                </span>

                <span className="relative z-10 text-xs font-mono font-extrabold text-slateContrast-900 dark:text-white ml-2">
                  {percentage}% ({count})
                </span>
              </button>

              {/* Voter Avatars / Names */}
              {optionVotes.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 pt-0.5">
                  <span className="text-[10px] font-mono text-slateContrast-700 dark:text-slateContrast-300 font-bold">Voted by:</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {optionVotes.map((v) => (
                      <div
                        key={v.user_id}
                        title={v.user?.display_name || `@${v.user?.handle}`}
                        className="w-5 h-5 rounded-full bg-crimson-700 dark:bg-navy-400 text-white font-bold text-[9px] flex items-center justify-center border border-white/20 uppercase overflow-hidden"
                      >
                        {v.user?.avatar_url ? (
                          <img src={v.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (v.user?.display_name || v.user?.handle || '?')[0]
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slateContrast-700 dark:text-slateContrast-300 font-bold truncate max-w-[150px]">
                    {optionVotes.map(v => v.user?.display_name || `@${v.user?.handle}`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Option Button / Form */}
      {!showAddOption ? (
        <button
          onClick={() => setShowAddOption(true)}
          className="text-xs font-mono text-crimson-700 dark:text-crimson-400 font-bold hover:underline flex items-center gap-1 pt-1"
        >
          <Plus size={13} /> Add an option to this poll
        </button>
      ) : (
        <form onSubmit={handleAddOptionSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newOptionText}
            onChange={(e) => setNewOptionText(e.target.value)}
            placeholder="Type custom option..."
            className="glass-input flex-1 rounded-xl px-3 py-1.5 text-xs outline-none font-medium"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newOptionText.trim()}
            className="px-3 py-1.5 bg-crimson-700 text-white font-bold text-xs rounded-xl hover:bg-crimson-900 transition-colors disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowAddOption(false)}
            className="px-2 py-1.5 text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
