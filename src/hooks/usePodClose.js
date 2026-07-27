import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function usePodClose() {
  const [closing, setClosing] = useState(false);

  const closePod = async (podId, closingStatement, consensusPoints = [], divergencePoints = [], keyThreads = []) => {
    setClosing(true);
    try {
      // 1. Set pod status to fully_formed (or fallback to archived)
      let { error } = await supabase
        .from('pods')
        .update({
          status: 'fully_formed',
          closing_statement: closingStatement,
          closed_at: new Date().toISOString(),
        })
        .eq('id', podId);

      // If a status check constraint error occurs, fallback to 'archived'
      if (error && error.message?.includes('pods_status_check')) {
        const fallbackRes = await supabase
          .from('pods')
          .update({
            status: 'archived',
            closing_statement: closingStatement,
            closed_at: new Date().toISOString(),
          })
          .eq('id', podId);
        error = fallbackRes.error;
      }

      if (error) throw error;

      // 2. Upsert into archive_summaries
      const { error: summaryErr } = await supabase
        .from('archive_summaries')
        .upsert({
          pod_id: podId,
          summary_text: closingStatement,
          consensus_points: consensusPoints.length > 0 ? consensusPoints : [closingStatement],
          divergence_points: divergencePoints,
          key_threads: keyThreads,
          generated_at: new Date().toISOString(),
        });

      if (summaryErr) {
        console.warn('Could not save archive_summary record:', summaryErr.message);
      }

      setClosing(false);
    } catch (err) {
      setClosing(false);
      throw err;
    }
  };

  return { closePod, closing };
}
