import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get user's scam reports
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        properties (id, title, source)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    console.error('Scam reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// Submit a scam report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, reason, description } = await request.json();

    if (!property_id || !reason) {
      return NextResponse.json(
        { error: 'property_id and reason are required' },
        { status: 400 }
      );
    }

    const validReasons = ['fake_listing', 'fake_contact', 'suspicious_price', 'duplicate_images', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      );
    }

    const { data: report, error } = await supabase
      .from('scam_reports')
      .insert({
        user_id: user.id,
        property_id,
        reason,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'You have already reported this property' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Update property scam score based on reports
    // In production, this would be more sophisticated
    const { data: reportCount } = await supabase
      .from('scam_reports')
      .select('id', { count: 'exact' })
      .eq('property_id', property_id);

    const newScore = Math.min(1, (reportCount?.length || 1) * 0.1);

    await supabase
      .from('properties')
      .update({ scam_score: newScore })
      .eq('id', property_id);

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Submit scam report error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

