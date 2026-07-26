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

  const uploadCanvas = async (canvas, folder = 'thoughts') => {
    if (!canvas) return null;
    setUploading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setUploading(false);
          reject(new Error('Canvas to blob failed'));
          return;
        }
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const userId = user ? user.id : 'anon';
          const fileName = `${userId}/${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;

          const { data, error: uploadErr } = await supabase.storage
            .from('images')
            .upload(fileName, blob, { contentType: 'image/png', upsert: true });

          if (uploadErr) throw uploadErr;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(data.path);

          setUploading(false);
          resolve(publicUrl);
        } catch (err) {
          console.error('Canvas upload failed:', err.message);
          setError(err.message);
          setUploading(false);
          reject(err);
        }
      }, 'image/png');
    });
  };

  return { uploadImage, uploadCanvas, uploading, error };
}

