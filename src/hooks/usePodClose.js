import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function usePodClose() {
  const [closing, setClosing] = useState(false);

  const closePod = async (podId, closingStatement) => {
    setClosing(true);
    try {
      const { error } = await supabase
        .from('pods')
        .update({
          status: 'fully_formed',
          closing_statement: closingStatement,
          closed_at: new Date().toISOString(),
        })
        .eq('id', podId);

      if (error) throw error;
      setClosing(false);
    } catch (err) {
      setClosing(false);
      throw err;
    }
  };

  return { closePod, closing };
}
