import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function usePolls(podId) {
  const [polls, setPolls] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPollsAndVotes = async () => {
    if (!podId) return;
    setLoading(true);

    const { data: pollsData } = await supabase
      .from('polls')
      .select(`
        id, question, options, created_at, author_id,
        author:profiles!author_id ( id, handle, display_name, avatar_url )
      `)
      .eq('pod_id', podId)
      .order('created_at', { ascending: true });

    const pollIds = (pollsData || []).map(p => p.id);
    let votesData = [];
    if (pollIds.length > 0) {
      const { data: v } = await supabase
        .from('poll_votes')
        .select(`
          poll_id, option_id, user_id,
          user:profiles!user_id ( id, handle, display_name, avatar_url )
        `)
        .in('poll_id', pollIds);
      votesData = v || [];
    }

    setPolls(pollsData || []);
    setVotes(votesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPollsAndVotes();

    if (!podId) return;

    const pollsChannel = supabase
      .channel(`polls:${podId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `pod_id=eq.${podId}` }, () => {
        fetchPollsAndVotes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, () => {
        fetchPollsAndVotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pollsChannel);
    };
  }, [podId]);

  const createPoll = async (question, optionsArray) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to create a poll');

    const formattedOptions = optionsArray.map((opt, idx) => ({
      id: `opt_${Date.now()}_${idx}`,
      text: opt,
    }));

    const { error } = await supabase
      .from('polls')
      .insert({
        pod_id: podId,
        author_id: user.id,
        question,
        options: formattedOptions,
      });

    if (error) throw error;
  };

  const votePoll = async (pollId, optionId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to vote');

    const { error } = await supabase
      .from('poll_votes')
      .upsert({
        poll_id: pollId,
        user_id: user.id,
        option_id: optionId,
      });

    if (error) throw error;
    fetchPollsAndVotes();
  };

  const addOptionToPoll = async (pollId, optionText) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    const newOpt = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: optionText,
    };

    const updatedOptions = [...(poll.options || []), newOpt];

    const { error } = await supabase
      .from('polls')
      .update({ options: updatedOptions })
      .eq('id', pollId);

    if (error) throw error;
    fetchPollsAndVotes();
  };

  return { polls, votes, loading, createPoll, votePoll, addOptionToPoll };
}
