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
    <div className="glass-card p-5 rounded-2xl border border-white/10 my-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-sage-signal" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-ash">In-Pod Poll</span>
        </div>
        <span className="text-xs font-mono text-ash flex items-center gap-1">
          <Users size={12} /> {totalVotes} vote{totalVotes === 1 ? '' : 's'}
        </span>
      </div>

      <h4 className="font-serif text-base sm:text-lg text-parchment font-medium">
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
                className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'border-sage-signal bg-sage-signal/15 text-parchment font-semibold'
                    : 'border-white/10 bg-white/5 text-ash hover:bg-white/10 hover:text-parchment'
                }`}
              >
                {/* Animated progress bar fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-sage-signal/20 transition-all duration-500 rounded-xl"
                  style={{ width: `${percentage}%` }}
                />

                <span className="relative z-10 text-xs sm:text-sm font-sans flex items-center gap-2">
                  {isSelected && <Check size={14} className="text-sage-signal flex-shrink-0" />}
                  {option.text}
                </span>

                <span className="relative z-10 text-xs font-mono font-bold text-parchment/90 ml-2">
                  {percentage}% ({count})
                </span>
              </button>

              {/* Voter Avatars / Names (shows who voted like requested) */}
              {optionVotes.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 pt-0.5">
                  <span className="text-[10px] font-mono text-ash/60">Voted by:</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {optionVotes.map((v) => (
                      <div
                        key={v.user_id}
                        title={v.user?.display_name || `@${v.user?.handle}`}
                        className="w-5 h-5 rounded-full bg-harbor-teal text-ink-deep font-bold text-[9px] flex items-center justify-center border border-white/20 uppercase overflow-hidden"
                      >
                        {v.user?.avatar_url ? (
                          <img src={v.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (v.user?.display_name || v.user?.handle || '?')[0]
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-ash/70 truncate max-w-[150px]">
                    {optionVotes.map(v => v.user?.display_name || `@${v.user?.handle}`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Option Button / Form (iMessage style option adding) */}
      {!showAddOption ? (
        <button
          onClick={() => setShowAddOption(true)}
          className="text-xs font-mono text-sage-signal hover:underline flex items-center gap-1 pt-1"
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
            className="glass-input flex-1 rounded-xl px-3 py-1.5 text-xs outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newOptionText.trim()}
            className="px-3 py-1.5 bg-sage-signal text-ink-deep font-bold text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowAddOption(false)}
            className="px-2 py-1.5 text-xs text-ash hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
