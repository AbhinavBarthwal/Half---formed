import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, []);

  return { topics, loading };
}
