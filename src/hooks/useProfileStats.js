import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useProfileStats(userId) {
  const [stats, setStats] = useState({ podsJoined: 0, resonances: 0, steelmans: 0, archived: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    // Pods joined
    const { count: podsJoined } = await supabase
      .from('pod_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Resonances received on user's messages
    const { count: resonances } = await supabase
      .from('reactions')
      .select('*, messages!inner(author_id)', { count: 'exact', head: true })
      .eq('messages.author_id', userId)
      .eq('type', 'resonates');

    // Steelman messages authored
    const { count: steelmans } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('reply_mode', 'steelman');

    // Pods created that are archived
    const { count: archived } = await supabase
      .from('pods')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('status', 'archived');

    setStats({
      podsJoined: podsJoined || 0,
      resonances: resonances || 0,
      steelmans: steelmans || 0,
      archived: archived || 0,
    });

    // Recent messages as activity
    const { data: recentMessages } = await supabase
      .from('messages')
      .select(`
        id, reply_mode, created_at,
        pods ( title )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    setActivity((recentMessages || []).map(m => ({
      id: m.id,
      type: m.reply_mode,
      podTitle: m.pods?.title,
      createdAt: m.created_at,
    })));

    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, activity, loading };
}
