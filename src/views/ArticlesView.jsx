import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, Sparkles, Loader2, X, ImagePlus, ArrowRight, Clock } from 'lucide-react';
import { useArticles } from '../hooks/useArticles.js';
import { useTopics } from '../hooks/useTopics.js';
import { useImageUpload } from '../hooks/useImageUpload.js';

function ArticleReaderModal({ article, onClose, onSpawnPod }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="w-full max-w-3xl glass-3 rounded-3xl overflow-hidden border border-slateContrast-300/40 dark:border-navy-400/30 shadow-2xl my-auto max-h-[90vh] flex flex-col"
      >
        {/* Banner header */}
        {article.coverImageUrl && (
          <div className="h-48 sm:h-64 w-full relative overflow-hidden flex-shrink-0">
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/60 p-2 rounded-full backdrop-blur-md"><X size={18} /></button>
          </div>
        )}

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 glass-2">
          {!article.coverImageUrl && (
            <div className="flex justify-end">
              <button onClick={onClose} className="text-slateContrast-700 dark:text-slateContrast-300 font-bold"><X size={20} /></button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-slateContrast-300/40 dark:border-navy-400/30 bg-black/10 dark:bg-white/10" style={{ color: article.topic?.accent_hex || '#c1121f' }}>
                {article.topic?.name}
              </span>
              <span className="text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300 flex items-center gap-1">
                <Clock size={12} /> {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl text-slateContrast-900 dark:text-slateContrast-50 leading-tight font-extrabold">
              {article.title}
            </h1>

            <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-slateContrast-300/30 dark:border-navy-400/20">
              <div className="w-8 h-8 rounded-full bg-crimson-700 dark:bg-navy-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-white/20">
                {article.author.avatarUrl ? <img src={article.author.avatarUrl} alt="" className="w-full h-full object-cover" /> : (article.author.displayName || article.author.handle)[0]}
              </div>
              <span className="text-xs font-mono font-extrabold text-slateContrast-900 dark:text-slateContrast-100">
                By {article.author.displayName || `@${article.author.handle}`}
              </span>
            </div>
          </div>

          {/* Full Article Content */}
          <div className="max-w-none text-slateContrast-800 dark:text-slateContrast-200 leading-relaxed font-sans font-medium space-y-4 whitespace-pre-wrap text-base sm:text-lg">
            {article.content}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slateContrast-300/30 dark:border-navy-400/20 glass-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300">Turn this article into a discussion pod?</p>
          <button
            onClick={() => { onClose(); onSpawnPod(article); }}
            className="w-full sm:w-auto px-6 py-2.5 bg-crimson-700 text-white font-bold text-xs rounded-full hover:bg-crimson-900 transition-colors flex items-center justify-center gap-1.5 shadow-lg interactive-scale"
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
        className="w-full max-w-2xl glass-3 rounded-3xl p-6 sm:p-8 border border-slateContrast-300/40 dark:border-navy-400/30 shadow-2xl my-auto space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold flex items-center gap-2">
            <PenTool size={20} className="text-crimson-700 dark:text-crimson-400" /> Write Long-Form Article
          </h2>
          <button onClick={onClose} className="text-slateContrast-700 dark:text-slateContrast-300 font-bold"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-2">Topic Vertical</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {topics.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopicId(t.id)}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold text-center transition-all ${
                    topicId === t.id ? 'border-crimson-700 bg-crimson-700 text-white shadow-md' : 'border-slateContrast-300/40 dark:border-navy-400/30 text-slateContrast-800 dark:text-slateContrast-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-2">Article Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. On the Quiet Decay of Digital Public Squares"
              required
              className="w-full glass-input rounded-xl p-3 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-2">Cover Image (Optional)</label>
            {coverPreview ? (
              <div className="relative h-32 rounded-xl overflow-hidden border border-slateContrast-300/30 dark:border-navy-400/20">
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(''); }} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><X size={14} /></button>
              </div>
            ) : (
              <label className="border border-dashed border-slateContrast-400/40 dark:border-navy-400/30 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300">
                <ImagePlus size={18} /> Upload Banner Image
                <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slateContrast-700 dark:text-slateContrast-300 mb-2">Full Article Body</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your full long-form thoughts here..."
              rows={8}
              required
              className="w-full glass-input rounded-xl p-3 text-sm font-medium leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || imageUploading || !topicId || !title || !content}
            className="w-full py-3 bg-slateContrast-900 text-white dark:bg-slateContrast-50 dark:text-slateContrast-900 font-bold text-xs rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 md:pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-crimson-700 dark:text-crimson-400 font-extrabold flex items-center gap-1.5 mb-1">
            <BookOpen size={14} /> Long-Form Publications
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold">
            Articles & Essays
          </h1>
          <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm sm:text-base mt-1 font-medium">
            In-depth reflections written by community members. Read full texts or launch a pod around any essay.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowWriteModal(true)}
            className="px-5 py-2.5 bg-slateContrast-900 text-white dark:bg-slateContrast-50 dark:text-slateContrast-900 font-bold text-xs rounded-full transition-all shadow-lg flex items-center gap-2 flex-shrink-0 interactive-scale"
          >
            <PenTool size={14} /> Publish Article
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-slateContrast-600 dark:text-slateContrast-400" size={28} /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 glass-2 rounded-3xl p-8 border border-slateContrast-300/40 dark:border-navy-400/30 max-w-md mx-auto">
          <p className="text-slateContrast-800 dark:text-slateContrast-200 font-mono text-sm font-bold mb-4">No published articles yet. Write the first essay!</p>
          {currentUser && <button onClick={() => setShowWriteModal(true)} className="text-xs font-mono font-bold text-crimson-700 dark:text-navy-300 underline">Write Article</button>}
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
              className={`glass-2 rounded-3xl overflow-hidden border border-white/15 shadow-xl cursor-pointer flex flex-col justify-between group transition-all relative ${article.coverImageUrl ? 'min-h-[340px] text-white' : ''}`}
            >
              {article.coverImageUrl && (
                <div className="absolute inset-0 z-0">
                  <img src={article.coverImageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Siri-style clear-top black-bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-95" />
                </div>
              )}

              <div className={`p-6 flex-1 flex flex-col justify-end space-y-4 relative z-10 ${article.coverImageUrl ? 'mt-auto' : ''}`}>
                <div>
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border font-bold ${article.coverImageUrl ? 'border-white/30 bg-black/40 text-white' : 'border-white/20 bg-white/10'}`} style={!article.coverImageUrl && article.topic ? { color: article.topic?.accent_hex || '#ffffff' } : {}}>
                    {article.topic?.name}
                  </span>
                  <h3 className={`font-serif text-xl font-bold mt-3 transition-colors line-clamp-2 ${article.coverImageUrl ? 'text-white group-hover:text-white/80' : 'text-white group-hover:text-white/80'}`}>
                    {article.title}
                  </h3>
                  <p className={`text-xs line-clamp-3 leading-relaxed mt-2 font-sans font-medium ${article.coverImageUrl ? 'text-white/90' : 'text-white/70'}`}>
                    {article.excerpt}
                  </p>
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono font-bold ${article.coverImageUrl ? 'border-white/20 text-white/80' : 'border-white/10 text-white/70'}`}>
                  <span>By {article.author.displayName || `@${article.author.handle}`}</span>
                  <span className={`flex items-center gap-1 group-hover:translate-x-1 transition-transform ${article.coverImageUrl ? 'text-white' : 'text-white'}`}>Read Essay <ArrowRight size={13} /></span>
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
