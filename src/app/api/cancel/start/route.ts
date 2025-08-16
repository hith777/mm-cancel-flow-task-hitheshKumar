import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { MOCK_USER_ID } from '@/lib/mock'
import type { Variant } from '@/types/cancel'
import { assertCsrf } from '../../_utils/csrf'

function chooseVariantSecure(): Variant {
  return (crypto.randomInt(0, 2) === 0 ? 'A' : 'B')
}

export async function POST(request: Request) {
  try {
    assertCsrf(request)
  }catch (e: unknown) {
    const status = (e as { status?: number })?.status || 400
    return NextResponse.json({ error: 'Bad CSRF' }, { status })
  }

  const userId = MOCK_USER_ID

  const { data: sub, error: subErr } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (subErr || !sub) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  // try to reuse most recent cancellation for this user if not finalized
  const { data: existing } = await supabaseAdmin
    .from('cancellations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (existing && existing.length) {
    return NextResponse.json({ cancellation: existing[0], subscription: sub })
  }

  const variant = chooseVariantSecure()
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('cancellations')
    .insert({ user_id: userId, subscription_id: sub.id, downsell_variant: variant, accepted_downsell: false })
    .select('*')
    .single()

  if (insErr || !inserted) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }

  return NextResponse.json({ cancellation: inserted, subscription: sub })
}
