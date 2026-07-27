import React from 'react';
import { Archive, Sparkles, Loader2, CheckCircle2, GitFork, ShieldCheck } from 'lucide-react';
import { useArchives } from '../hooks/useArchives.js';

export default function ArchiveView() {
  const { archives, loading } = useArchives();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 md:pb-24">
      <div className="flex items-center gap-3 mb-2">
        <Archive className="text-crimson-700 dark:text-crimson-400" size={24} />
        <span className="text-xs uppercase tracking-widest font-mono font-extrabold text-slateContrast-700 dark:text-slateContrast-300">Fading Chat Archives</span>
      </div>

      <h1 className="font-serif text-4xl md:text-5xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold mb-4">
        The Pod Archive
      </h1>

      <p className="text-slateContrast-700 dark:text-slateContrast-300 text-base md:text-lg mb-10 max-w-2xl font-medium">
        Raw transcripts decay into preserved summaries of what everyone agreed or disagreed on. Ideas preserved, surveillance removed.
      </p>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-slateContrast-600 dark:text-slateContrast-400" size={24} />
        </div>
      )}

      {!loading && archives.length === 0 && (
        <div className="text-center py-12 glass-2 rounded-3xl border border-slateContrast-300/40 dark:border-navy-400/30 p-8">
          <p className="text-slateContrast-800 dark:text-slateContrast-200 font-mono text-sm font-bold">No archived pods yet. Active pods will appear here once their conversations conclude.</p>
        </div>
      )}

      <div className="grid gap-6">
        {archives.map((item) => (
          <div
            key={item.id}
            className="glass-2 p-6 md:p-8 rounded-3xl border border-slateContrast-300/40 dark:border-navy-400/25 shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono uppercase tracking-widest font-extrabold"
                  style={{ color: item.topic?.color || '#c1121f' }}
                >
                  {item.topic?.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-sage-signal/15 text-sage-signal border border-sage-signal/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> Transcripts Decayed • Summary Preserved
                </span>
              </div>
              {item.archivedAt && (
                <span className="text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300">
                  {new Date(item.archivedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl text-slateContrast-900 dark:text-slateContrast-50 font-bold">{item.title}</h2>

            {item.summary ? (
              <div className="space-y-4">
                {/* Overall Summary */}
                <p className="text-slateContrast-800 dark:text-slateContrast-200 leading-relaxed font-medium text-sm md:text-base glass-1 p-4 rounded-xl border border-slateContrast-300/30 dark:border-navy-400/20">
                  {item.summary}
                </p>

                {/* Points of Consensus */}
                {Array.isArray(item.consensusPoints) && item.consensusPoints.length > 0 && (
                  <div className="bg-sage-signal/10 rounded-2xl p-4 border border-sage-signal/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-sage-signal uppercase tracking-wider font-extrabold">
                      <CheckCircle2 size={16} /> Points of Consensus (Agreements)
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {item.consensusPoints.map((point, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-slateContrast-900 dark:text-slateContrast-100 font-medium flex items-start gap-2">
                          <span className="text-sage-signal font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Points of Divergence */}
                {Array.isArray(item.divergencePoints) && item.divergencePoints.length > 0 && (
                  <div className="bg-dusk-lavender/10 rounded-2xl p-4 border border-dusk-lavender/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-dusk-lavender uppercase tracking-wider font-extrabold">
                      <GitFork size={16} /> Points of Divergence (Disagreements)
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {item.divergencePoints.map((point, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-slateContrast-900 dark:text-slateContrast-100 font-medium flex items-start gap-2">
                          <span className="text-dusk-lavender font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Threads (if any) */}
                {Array.isArray(item.keyThreads) && item.keyThreads.length > 0 && (
                  <div className="glass-1 rounded-xl p-4 border border-slateContrast-300/30 dark:border-navy-400/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-crimson-700 dark:text-crimson-400 uppercase tracking-wider font-extrabold">
                      <Sparkles size={14} /> Key Discussion Threads
                    </div>
                    {item.keyThreads.map((t, idx) => (
                      <p key={idx} className="text-xs text-slateContrast-800 dark:text-slateContrast-200 leading-relaxed font-sans font-medium">
                        • {typeof t === 'string' ? t : t.topic || JSON.stringify(t)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm font-bold italic">Summary not yet generated.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
