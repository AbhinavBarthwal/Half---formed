import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file, folder = 'general') => {
    if (!file) return null;
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user ? user.id : 'anon';
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}/${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      setUploading(false);
      return publicUrl;
    } catch (err) {
      console.error('Image upload failed:', err.message);
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  return { uploadImage, uploading, error };
}
