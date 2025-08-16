import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomInt } from 'crypto';
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
  reason: string | null; // legacy column OK to ignore
};

const Draft = z.object({
  init: z.boolean().optional(),                 // client-only flag
  found_job: z.boolean().optional(),
  found_via_mm: z.boolean().optional(),
  found_job_feedback: z.string().trim().max(2000).optional(),
  reason_code: z.string().trim().max(120).optional(),
  follow_up: z.string().trim().max(1000).optional(),
  accepted_downsell: z.boolean().optional(),
});

type DraftPayload = z.infer<typeof Draft>;
type PersistablePayload = Omit<DraftPayload, 'init'>;

type FixedFields = {
  user_id: string;
  subscription_id: string;
  downsell_variant: 'A' | 'B';
  status: 'draft';
  updated_at: string;
};

export async function POST(req: NextRequest) {
  try {
    assertCsrf(req);

    const bodyStr = await req.text();
    const payload: PersistablePayload = Draft.omit({ init: true }).parse(
      bodyStr ? JSON.parse(bodyStr) : {}
    );

    // Read current draft (if any)
    const existingRes = await supabaseAdmin
      .from('cancellations')
      .select('*')
      .eq('user_id', USER)
      .eq('subscription_id', SUB)
      .eq('status', 'draft')
      .maybeSingle();
    if (existingRes.error) throw existingRes.error;
    const existing = (existingRes.data as Cancellation | null) ?? null;

    // Deterministic 50/50 A/B (assign once)
    const variant: 'A' | 'B' =
      existing?.downsell_variant ?? (randomInt(0, 2) === 0 ? 'A' : 'B');

    const rowData: PersistablePayload & FixedFields = {
      ...payload,                                // ← no "init" here anymore
      user_id: USER,
      subscription_id: SUB,
      downsell_variant: variant,
      status: 'draft',
      updated_at: new Date().toISOString(),
    };

    let row: Cancellation;

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('cancellations')
        .update(rowData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      row = data as Cancellation;
    } else {
      const { data, error } = await supabaseAdmin
        .from('cancellations')
        .insert(rowData)
        .select()
        .single();
      if (error) throw error;
      row = data as Cancellation;
    }

    return NextResponse.json(row);
  } catch (e) {
    const status = e instanceof CsrfError ? e.status : 400;
    // Helpful during dev: surface actual message
    const message = e instanceof Error ? e.message : 'Bad request';
    return NextResponse.json({ error: message }, { status });
  }
}