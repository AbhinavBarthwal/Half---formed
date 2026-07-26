import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function usePodClose() {
  const [closing, setClosing] = useState(false);

  const closePod = async (podId, closingStatement) => {
    setClosing(true);
    try {
      // Try setting status to 'fully_formed' first
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
      setClosing(false);
    } catch (err) {
      setClosing(false);
      throw err;
    }
  };

  return { closePod, closing };
}
