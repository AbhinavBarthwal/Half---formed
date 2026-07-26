import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useThoughts() {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThoughts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('thoughts')
      .select(`
        id, image_url, caption, art_mode, view_count, created_at, pod_id,
        author:profiles!author_id ( id, handle, display_name, avatar_url ),
        thought_comments ( id )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(row => ({
        id: row.id,
        imageUrl: row.image_url,
        caption: row.caption,
        artMode: row.art_mode,
        viewCount: row.view_count,
        createdAt: row.created_at,
        podId: row.pod_id,
        commentCount: row.thought_comments?.length || 0,
        author: {
          id: row.author?.id,
          handle: row.author?.handle || 'anonymous',
          displayName: row.author?.display_name,
          avatarUrl: row.author?.avatar_url,
        }
      }));
      setThoughts(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThoughts();
  }, []);

  const createThought = async ({ imageUrl, caption, artMode }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in to post a thought');

    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        author_id: user.id,
        image_url: imageUrl,
        caption,
        art_mode: artMode,
      })
      .select(`
        id, image_url, caption, art_mode, view_count, created_at, pod_id,
        author:profiles!author_id ( id, handle, display_name, avatar_url )
      `)
      .single();

    if (error) throw error;
    fetchThoughts();
    return data;
  };

  return { thoughts, loading, refreshThoughts: fetchThoughts, createThought };
}

export function useThoughtComments(thoughtId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    if (!thoughtId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('thought_comments')
      .select(`
        id, content, created_at,
        author:profiles!author_id ( id, handle, display_name, avatar_url )
      `)
      .eq('thought_id', thoughtId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        author: {
          id: c.author?.id,
          handle: c.author?.handle || 'anonymous',
          displayName: c.author?.display_name,
          avatarUrl: c.author?.avatar_url,
        }
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    if (!thoughtId) return;

    const channel = supabase
      .channel(`thought_comments:${thoughtId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'thought_comments',
        filter: `thought_id=eq.${thoughtId}`,
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thoughtId]);

  const addComment = async (content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in required to comment');

    const { error } = await supabase
      .from('thought_comments')
      .insert({
        thought_id: thoughtId,
        author_id: user.id,
        content,
      });

    if (error) throw error;
  };

  return { comments, loading, addComment };
}
