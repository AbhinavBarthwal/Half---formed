import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function usePods(topicFilter = null) {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPods = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('pods')
      .select(`
        id, title, seed_prompt, capacity, status, created_at, created_by, image_url,
        topics ( id, name, slug, accent_hex, discussion_mode ),
        pod_memberships ( user_id )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (topicFilter) {
      // Need to filter by topic slug — use inner join filter
      query = query.eq('topics.slug', topicFilter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching pods:', fetchError.message);
      setError(fetchError.message);
      setPods([]);
    } else {
      // Filter out pods where topic didn't match (Supabase returns them with topics: null)
      const filtered = topicFilter
        ? (data || []).filter(p => p.topics !== null)
        : (data || []);

      setPods(filtered.map(mapPod));
    }

    setLoading(false);
  }, [topicFilter]);

  useEffect(() => {
    fetchPods();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('pods-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pods' }, () => {
        fetchPods();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pod_memberships' }, () => {
        fetchPods();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPods]);

  const createPod = async ({ title, seed, topicId, capacity, imageUrl }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to create a pod');

    const { data, error: insertError } = await supabase
      .from('pods')
      .insert({
        title,
        seed_prompt: seed,
        topic_id: topicId,
        capacity: capacity,
        image_url: imageUrl || null,
        created_by: user.id,
      })
      .select(`
        id, title, seed_prompt, capacity, status, created_at, created_by, image_url,
        topics ( id, name, slug, accent_hex, discussion_mode )
      `)
      .single();

    if (insertError) throw insertError;

    // Auto-join the pod as creator
    await supabase.from('pod_memberships').insert({
      pod_id: data.id,
      user_id: user.id,
    });

    return mapPod({ ...data, pod_memberships: [{ user_id: user.id }] });
  };

  const joinPod = async (podId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to join a pod');

    const { error: joinError } = await supabase
      .from('pod_memberships')
      .upsert({ pod_id: podId, user_id: user.id });

    if (joinError) throw joinError;
    await fetchPods();
  };

  return { pods, loading, error, createPod, joinPod, refetch: fetchPods };
}

// Map raw Supabase row into a clean pod object for the UI
function mapPod(row) {
  return {
    id: row.id,
    title: row.title,
    seedPrompt: row.seed_prompt,
    capacity: row.capacity,
    memberCount: Array.isArray(row.pod_memberships) ? row.pod_memberships.length : 0,
    members: (row.pod_memberships || []).map(m => m.user_id),
    status: row.status,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    createdBy: row.created_by,
    topic: {
      id: row.topics?.id,
      name: row.topics?.name,
      slug: row.topics?.slug,
      color: row.topics?.accent_hex,
      mode: row.topics?.discussion_mode,
    },
  };
}
