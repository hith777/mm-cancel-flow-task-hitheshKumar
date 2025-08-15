import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assertCsrf, CsrfError } from '@/lib/csrf';
import { supabaseAdmin } from '@/lib/supabase';

const USER = '11111111-1111-1111-1111-111111111111';
const SUB  = '22222222-2222-2222-2222-222222222222';

const Commit = z.object({ confirm: z.literal(true) });

export async function POST(req: NextRequest) {
  try {
    assertCsrf(req);
    const body = await req.json();
    Commit.parse(body);

    // Read draft
    const { data: draft, error: dErr } = await supabaseAdmin
      .from('cancellations')
      .select('*')
      .eq('user_id', USER)
      .eq('subscription_id', SUB)
      .eq('status', 'draft')
      .single();
    if (dErr) throw dErr;

    // Commit draft
    const { error: uErr } = await supabaseAdmin
      .from('cancellations')
      .update({ status: 'committed', updated_at: new Date().toISOString() })
      .eq('id', draft.id);
    if (uErr) throw uErr;

    // Set subscription to pending_cancellation unless downsell accepted
    if (!draft.accepted_downsell) {
      const { error: sErr } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'pending_cancellation', updated_at: new Date().toISOString() })
        .eq('id', SUB);
      if (sErr) throw sErr;
    }

    return NextResponse.json({ ok: true, accepted_downsell: !!draft.accepted_downsell });
  } catch (e) {
    const status = e instanceof CsrfError ? e.status : 400;
    const message = e instanceof Error ? e.message : 'Bad request';
    return NextResponse.json({ error: message }, { status });
  }
}