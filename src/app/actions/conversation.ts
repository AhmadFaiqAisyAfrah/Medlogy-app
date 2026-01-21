'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: number;
}

export interface Conversation {
    id: string;
    title: string;
    updated_at: string;
    messages: ChatMessage[]; // JSONB
    feature: 'analysis' | 'global_health_news';
}

export async function getConversations(feature: 'analysis' | 'global_health_news') {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }

    return data as Conversation[];
}

export async function getConversation(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data as Conversation;
}

export async function createConversation(feature: 'analysis' | 'global_health_news', firstMessage: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Auto-generate title from first message (truncate)
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;

    const { data, error } = await supabase
        .from('conversations')
        .insert({
            user_id: user.id,
            feature,
            title,
            messages: []
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }

    revalidatePath('/analysis'); // Assuming we revalidate main pages
    return data as Conversation;
}

export async function saveMessages(conversationId: string, messages: ChatMessage[]) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('conversations')
        .update({
            messages: messages,
            updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

    if (error) {
        console.error('Error saving messages:', error);
        throw error;
    }

    revalidatePath('/analysis');
}

export async function deleteConversation(id: string) {
    const supabase = await createClient();

    await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

    revalidatePath('/analysis');
}
