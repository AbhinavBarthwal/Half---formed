import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Shield, ArrowRight, Loader2, AlertCircle, Upload, User, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useImageUpload } from '../hooks/useImageUpload.js';

export default function OnboardingView({ onComplete }) {
  const { signInWithEmail, updateProfile, session, user } = useAuth();
  const { uploadImage, uploading: imageUploading } = useImageUpload();

  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [step, setStep] = useState(session ? 2 : 1);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session && step === 1) {
      setStep(2);
    }
  }, [session, step]);

  useEffect(() => {
    if (session && user && !user.handle?.startsWith('user_')) {
      onComplete();
    }
  }, [session, user, onComplete]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSetProfile = async (e) => {
    e.preventDefault();
    if (!handle || handle.length < 3) return;
    setLoading(true);
    setError(null);

    try {
      let uploadedAvatarUrl = user?.avatar_url || null;
      if (avatarFile) {
        uploadedAvatarUrl = await uploadImage(avatarFile, 'avatars');
      }

      await updateProfile({
        handle,
        displayName: displayName.trim() || handle,
        avatarUrl: uploadedAvatarUrl,
      });

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-ash">Step {step} of 2</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full bg-sage-signal transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {step === 1 ? (
          <div>
            <h1 className="font-serif text-3xl text-parchment mb-2">Sign in to Half-Formed</h1>
            <p className="text-ash text-sm mb-6">
              Enter your email to receive a magic link. No password needed.
            </p>

            {!sent ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-2">Email Address</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-sage-signal transition-colors">
                    <Mail size={18} className="text-ash" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      required
                      className="w-full bg-transparent outline-none text-parchment text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-parchment text-ink-deep font-semibold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <>Send Magic Link <ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <CheckCircle size={48} className="text-sage-signal mx-auto animate-bounce" />
                <h3 className="font-serif text-xl text-parchment">Magic Link Sent!</h3>
                <p className="text-ash text-sm">Check your email inbox and click the link to sign in.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSetProfile} className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl text-parchment mb-1">Set Up Your Profile</h1>
              <p className="text-ash text-sm">
                Choose your public pseudonym and display name for half-formed pods.
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden bg-harbor-teal flex items-center justify-center text-ink-deep font-serif font-bold text-3xl shadow-lg transition-transform group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(handle || '??').substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={22} className="text-white" />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
              <span className="text-xs text-ash font-mono">Click to upload photo (optional)</span>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Quiet Thinker"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-parchment text-sm outline-none focus:border-sage-signal transition-colors"
              />
            </div>

            {/* Handle */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-ash mb-2">Public Handle</label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-sage-signal transition-colors">
                <span className="font-mono text-ash text-sm">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="someone_quiet"
                  required
                  minLength={3}
                  className="w-full bg-transparent outline-none text-parchment text-sm font-mono"
                />
              </div>
              {handle && handle.length < 3 && (
                <p className="text-xs text-clay-thread mt-1 font-mono">Handle must be at least 3 characters</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-ash space-y-1">
              <span className="flex items-center gap-1.5 font-semibold text-parchment">
                <Shield size={14} className="text-sage-signal" /> Identity Promise
              </span>
              <p>Your email is never shown publicly. Only your handle and avatar represent you.</p>
            </div>

            <button
              type="submit"
              disabled={loading || imageUploading || handle.length < 3}
              className="w-full py-3.5 bg-parchment text-ink-deep font-semibold rounded-xl hover:bg-white transition-colors shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading || imageUploading ? <Loader2 className="animate-spin" size={16} /> : 'Enter the Commons →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
