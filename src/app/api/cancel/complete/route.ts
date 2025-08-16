import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { assertCsrf } from '../../_utils/csrf'

export async function POST(request: Request) {
  try {
    assertCsrf(request)
  } catch {
    return NextResponse.json({ error: 'Bad CSRF' }, { status: 403 })
  }
  const body = await request.json().catch(() => null)
  if (!body || !body.cancellationId) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { data: row, error: readErr } = await supabaseAdmin
    .from('cancellations')
    .select('subscription_id')
    .eq('id', body.cancellationId)
    .single()

  if (readErr || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error: subErr } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'pending_cancellation', updated_at: new Date().toISOString() })
    .eq('id', row.subscription_id)

  if (subErr) return NextResponse.json({ error: 'Subscription update failed' }, { status: 500 })

  return NextResponse.json({ ok: true })
}