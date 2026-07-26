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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-5 w-full sm:w-auto">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-harbor-teal text-ink-deep font-serif font-bold text-2xl flex items-center justify-center uppercase overflow-hidden border-2 border-white/20 shadow-lg">
                {avatarPreview || user.avatar_url ? (
                  <img src={avatarPreview || user.avatar_url} alt={user.handle} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-90 transition-opacity">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </label>
              )}
            </div>

            {/* Names & Handle */}
            {!isEditing ? (
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-parchment font-semibold">
                  {user.display_name || `@${user.handle}`}
                </h1>
                {user.display_name && (
                  <p className="text-xs font-mono text-ash font-medium">@{user.handle}</p>
                )}
                <p className="text-[11px] font-mono text-ash/80 mt-1">
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                {(user.trust_score || 0) > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-sage-signal bg-sage-signal/10 border border-sage-signal/20 px-3 py-0.5 rounded-full mt-2">
                    <Star size={13} className="fill-sage-signal" /> Trust Score: {user.trust_score}
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-parchment outline-none focus:border-sage-signal"
                />
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm font-mono text-parchment">
                  <span className="text-ash">@</span>
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
                  className="flex items-center gap-1.5 text-xs font-mono text-parchment bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-colors border border-white/10"
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 text-xs font-mono text-ash hover:text-parchment bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors border border-white/5"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || imageUploading}
                  className="flex items-center gap-1.5 text-xs font-mono text-ink-deep bg-sage-signal hover:bg-white px-4 py-2 rounded-xl transition-colors font-bold disabled:opacity-50"
                >
                  {saving || imageUploading ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Save</>}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 text-xs font-mono text-ash hover:text-parchment bg-white/5 px-3 py-2 rounded-xl"
                >
                  <X size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Stats */}
        {statsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ash" size={24} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {[
                { value: stats.podsJoined, label: 'Pods Joined', color: 'text-parchment' },
                { value: stats.resonances, label: 'Resonances', color: 'text-sage-signal' },
                { value: stats.steelmans, label: 'Steelmans', color: 'text-dusk-lavender' },
                { value: stats.archived, label: 'Archived', color: 'text-philosophy-gold' },
              ].map(({ value, label, color }) => (
                <div key={label} className="glass-card p-4 rounded-2xl border border-white/5 text-center">
                  <span className={`block text-2xl font-serif font-bold ${color} mb-1`}>{value}</span>
                  <span className="text-[10px] font-mono text-ash uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ash mb-4">Recent Activity</h2>
              {activity.length === 0 ? (
                <p className="text-xs text-ash font-mono">No activity yet. Join a pod and share a thought!</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a) => (
                    <div key={a.id} className="p-4 rounded-2xl glass-card border border-white/5 flex items-start gap-3">
                      {a.type === 'steelman' ? (
                        <ShieldCheck className="text-sage-signal flex-shrink-0 mt-0.5" size={18} />
                      ) : (
                        <MessageCircle className="text-dusk-lavender flex-shrink-0 mt-0.5" size={18} />
                      )}
                      <div>
                        <p className="text-sm text-parchment font-medium">
                          {a.type === 'steelman' ? 'Contributed a Steelman response' :
                           a.type === 'question' ? 'Asked a Question' : 'Shared a Thought'}
                        </p>
                        <p className="text-xs text-ash mt-0.5">
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
