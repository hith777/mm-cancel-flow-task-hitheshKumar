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

  const { error: updErr } = await supabaseAdmin
    .from('cancellations')
    .update({ accepted_downsell: true })
    .eq('id', body.cancellationId)

  if (updErr) return NextResponse.json({ error: 'Failed' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
