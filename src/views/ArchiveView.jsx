import React from 'react';
import { Archive, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useArchives } from '../hooks/useArchives.js';

export default function ArchiveView() {
  const { archives, loading } = useArchives();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Archive className="text-dusk-lavender" size={24} />
        <span className="text-xs uppercase tracking-widest font-mono text-ash">Preserved Summaries</span>
      </div>

      <h1 className="font-serif text-4xl md:text-5xl text-parchment mb-4">
        The Pod Archive
      </h1>

      <p className="text-ash text-base md:text-lg mb-10 max-w-2xl">
        Raw transcripts decay into summarized points of consensus and divergence. Ideas preserved, surveillance removed.
      </p>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-ash" size={24} />
        </div>
      )}

      {!loading && archives.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-white/10 p-8">
          <p className="text-ash font-mono text-sm">No archived pods yet. Active pods will appear here once their conversations conclude.</p>
        </div>
      )}

      <div className="grid gap-6">
        {archives.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-mono uppercase tracking-widest font-semibold"
                style={{ color: item.topic?.color }}
              >
                {item.topic?.name}
              </span>
              {item.archivedAt && (
                <span className="text-xs font-mono text-ash">
                  {new Date(item.archivedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl text-parchment mb-4">{item.title}</h2>

            {item.summary ? (
              <>
                <p className="text-parchment/80 leading-relaxed mb-6">{item.summary}</p>

                {Array.isArray(item.keyThreads) && item.keyThreads.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-ash uppercase tracking-wider mb-2">
                      <Sparkles size={14} className="text-philosophy-gold" /> Key Threads
                    </div>
                    {item.keyThreads.map((t, idx) => (
                      <p key={idx} className="text-xs text-ash/90 leading-relaxed font-sans">
                        • {typeof t === 'string' ? t : t.topic || JSON.stringify(t)}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-ash text-sm italic">Summary not yet generated.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
