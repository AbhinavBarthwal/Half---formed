import React, { useState } from 'react';
import { Star, MessageCircle, ShieldCheck, LogOut, Loader2, Edit3, Camera, Check, X } from 'lucide-react';
import { useProfileStats } from '../hooks/useProfileStats.js';
import { useAuth } from '../hooks/useAuth.js';
import { useImageUpload } from '../hooks/useImageUpload.js';

export default function ProfileView({ user, onSignOut }) {
  const { stats, activity, loading: statsLoading } = useProfileStats(user?.id);
  const { updateProfile } = useAuth();
  const { uploadImage, uploading: imageUploading } = useImageUpload();

  const [isEditing, setIsEditing] = useState(false);
  const [handle, setHandle] = useState(user?.handle || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const initials = (user.handle || '??').substring(0, 2).toUpperCase();

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!handle || handle.length < 3) return;

    setSaving(true);
    setError(null);

    try {
      let uploadedUrl = user?.avatar_url || null;
      if (avatarFile) {
        uploadedUrl = await uploadImage(avatarFile, 'avatars');
      }

      await updateProfile({
        handle,
        displayName: displayName.trim() || handle,
        avatarUrl: uploadedUrl,
      });

      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-32 md:pb-24">
      <div className="glass-3 p-6 sm:p-8 rounded-3xl border border-slateContrast-300/40 dark:border-navy-400/30 shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-slateContrast-300/30 dark:border-navy-400/20">
          <div className="flex items-center gap-5 w-full sm:w-auto">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-crimson-700 dark:bg-navy-400 text-white font-serif font-bold text-2xl flex items-center justify-center uppercase overflow-hidden border-2 border-white/20 shadow-lg">
                {avatarPreview || user.avatar_url ? (
                  <img src={avatarPreview || user.avatar_url} alt={user.handle} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-90 transition-opacity">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </label>
              )}
            </div>

            {/* Names & Handle */}
            {!isEditing ? (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-slateContrast-900 dark:text-slateContrast-50 font-extrabold">
                  {user.display_name || `@${user.handle}`}
                </h1>
                {user.display_name && (
                  <p className="text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300">@{user.handle}</p>
                )}
                <p className="text-[11px] font-mono font-bold text-slateContrast-600 dark:text-slateContrast-400 mt-1">
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                {(user.trust_score || 0) > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-crimson-700 dark:text-crimson-400 bg-crimson-700/10 border border-crimson-700/30 px-3 py-0.5 rounded-full mt-2">
                    <Star size={13} className="fill-crimson-700 dark:fill-crimson-400" /> Trust Score: {user.trust_score}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="w-full glass-input rounded-xl p-2.5 text-sm font-medium"
                />
                <div className="flex items-center gap-1 glass-input rounded-xl p-2.5 text-sm font-mono font-medium">
                  <span className="text-slateContrast-600 dark:text-slateContrast-400 font-bold">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-slateContrast-900 dark:text-slateContrast-50 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 px-3.5 py-2 rounded-xl transition-colors border border-slateContrast-300/40 dark:border-navy-400/30"
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-crimson-700 dark:text-crimson-400 bg-crimson-700/10 hover:bg-crimson-700/20 px-3.5 py-2 rounded-xl transition-colors border border-crimson-700/30"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || imageUploading}
                  className="flex items-center gap-1.5 text-xs font-mono text-white bg-crimson-700 hover:bg-crimson-900 px-4 py-2 rounded-xl transition-colors font-bold disabled:opacity-50 shadow-md"
                >
                  {saving || imageUploading ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Save</>}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-slateContrast-700 dark:text-slateContrast-300 hover:text-slateContrast-900 dark:hover:text-white px-3 py-2 rounded-xl"
                >
                  <X size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-crimson-700/10 border border-crimson-700/30 text-crimson-800 dark:text-crimson-300 font-mono text-xs font-bold">
            {error}
          </div>
        )}

        {/* Stats */}
        {statsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slateContrast-600 dark:text-slateContrast-400" size={24} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {[
                { value: stats.podsJoined, label: 'Pods Joined', color: 'text-slateContrast-900 dark:text-slateContrast-50' },
                { value: stats.resonances, label: 'Resonances', color: 'text-crimson-700 dark:text-crimson-400' },
                { value: stats.steelmans, label: 'Steelmans', color: 'text-navy-700 dark:text-navy-300' },
                { value: stats.archived, label: 'Archived', color: 'text-amber-600 dark:text-amber-400' },
              ].map(({ value, label, color }) => (
                <div key={label} className="glass-2 p-4 rounded-2xl border border-slateContrast-300/30 dark:border-navy-400/20 text-center">
                  <span className={`block text-2xl font-serif font-extrabold ${color} mb-1`}>{value}</span>
                  <span className="text-[10px] font-mono font-extrabold text-slateContrast-700 dark:text-slateContrast-300 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-slateContrast-700 dark:text-slateContrast-300 font-extrabold mb-4">Recent Activity</h2>
              {activity.length === 0 ? (
                <p className="text-xs text-slateContrast-700 dark:text-slateContrast-300 font-mono font-bold">No activity yet. Join a pod and share a thought!</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a) => (
                    <div key={a.id} className="p-4 rounded-2xl glass-2 border border-slateContrast-300/30 dark:border-navy-400/20 flex items-start gap-3">
                      {a.type === 'steelman' ? (
                        <ShieldCheck className="text-crimson-700 dark:text-crimson-400 flex-shrink-0 mt-0.5" size={18} />
                      ) : (
                        <MessageCircle className="text-navy-700 dark:text-navy-300 flex-shrink-0 mt-0.5" size={18} />
                      )}
                      <div>
                        <p className="text-sm text-slateContrast-900 dark:text-slateContrast-50 font-bold">
                          {a.type === 'steelman' ? 'Contributed a Steelman response' :
                           a.type === 'question' ? 'Asked a Question' : 'Shared a Thought'}
                        </p>
                        <p className="text-xs text-slateContrast-700 dark:text-slateContrast-300 font-medium mt-0.5">
                          In pod: "{a.podTitle}" • {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
