import React, { useState, useEffect } from 'react';
import { usePods } from '../hooks/usePods.js';
import { useTopics } from '../hooks/useTopics.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { Loader2, ImagePlus, X } from 'lucide-react';

export default function StartPodView({ onPodCreated, prefillData }) {
  const { topics, loading: topicsLoading } = useTopics();
  const { createPod } = usePods();
  const { uploadImage, uploading: imageUploading } = useImageUpload();

  const [topicId, setTopicId] = useState(prefillData?.initialTopicId || '');
  const [title, setTitle] = useState(prefillData?.initialTitle || '');
  const [seed, setSeed] = useState(prefillData?.initialSeed || '');
  const [capacity, setCapacity] = useState(8);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(prefillData?.initialImageUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.initialTitle) setTitle(prefillData.initialTitle);
      if (prefillData.initialSeed) setSeed(prefillData.initialSeed);
      if (prefillData.initialImageUrl) setCoverPreview(prefillData.initialImageUrl);
      if (prefillData.initialTopicId) setTopicId(prefillData.initialTopicId);
    }
  }, [prefillData]);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !seed || !topicId) return;

    setSubmitting(true);
    setError(null);

    try {
      let imageUrl = prefillData?.initialImageUrl || null;
      if (coverFile) {
        imageUrl = await uploadImage(coverFile, 'pod_covers');
      }

      const created = await createPod({ title, seed, topicId, capacity, imageUrl });
      onPodCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <h1 className="font-serif text-3xl md:text-4xl text-parchment mb-2">
          Start a New Conversation Pod
        </h1>
        <p className="text-ash text-sm mb-8">
          Define a topic vertical, cover image, and seed question to invite bounded responses.
        </p>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Topic Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-3">Topic Vertical</label>
            {topicsLoading ? (
              <Loader2 className="animate-spin text-ash" size={20} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTopicId(t.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      topicId === t.id ? 'border-white/40 bg-white/10 font-bold' : 'border-white/5 bg-white/[0.02] text-ash'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.accent_hex }} />
                    <span className="text-sm font-mono truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-2">Pod Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Suburbs & Unstated Isolation"
              required
              className="glass-input w-full rounded-2xl p-3.5 text-sm"
            />
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-2">Cover Photo (Optional)</label>
            {coverPreview ? (
              <div className="relative h-40 rounded-2xl overflow-hidden border border-white/10 group">
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-ash hover:text-white backdrop-blur-md"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all">
                <ImagePlus size={24} className="text-ash" />
                <span className="text-xs text-ash font-mono">Upload Pod Banner Photo</span>
                <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* Seed Prompt */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-2">Seed Question / Prompt</label>
            <textarea
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Frame the question clearly. What design trade-off are we exploring?"
              rows={3}
              required
              className="glass-input w-full rounded-2xl p-3.5 text-sm leading-relaxed"
            />
          </div>

          {/* Capacity */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono uppercase tracking-widest text-ash">Room Capacity</label>
              <span className="text-xs font-mono text-sage-signal font-bold">{capacity} members max</span>
            </div>
            <input
              type="range" min="2" max="20"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full accent-sage-signal cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || imageUploading || !topicId || !title || !seed}
            className="w-full py-3.5 bg-parchment text-ink-deep font-semibold rounded-2xl hover:bg-white transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting || imageUploading ? <><Loader2 className="animate-spin" size={16} /> Creating...</> : 'Launch Pod →'}
          </button>
        </form>
      </div>
    </div>
  );
}
