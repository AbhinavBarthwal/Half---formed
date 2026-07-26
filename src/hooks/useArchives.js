import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useArchives() {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchives = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('pods')
      .select(`
        id, title, created_at,
        topics ( name, slug, accent_hex ),
        archive_summaries ( summary_text, key_threads, generated_at )
      `)
      .eq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching archives:', error.message);
      setArchives([]);
    } else {
      setArchives((data || []).map(row => ({
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        topic: {
          name: row.topics?.name,
          slug: row.topics?.slug,
          color: row.topics?.accent_hex,
        },
        summary: row.archive_summaries?.summary_text || null,
        keyThreads: row.archive_summaries?.key_threads || [],
        archivedAt: row.archive_summaries?.generated_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArchives(); }, [fetchArchives]);

  return { archives, loading };
}
