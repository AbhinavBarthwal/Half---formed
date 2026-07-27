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
        id, title, closing_statement, closed_at, created_at, status,
        topics ( name, slug, accent_hex ),
        archive_summaries ( summary_text, consensus_points, divergence_points, key_threads, generated_at )
      `)
      .in('status', ['archived', 'fully_formed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching archives:', error.message);
      setArchives([]);
    } else {
      setArchives((data || []).map(row => {
        const summaryObj = Array.isArray(row.archive_summaries) ? row.archive_summaries[0] : row.archive_summaries;
        
        const summaryText = summaryObj?.summary_text || row.closing_statement || null;
        
        // Extract consensus & divergence
        const consensusPoints = summaryObj?.consensus_points || (row.closing_statement ? [row.closing_statement] : []);
        const divergencePoints = summaryObj?.divergence_points || [];
        const keyThreads = summaryObj?.key_threads || [];
        const archivedAt = summaryObj?.generated_at || row.closed_at || row.created_at;

        return {
          id: row.id,
          title: row.title,
          createdAt: row.created_at,
          topic: {
            name: row.topics?.name,
            slug: row.topics?.slug,
            color: row.topics?.accent_hex,
          },
          summary: summaryText,
          consensusPoints,
          divergencePoints,
          keyThreads,
          archivedAt,
          status: row.status,
        };
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArchives(); }, [fetchArchives]);

  return { archives, loading };
}
