import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { assertCsrf } from '../../_utils/csrf'

export async function PATCH(request: Request) {
  try {
    assertCsrf(request)
  } catch {
    return NextResponse.json({ error: 'Bad CSRF' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !body.cancellationId || typeof body.patch !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // narrow allowlist to avoid arbitrary writes
  const allow: Record<string, true> = {
    job_found: true,
    found_job_with_mm: true,
    roles_applied_mm: true,
    companies_emailed: true,
    companies_interviewed: true,
    feedback_text: true,
    company_provides_lawyer: true,
    visa_type: true,
    reason: true,
    extra_details: true,
    accepted_downsell: true,
  }
  const safePatch: Record<string, unknown> = {}
  for (const k of Object.keys(body.patch)) {
    if (allow[k]) safePatch[k] = body.patch[k]
  }

  const { data, error } = await supabaseAdmin
    .from('cancellations')
    .update(safePatch)
    .eq('id', body.cancellationId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ cancellation: data })
}
