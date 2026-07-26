import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function usePodMessages(podId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!podId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, reply_mode, moderation_status, created_at, parent_id,
        author:profiles!author_id ( id, handle, display_name, avatar_url ),
        reactions ( id, type, user_id )
      `)
      .eq('pod_id', podId)
      .eq('moderation_status', 'ok')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error.message);
      setMessages([]);
    } else {
      setMessages((data || []).map(mapMessage));
    }
    setLoading(false);
  }, [podId]);

  useEffect(() => {
    fetchMessages();

    if (!podId) return;

    // Subscribe to new messages in this pod
    const channel = supabase
      .channel(`messages:${podId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `pod_id=eq.${podId}`,
      }, async (payload) => {
        // Fetch the full message with author profile
        const { data } = await supabase
          .from('messages')
          .select(`
            id, content, reply_mode, moderation_status, created_at, parent_id,
            author:profiles!author_id ( id, handle, display_name, avatar_url ),
            reactions ( id, type, user_id )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data && data.moderation_status === 'ok') {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, mapMessage(data)];
          });
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
      }, () => {
        // Refetch to get updated reaction counts
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [podId, fetchMessages]);

  const postMessage = async (content, replyMode = 'add', parentId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to post');

    const { error } = await supabase.from('messages').insert({
      pod_id: podId,
      author_id: user.id,
      content,
      reply_mode: replyMode,
      parent_id: parentId,
    });

    if (error) throw error;
    // Realtime subscription will handle adding it to state
  };

  const toggleReaction = async (messageId, type) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in to react');

    // Check if reaction exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('type', type)
      .maybeSingle();

    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('reactions').insert({
        message_id: messageId,
        user_id: user.id,
        type,
      });
    }
  };

  return { messages, loading, postMessage, toggleReaction };
}

function mapMessage(row) {
  // Count reactions by type
  const reactionCounts = {};
  if (Array.isArray(row.reactions)) {
    row.reactions.forEach(r => {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    });
  }

  return {
    id: row.id,
    content: row.content,
    replyMode: row.reply_mode,
    createdAt: row.created_at,
    parentId: row.parent_id,
    author: {
      id: row.author?.id,
      handle: row.author?.handle || 'anonymous',
      displayName: row.author?.display_name,
      avatarUrl: row.author?.avatar_url,
    },
    reactions: reactionCounts,
    rawReactions: row.reactions || [],
  };
}
