import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get user's messages
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        subject,
        body,
        recipient_name,
        channel,
        status,
        sent_at,
        created_at,
        properties (id, title, suburb, city, price)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Send a message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, subject, body, recipient_name, recipient_email, recipient_phone } = await request.json();

    if (!property_id || !subject || !body) {
      return NextResponse.json(
        { error: 'property_id, subject, and body are required' },
        { status: 400 }
      );
    }

    // Determine channel based on available contact info
    let channel = 'email';
    if (!recipient_email && recipient_phone) {
      channel = 'whatsapp';
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        property_id,
        subject,
        body,
        recipient_name: recipient_name || null,
        recipient_email: recipient_email || null,
        recipient_phone: recipient_phone || null,
        channel,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: In production, trigger actual email/message sending here
    // Update status to 'sent' after successful delivery

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

