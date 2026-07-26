import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useArticles(topicId = null) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select(`
        id, title, content, excerpt, cover_image_url, created_at,
        topic:topics!topic_id ( id, name, slug, accent_hex ),
        author:profiles!author_id ( id, handle, display_name, avatar_url )
      `)
      .order('created_at', { ascending: false });

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setArticles(data.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        coverImageUrl: row.cover_image_url,
        createdAt: row.created_at,
        topic: row.topic,
        author: {
          id: row.author?.id,
          handle: row.author?.handle || 'anonymous',
          displayName: row.author?.display_name,
          avatarUrl: row.author?.avatar_url,
        }
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, [topicId]);

  const createArticle = async ({ title, content, excerpt, coverImageUrl, topicId }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to post an article');

    const { data, error } = await supabase
      .from('articles')
      .insert({
        author_id: user.id,
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        cover_image_url: coverImageUrl,
        topic_id: topicId,
      })
      .select()
      .single();

    if (error) throw error;
    fetchArticles();
    return data;
  };

  return { articles, loading, refreshArticles: fetchArticles, createArticle };
}
