import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assertCsrf, CsrfError } from '@/lib/csrf';
import { supabaseAdmin } from '@/lib/supabase';

const USER = '11111111-1111-1111-1111-111111111111';
const SUB  = '22222222-2222-2222-2222-222222222222';

type Cancellation = {
  id: string;
  user_id: string;
  subscription_id: string;
  downsell_variant: 'A' | 'B';
  status: 'draft' | 'committed';
  found_job: boolean | null;
  found_via_mm: boolean | null;
  found_job_feedback: string | null;
  reason_code: string | null;
  follow_up: string | null;
  accepted_downsell: boolean | null;
  created_at: string;
  updated_at: string;
  reason: string | null;
};

const Commit = z.object({ confirm: z.literal(true) });

export async function POST(req: NextRequest) {
  try {
    assertCsrf(req);
    const body = await req.json();
    Commit.parse(body);

    // Read draft
    const draftRes = await supabaseAdmin
      .from('cancellations')
      .select('*')
      .eq('user_id', USER)
      .eq('subscription_id', SUB)
      .eq('status', 'draft')
      .single();
    if (draftRes.error) throw draftRes.error;
    const draft = draftRes.data as Cancellation;

    // Commit draft
    const commitRes = await supabaseAdmin
      .from('cancellations')
      .update({ status: 'committed', updated_at: new Date().toISOString() })
      .eq('id', draft.id)
      .select()
      .single();
    if (commitRes.error) throw commitRes.error;

    // Set subscription to pending_cancellation unless downsell accepted
    if (!draft.accepted_downsell) {
      const subRes = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'pending_cancellation', updated_at: new Date().toISOString() })
        .eq('id', SUB);
      if (subRes.error) throw subRes.error;
    }

    return NextResponse.json({ ok: true, accepted_downsell: !!draft.accepted_downsell });
  } catch (e) {
    const status = e instanceof CsrfError ? e.status : 400;
    const message = e instanceof Error ? e.message : 'Bad request';
    return NextResponse.json({ error: message }, { status });
  }
}