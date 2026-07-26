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
    <div className="max-w-xl mx-auto px-6 py-12 pb-32 md:pb-24">
      <div className="glass-3 p-8 rounded-3xl border border-slateContrast-300/40 dark:border-navy-400/30 shadow-2xl backdrop-blur-xl">

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-slateContrast-700 dark:text-slateContrast-300">Step {step} of 2</span>
          <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full bg-crimson-700 dark:bg-navy-300 transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-crimson-700/10 border border-crimson-700/30 text-crimson-800 dark:text-crimson-300 font-mono text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {step === 1 ? (
          <div>
            <h1 className="font-serif text-3xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold mb-2">Sign in to Half-Formed</h1>
            <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm font-medium mb-6">
              Enter your email to receive a magic link. No password needed.
            </p>

            {!sent ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold tracking-widest text-slateContrast-700 dark:text-slateContrast-300 mb-2">Email Address</label>
                  <div className="flex items-center gap-3 glass-input rounded-xl p-3 focus-within:border-crimson-700 transition-colors">
                    <Mail size={18} className="text-slateContrast-600 dark:text-slateContrast-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      required
                      className="w-full bg-transparent outline-none text-slateContrast-900 dark:text-slateContrast-50 text-sm font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-slateContrast-900 text-white dark:bg-slateContrast-50 dark:text-slateContrast-900 font-bold rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 interactive-scale"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <>Send Magic Link <ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <CheckCircle size={48} className="text-crimson-700 dark:text-crimson-400 mx-auto animate-bounce" />
                <h3 className="font-serif text-xl text-slateContrast-900 dark:text-slateContrast-50 font-bold">Magic Link Sent!</h3>
                <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm font-medium">Check your email inbox and click the link to sign in.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSetProfile} className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold mb-1">Set Up Your Profile</h1>
              <p className="text-slateContrast-700 dark:text-slateContrast-300 text-sm font-medium">
                Choose your public pseudonym and display name for half-formed pods.
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden bg-crimson-700 dark:bg-navy-400 text-white flex items-center justify-center font-serif font-bold text-3xl shadow-lg transition-transform group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(handle || '??').substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={22} className="text-white" />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
              <span className="text-xs text-slateContrast-700 dark:text-slateContrast-300 font-mono font-bold">Click to upload photo (optional)</span>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold tracking-widest text-slateContrast-700 dark:text-slateContrast-300 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Quiet Thinker"
                className="w-full glass-input rounded-xl p-3 text-slateContrast-900 dark:text-slateContrast-50 text-sm outline-none font-medium"
              />
            </div>

            {/* Handle */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold tracking-widest text-slateContrast-700 dark:text-slateContrast-300 mb-2">Public Handle</label>
              <div className="flex items-center gap-2 glass-input rounded-xl p-3">
                <span className="font-mono text-slateContrast-600 dark:text-slateContrast-400 text-sm font-bold">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="someone_quiet"
                  required
                  minLength={3}
                  className="w-full bg-transparent outline-none text-slateContrast-900 dark:text-slateContrast-50 text-sm font-mono font-bold"
                />
              </div>
              {handle && handle.length < 3 && (
                <p className="text-xs text-crimson-700 dark:text-crimson-400 mt-1 font-mono font-bold">Handle must be at least 3 characters</p>
              )}
            </div>

            <div className="p-4 rounded-2xl glass-1 border border-slateContrast-300/30 dark:border-navy-400/20 text-xs text-slateContrast-700 dark:text-slateContrast-300 space-y-1">
              <span className="flex items-center gap-1.5 font-extrabold text-slateContrast-900 dark:text-slateContrast-50">
                <Shield size={14} className="text-crimson-700 dark:text-crimson-400" /> Identity Promise
              </span>
              <p className="font-medium">Your email is never shown publicly. Only your handle and avatar represent you.</p>
            </div>

            <button
              type="submit"
              disabled={loading || imageUploading || handle.length < 3}
              className="w-full py-3.5 bg-slateContrast-900 text-white dark:bg-slateContrast-50 dark:text-slateContrast-900 font-bold rounded-xl hover:opacity-90 transition-colors shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 interactive-scale"
            >
              {loading || imageUploading ? <Loader2 className="animate-spin" size={16} /> : 'Enter the Commons →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
