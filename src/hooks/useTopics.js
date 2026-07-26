import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching topics:', error.message);
    } else {
      setTopics(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTopics();

    // Subscribe to topics changes (when new community vertical is added)
    const channel = supabase
      .channel('topics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, () => {
        fetchTopics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTopics]);

  const createTopic = async ({ name, accentHex = '#4F8583', discussionMode = 'open' }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('topics')
      .insert({
        name,
        slug,
        accent_hex: accentHex,
        discussion_mode: discussionMode,
        is_community: true,
        created_by: user ? user.id : null,
      })
      .select()
      .single();

    if (error) throw error;
    fetchTopics();
    return data;
  };

  return { topics, loading, createTopic, refreshTopics: fetchTopics };
}
