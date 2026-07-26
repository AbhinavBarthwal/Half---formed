import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Shield, HelpCircle, MessageSquarePlus, Loader2, UserPlus, X, BarChart2, Award, Sparkles, CheckCircle } from 'lucide-react';
import { usePodMessages } from '../hooks/usePodMessages.js';
import { usePods } from '../hooks/usePods.js';
import { usePolls } from '../hooks/usePolls.js';
import { usePodClose } from '../hooks/usePodClose.js';
import PollCard from '../components/PollCard.jsx';
import { supabase } from '../lib/supabase.js';

export default function PodRoomView({ pod, user, onBack }) {
  const [activeTab, setActiveTab] = useState('add');
  const [replyText, setReplyText] = useState('');
  const [members, setMembers] = useState([]);
  const [showMobileMembers, setShowMobileMembers] = useState(false);
  const [showGraduateModal, setShowGraduateModal] = useState(false);
  const [closingStatement, setClosingStatement] = useState('');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const { messages, loading, postMessage, toggleReaction } = usePodMessages(pod?.id);
  const { polls, votes, createPoll, votePoll, addOptionToPoll } = usePolls(pod?.id);
  const { joinPod } = usePods();
  const { closePod, closing } = usePodClose();

  const isMember = user && members.some(m => m.user_id === user.id);
  const isCreator = user && pod?.createdBy === user.id;
  const isClosed = pod?.status === 'fully_formed' || pod?.status === 'archived';

  // Fetch members
  useEffect(() => {
    if (!pod?.id) return;

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('pod_memberships')
        .select('user_id, joined_at, profiles:profiles!user_id ( handle, avatar_url, display_name )')
        .eq('pod_id', pod.id);
      setMembers(data || []);
    };
    fetchMembers();

    const channel = supabase
      .channel(`presence:${pod.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pod_memberships', filter: `pod_id=eq.${pod.id}` }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pod?.id]);

  // Combine messages and polls in chronological order
  const timelineItems = useMemo(() => {
    const msgItems = messages.map(m => ({ type: 'message', data: m, time: new Date(m.createdAt).getTime() }));
    const pollItems = polls.map(p => ({ type: 'poll', data: p, time: new Date(p.created_at).getTime() }));
    return [...msgItems, ...pollItems].sort((a, b) => a.time - b.time);
  }, [messages, polls]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (activeTab === 'poll') {
      if (!pollQuestion.trim()) return;
      const validOptions = pollOptions.filter(o => o.trim().length > 0);
      if (validOptions.length < 2) {
        alert('Please provide at least 2 options for the poll.');
        return;
      }
      try {
        await createPoll(pollQuestion.trim(), validOptions);
        setPollQuestion('');
        setPollOptions(['', '']);
        setActiveTab('add');
      } catch (err) {
        alert('Error creating poll: ' + err.message);
      }
      return;
    }

    if (!replyText.trim()) return;
    try {
      await postMessage(replyText, activeTab);
      setReplyText('');
    } catch (err) {
      alert('Error posting: ' + err.message);
    }
  };

  const handleGraduatePodSubmit = async (e) => {
    e.preventDefault();
    if (!closingStatement.trim()) return;
    try {
      await closePod(pod.id, closingStatement.trim());
      pod.status = 'fully_formed';
      pod.closingStatement = closingStatement.trim();
      setShowGraduateModal(false);
    } catch (err) {
      alert('Error closing pod: ' + err.message);
    }
  };

  const handleJoinThisPod = async () => {
    try {
      await joinPod(pod.id);
    } catch (err) {
      alert('Error joining pod: ' + err.message);
    }
  };

  const p = pod || {};

  return (
    <div className="flex flex-col h-full bg-ink-deep/60 text-parchment overflow-hidden relative">

      {/* Optional Cover Banner */}
      {p.imageUrl && (
        <div className="relative w-full h-32 md:h-44 overflow-hidden border-b border-white/10 flex-shrink-0">
          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-black/40 backdrop-blur-xl z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ash hover:text-parchment transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col items-center text-center max-w-md px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-mono font-semibold" style={{ color: p.topic?.color }}>
              {p.topic?.name}
            </span>
            {isClosed && (
              <span className="text-[10px] uppercase tracking-widest font-mono bg-philosophy-gold/20 text-philosophy-gold border border-philosophy-gold/30 px-2 py-0.5 rounded-full font-bold">
                Fully Formed ✓
              </span>
            )}
          </div>
          <h2 className="font-serif text-base sm:text-lg md:text-xl text-parchment truncate">{p.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {isCreator && !isClosed && (
            <button
              onClick={() => setShowGraduateModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-philosophy-gold bg-philosophy-gold/10 px-3 py-1.5 rounded-full border border-philosophy-gold/30 hover:bg-philosophy-gold/20 transition-colors"
            >
              <Award size={14} /> Graduate Pod
            </button>
          )}

          <button
            onClick={() => setShowMobileMembers(!showMobileMembers)}
            className="flex items-center gap-1.5 text-xs font-mono text-sage-signal bg-sage-signal/10 px-3 py-1.5 rounded-full border border-sage-signal/20 hover:bg-sage-signal/20 transition-colors"
          >
            <Users size={14} /> {members.length}/{p.capacity}
          </button>
        </div>
      </header>

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 p-6 bg-black/20 backdrop-blur-md">
          <h3 className="font-mono text-xs uppercase text-ash tracking-wider mb-6">Pod Members ({members.length})</h3>
          <ul className="space-y-4 overflow-y-auto">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-ink-deep bg-harbor-teal text-xs uppercase overflow-hidden border border-white/10">
                  {m.profiles?.avatar_url ? (
                    <img src={m.profiles.avatar_url} alt={m.profiles.handle} className="w-full h-full object-cover" />
                  ) : (
                    (m.profiles?.handle || '??').substring(0, 2)
                  )}
                </div>
                <div>
                  <p className="text-xs text-parchment font-semibold">{m.profiles?.display_name || `@${m.profiles?.handle}`}</p>
                  {m.profiles?.display_name && <p className="text-[10px] text-ash font-mono">@{m.profiles?.handle}</p>}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Mobile Members Drawer */}
        <AnimatePresence>
          {showMobileMembers && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden absolute top-0 left-0 right-0 z-30 glass-panel border-b border-white/10 p-4 shadow-2xl max-h-60 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono uppercase text-ash">Pod Members ({members.length})</span>
                <button onClick={() => setShowMobileMembers(false)} className="text-ash"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {members.map((m) => (
                  <div key={m.user_id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-harbor-teal text-ink-deep font-bold text-[10px] flex items-center justify-center overflow-hidden">
                      {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (m.profiles?.handle || '??').substring(0, 2)}
                    </div>
                    <span className="text-xs text-parchment font-mono truncate">@{m.profiles?.handle}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Column */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto no-scrollbar scroll-smooth relative px-4">
          <div className="w-full max-w-2xl pt-6 pb-48 flex flex-col gap-6">

            {/* Seed prompt */}
            {p.seedPrompt && (
              <div className="glass-card p-5 rounded-2xl border border-white/10 text-center mb-2">
                <span className="text-[10px] uppercase font-mono text-ash tracking-widest block mb-1">Seed Question</span>
                <p className="text-parchment font-serif text-lg italic">"{p.seedPrompt}"</p>
              </div>
            )}

            {/* Closing statement banner if fully formed */}
            {isClosed && (
              <div className="glass-panel p-6 rounded-2xl border border-philosophy-gold/40 bg-philosophy-gold/5 text-center my-2 space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-philosophy-gold font-bold flex items-center justify-center gap-1.5">
                  <Award size={16} /> Fully Formed Conclusion
                </span>
                <p className="font-serif text-lg text-parchment italic">
                  "{p.closingStatement || 'This conversation reached clarity and concluded.'}"
                </p>
              </div>
            )}

            {/* 10-message graduation prompt banner for creator */}
            {messages.length >= 10 && !isClosed && isCreator && (
              <div className="glass-panel p-4 rounded-2xl border border-sage-signal/30 bg-sage-signal/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h4 className="font-serif text-parchment font-semibold text-sm flex items-center gap-1.5 justify-center sm:justify-start">
                    <Sparkles size={16} className="text-sage-signal" /> 10 Responses Completed
                  </h4>
                  <p className="text-xs text-ash">Has this thought turned from half-formed to fully formed?</p>
                </div>
                <button
                  onClick={() => setShowGraduateModal(true)}
                  className="px-4 py-2 bg-sage-signal text-ink-deep font-bold rounded-full text-xs hover:bg-white transition-colors shadow-lg flex-shrink-0"
                >
                  Graduate & Close Pod →
                </button>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-ash" size={24} />
              </div>
            )}

            {!loading && timelineItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-ash font-mono text-sm">No messages yet. Be the first to share a thought.</p>
              </div>
            )}

            {/* Render Timeline Items (Messages & Polls) */}
            <AnimatePresence>
              {timelineItems.map((item) => {
                if (item.type === 'poll') {
                  return (
                    <PollCard
                      key={`poll_${item.data.id}`}
                      poll={item.data}
                      votes={votes}
                      onVote={votePoll}
                      onAddOption={addOptionToPoll}
                      currentUser={user}
                    />
                  );
                }

                const msg = item.data;
                return (
                  <motion.div
                    key={`msg_${msg.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="group relative glass-card p-5 rounded-2xl border border-white/5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-harbor-teal text-ink-deep font-bold text-xs flex items-center justify-center uppercase overflow-hidden border border-white/10 flex-shrink-0">
                        {msg.author.avatarUrl ? (
                          <img src={msg.author.avatarUrl} alt={msg.author.displayName || msg.author.handle} className="w-full h-full object-cover" />
                        ) : (
                          (msg.author.displayName || msg.author.handle || '??').substring(0, 2)
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-parchment font-mono">
                          {msg.author.displayName || `@${msg.author.handle}`}
                        </span>
                        {msg.author.displayName && (
                          <span className="text-[11px] font-mono text-ash ml-2">@{msg.author.handle}</span>
                        )}
                      </div>
                      {msg.replyMode === 'steelman' && (
                        <span className="text-[10px] uppercase font-mono tracking-wider bg-sage-signal/15 text-sage-signal border border-sage-signal/30 px-2 py-0.5 rounded ml-auto sm:ml-0">
                          Steelman First
                        </span>
                      )}
                      {msg.replyMode === 'question' && (
                        <span className="text-[10px] uppercase font-mono tracking-wider bg-dusk-lavender/15 text-dusk-lavender border border-dusk-lavender/30 px-2 py-0.5 rounded">
                          Question
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-ash/50 ml-auto">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-base sm:text-lg leading-relaxed text-parchment/90">{msg.content}</p>

                    {/* Reactions */}
                    <div className="flex flex-wrap gap-2 mt-4 opacity-90 transition-opacity">
                      {['resonates', 'curious', 'changed_my_mind'].map(type => (
                        <button
                          key={type}
                          onClick={() => toggleReaction(msg.id, type)}
                          className="flex items-center gap-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors border border-white/10"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            type === 'resonates' ? 'bg-sage-signal' :
                            type === 'curious' ? 'bg-dusk-lavender' : 'bg-philosophy-gold'
                          }`} />
                          {type.replace('_', ' ')} ({msg.reactions[type] || 0})
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Compose or Join Banner */}
      <div className="absolute bottom-0 left-0 right-0 lg:left-64 pointer-events-none p-2 sm:p-4 flex justify-center z-30">
        {isClosed ? (
          <div className="pointer-events-auto w-full max-w-2xl glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl text-center">
            <p className="text-xs font-mono text-ash">This pod has graduated into a fully formed idea and is now read-only.</p>
          </div>
        ) : !isMember ? (
          <div className="pointer-events-auto w-full max-w-2xl glass-panel p-4 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h4 className="font-serif text-parchment font-semibold text-base">You are viewing this Pod</h4>
              <p className="text-ash text-xs">Join to contribute your thoughts, polls, and reactions.</p>
            </div>
            <button
              onClick={handleJoinThisPod}
              className="px-6 py-2.5 bg-sage-signal text-ink-deep font-bold rounded-full text-xs hover:bg-white transition-colors shadow-lg flex items-center gap-1.5 flex-shrink-0"
            >
              <UserPlus size={14} /> Join Pod Now
            </button>
          </div>
        ) : (
          <form onSubmit={handlePost} className="pointer-events-auto w-full max-w-2xl bg-black/85 backdrop-blur-2xl border border-white/15 p-3 rounded-2xl shadow-2xl space-y-2">
            
            {/* Mode selection tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { key: 'add', icon: MessageSquarePlus, label: 'Add Thought' },
                { key: 'question', icon: HelpCircle, label: 'Question' },
                { key: 'steelman', icon: Shield, label: 'Steelman' },
                { key: 'poll', icon: BarChart2, label: 'Create Poll' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    activeTab === key
                      ? key === 'poll'
                        ? 'bg-philosophy-gold/20 text-philosophy-gold border border-philosophy-gold/30 font-semibold'
                        : key === 'steelman'
                        ? 'bg-sage-signal/20 text-sage-signal border border-sage-signal/30 font-semibold'
                        : 'bg-white/15 text-parchment font-semibold'
                      : 'text-ash hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Poll Form inputs */}
            {activeTab === 'poll' ? (
              <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/10">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question for the pod to vote on..."
                  className="glass-input w-full rounded-lg p-2 text-xs text-parchment outline-none"
                />
                <div className="space-y-1.5">
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="glass-input w-full rounded-lg p-2 text-xs text-parchment outline-none"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center pt-1">
                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-[11px] font-mono text-sage-signal hover:underline"
                    >
                      + Add another option slot
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-1.5 bg-philosophy-gold text-ink-deep font-bold text-xs rounded-lg hover:bg-white transition-colors"
                  >
                    Post Poll →
                  </button>
                </div>
              </div>
            ) : (
              /* Regular Message Input */
              <div className="flex items-end gap-2 bg-white/5 rounded-xl p-2 focus-within:bg-white/10 transition-colors">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={activeTab === 'steelman' ? 'I hear you saying... and to build on that...' : 'Share a half-formed thought...'}
                  className="w-full bg-transparent resize-none outline-none min-h-[44px] text-parchment placeholder-ash/50 p-2 text-sm md:text-base leading-relaxed"
                  rows={1}
                />
                <button type="submit" className="flex-shrink-0 w-10 h-10 rounded-xl bg-parchment text-ink-deep flex items-center justify-center font-bold hover:bg-white transition-colors">
                  ↑
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Graduation Modal Overlay */}
      <AnimatePresence>
        {showGraduateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-philosophy-gold/40 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl text-parchment flex items-center gap-2">
                  <Award size={22} className="text-philosophy-gold" /> Graduate Conversation
                </h3>
                <button onClick={() => setShowGraduateModal(false)} className="text-ash hover:text-white"><X size={20} /></button>
              </div>

              <p className="text-xs text-ash leading-relaxed">
                Has the central question of this pod been sufficiently explored? Write a brief closing statement summarizing the collective consensus or key divergence.
              </p>

              <form onSubmit={handleGraduatePodSubmit} className="space-y-4">
                <textarea
                  value={closingStatement}
                  onChange={(e) => setClosingStatement(e.target.value)}
                  placeholder="e.g. We realized that isolation in suburbs stems not from physical layout alone, but from missing third-places..."
                  rows={4}
                  required
                  className="glass-input w-full rounded-2xl p-3.5 text-sm leading-relaxed"
                />

                <button
                  type="submit"
                  disabled={closing || !closingStatement.trim()}
                  className="w-full py-3.5 bg-philosophy-gold text-ink-deep font-bold text-xs rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {closing ? <Loader2 className="animate-spin" size={16} /> : 'Graduate & Preserve Pod →'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
