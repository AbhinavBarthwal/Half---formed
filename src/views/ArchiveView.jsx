import React from 'react';
import { Archive, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useArchives } from '../hooks/useArchives.js';

export default function ArchiveView() {
  const { archives, loading } = useArchives();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 md:pb-24">
      <div className="flex items-center gap-3 mb-2">
        <Archive className="text-crimson-700 dark:text-crimson-400" size={24} />
        <span className="text-xs uppercase tracking-widest font-mono font-extrabold text-slateContrast-700 dark:text-slateContrast-300">Preserved Summaries</span>
      </div>

      <h1 className="font-serif text-4xl md:text-5xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold mb-4">
        The Pod Archive
      </h1>

      <p className="text-slateContrast-700 dark:text-slateContrast-300 text-base md:text-lg mb-10 max-w-2xl font-medium">
        Raw transcripts decay into summarized points of consensus and divergence. Ideas preserved, surveillance removed.
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
            className="glass-2 p-6 md:p-8 rounded-3xl border border-slateContrast-300/40 dark:border-navy-400/25 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-mono uppercase tracking-widest font-extrabold"
                style={{ color: item.topic?.color || '#c1121f' }}
              >
                {item.topic?.name}
              </span>
              {item.archivedAt && (
                <span className="text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300">
                  {new Date(item.archivedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl text-slateContrast-900 dark:text-slateContrast-50 font-bold mb-4">{item.title}</h2>

            {item.summary ? (
              <>
                <p className="text-slateContrast-800 dark:text-slateContrast-200 leading-relaxed font-medium mb-6">{item.summary}</p>

                {Array.isArray(item.keyThreads) && item.keyThreads.length > 0 && (
                  <div className="glass-1 rounded-xl p-4 border border-slateContrast-300/30 dark:border-navy-400/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-crimson-700 dark:text-crimson-400 uppercase tracking-wider font-extrabold mb-2">
                      <Sparkles size={14} /> Key Threads
                    </div>
                    {item.keyThreads.map((t, idx) => (
                      <p key={idx} className="text-xs text-slateContrast-800 dark:text-slateContrast-200 leading-relaxed font-sans font-medium">
                        • {typeof t === 'string' ? t : t.topic || JSON.stringify(t)}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm font-bold italic">Summary not yet generated.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
