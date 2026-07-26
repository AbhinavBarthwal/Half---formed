import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, Sparkles, Loader2, X, ImagePlus, ArrowRight, Clock } from 'lucide-react';
import { useArticles } from '../hooks/useArticles.js';
import { useTopics } from '../hooks/useTopics.js';
import { useImageUpload } from '../hooks/useImageUpload.js';

function ArticleReaderModal({ article, onClose, onSpawnPod }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="w-full max-w-3xl glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-2xl my-auto max-h-[90vh] flex flex-col"
      >
        {/* Banner header */}
        {article.coverImageUrl && (
          <div className="h-48 sm:h-64 w-full relative overflow-hidden flex-shrink-0">
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 text-ash hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md"><X size={18} /></button>
          </div>
        )}

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {!article.coverImageUrl && (
            <div className="flex justify-end">
              <button onClick={onClose} className="text-ash hover:text-white"><X size={20} /></button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/10 bg-black/40 font-semibold" style={{ color: article.topic?.accent_hex || '#8B9490' }}>
                {article.topic?.name}
              </span>
              <span className="text-xs font-mono text-ash flex items-center gap-1">
                <Clock size={12} /> {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl text-parchment leading-tight font-medium">
              {article.title}
            </h1>

            <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-harbor-teal text-ink-deep font-bold text-xs flex items-center justify-center overflow-hidden border border-white/10">
                {article.author.avatarUrl ? <img src={article.author.avatarUrl} alt="" className="w-full h-full object-cover" /> : (article.author.displayName || article.author.handle)[0]}
              </div>
              <span className="text-xs font-mono text-ash font-medium">
                By {article.author.displayName || `@${article.author.handle}`}
              </span>
            </div>
          </div>

          {/* Full Article Content */}
          <div className="prose prose-invert max-w-none text-parchment/90 leading-relaxed font-sans space-y-4 whitespace-pre-wrap text-base sm:text-lg">
            {article.content}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ash font-mono">Turn this article into a discussion pod?</p>
          <button
            onClick={() => { onClose(); onSpawnPod(article); }}
            className="w-full sm:w-auto px-6 py-2.5 bg-sage-signal text-ink-deep font-bold text-xs rounded-full hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Sparkles size={14} /> Spawn Pod from Article →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateArticleModal({ onClose, onArticleCreated }) {
  const { topics } = useTopics();
  const { createArticle } = useArticles();
  const { uploadImage, uploading: imageUploading } = useImageUpload();

  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !topicId) return;
    setSubmitting(true);
    try {
      let coverImageUrl = null;
      if (coverFile) {
        coverImageUrl = await uploadImage(coverFile, 'articles');
      }

      await createArticle({
        title,
        content,
        excerpt: content.substring(0, 150) + '...',
        coverImageUrl,
        topicId,
      });

      setSubmitting(false);
      onClose();
    } catch (err) {
      alert('Error creating article: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl my-auto space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl text-parchment flex items-center gap-2">
            <PenTool size={20} className="text-philosophy-gold" /> Write Long-Form Article
          </h2>
          <button onClick={onClose} className="text-ash hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-ash mb-2">Topic Vertical</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {topics.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopicId(t.id)}
                  className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all ${
                    topicId === t.id ? 'border-white/40 bg-white/15 text-parchment font-bold' : 'border-white/10 text-ash hover:bg-white/5'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ash mb-2">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. On the Quiet Decay of Digital Public Squares"
              required
              className="w-full glass-input rounded-xl p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ash mb-2">Cover Image (Optional)</label>
            {coverPreview ? (
              <div className="relative h-32 rounded-xl overflow-hidden border border-white/10">
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(''); }} className="absolute top-2 right-2 p-1 bg-black/60 text-ash hover:text-white rounded-full"><X size={14} /></button>
              </div>
            ) : (
              <label className="border border-dashed border-white/15 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all text-xs font-mono text-ash">
                <ImagePlus size={18} /> Upload Banner Image
                <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ash mb-2">Full Article Body</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your full long-form thoughts here..."
              rows={8}
              required
              className="w-full glass-input rounded-xl p-3 text-sm leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || imageUploading || !topicId || !title || !content}
            className="w-full py-3 bg-parchment text-ink-deep font-bold text-xs rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting || imageUploading ? <Loader2 className="animate-spin" size={16} /> : 'Publish Article →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ArticlesView({ onSpawnPodFromArticle, currentUser }) {
  const { articles, loading } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showWriteModal, setShowWriteModal] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-philosophy-gold flex items-center gap-1.5 mb-1">
            <BookOpen size={14} /> Long-Form Publications
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-parchment">
            Articles & Essays
          </h1>
          <p className="text-ash text-sm sm:text-base mt-1">
            In-depth reflections written by community members. Read full texts or launch a pod around any essay.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowWriteModal(true)}
            className="px-5 py-2.5 bg-parchment text-ink-deep font-semibold text-xs rounded-full hover:bg-white transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
          >
            <PenTool size={14} /> Publish Article
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-ash" size={28} /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl p-8 border border-white/10 max-w-md mx-auto">
          <p className="text-ash font-mono text-sm mb-4">No published articles yet. Write the first essay!</p>
          {currentUser && <button onClick={() => setShowWriteModal(true)} className="text-xs font-mono text-sage-signal underline">Write Article</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedArticle(article)}
              className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-pointer flex flex-col justify-between group transition-all"
            >
              {article.coverImageUrl && (
                <div className="h-40 w-full relative overflow-hidden bg-black/40 border-b border-white/10">
                  <img src={article.coverImageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/10 bg-black/30 font-semibold" style={{ color: article.topic?.accent_hex || '#8B9490' }}>
                    {article.topic?.name}
                  </span>
                  <h3 className="font-serif text-xl text-parchment font-medium mt-3 group-hover:text-white transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-ash text-xs line-clamp-3 leading-relaxed mt-2 font-sans">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-ash">
                  <span>By {article.author.displayName || `@${article.author.handle}`}</span>
                  <span className="text-sage-signal flex items-center gap-1 group-hover:translate-x-1 transition-transform">Read Essay <ArrowRight size={13} /></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleReaderModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onSpawnPod={onSpawnPodFromArticle}
          />
        )}

        {showWriteModal && (
          <CreateArticleModal
            onClose={() => setShowWriteModal(false)}
            onArticleCreated={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
