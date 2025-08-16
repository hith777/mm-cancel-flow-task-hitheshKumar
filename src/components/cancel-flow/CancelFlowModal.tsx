'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { Variant } from '@/types/cancel'

// step map: 0 entry, 1..4 found-job, 10..16 still-looking
 type Step = 0 | 1 | 2 | 3 | 4 | 10 | 11 | 12 | 13 | 15 | 16

export default function CancelModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(0)
  const [cancellationId, setCancellationId] = useState<string | null>(null)
  const [variant, setVariant] = useState<Variant>('A')
  const [csrf, setCsrf] = useState<string>('')

  // dynamic plan price from /start
  const [planCents, setPlanCents] = useState<number | null>(null)
  const discounted = useMemo(() => planCents == null ? null : Math.max(0, planCents - 1000), [planCents])

  const [error, setError] = useState<string>('')

  // fetch CSRF then start (resume if exists)
  useEffect(() => {
    function inferStepFromRow(row: Record<string, unknown>) {
      // Job found path
      if (row?.job_found === true) {
        setFoundWithMM(row.found_job_with_mm as boolean | null ?? null)
        setApplied(row.roles_applied_mm as number | null ?? null)
        setEmailed(row.companies_emailed as number | null ?? null)
        setInterviews(row.companies_interviewed as number | null ?? null)
        setFeedback(row.feedback_text as string ?? '')
        setHasLawyer(row.company_provides_lawyer as boolean | null ?? null)
        setVisaType(row.visa_type as string ?? '')
        if (!row.found_job_with_mm || row.roles_applied_mm == null) return setStep(1)
        if (!row.feedback_text) return setStep(2)
        if (row.company_provides_lawyer == null || !row.visa_type) return setStep(3)
        return setStep(4)
      }
      // Still looking path
      if (row?.job_found === false) {
        setReason(mapReasonBack(row))
        const ed = (row.extra_details || {}) as Record<string, unknown>
        setReasonText(ed?.free_text as string || '')
        if (ed?.willing_to_pay_cents) setWillingToPay(String((ed.willing_to_pay_cents as number) / 100))
        setUApplied(ed?.usage_applied as number ?? null)
        setUEmailed(ed?.usage_emailed as number ?? null)
        setUInterviews(ed?.usage_interviews as number ?? null)
        setContinued(!!row.accepted_downsell)
        if (row.accepted_downsell) return setStep(16)
        if (!row.reason) return setStep(variant === 'B' ? 10 : 11)
        if (ed?.usage_applied == null || ed?.usage_emailed == null || ed?.usage_interviews == null) return setStep(12)
        return setStep(13)
      }
      // No choice yet → entry
      setStep(0)
    }

    (async () => {
      try {
        const t = await fetch('/api/csrf').then(r=>r.json())
        setCsrf(t.token)
        const res = await fetch('/api/cancel/start', { method: 'POST', headers: { 'x-csrf': t.token }})
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Start failed')
        const c = json.cancellation
        setCancellationId(c.id)
        setVariant(c.downsell_variant as Variant)
        setPlanCents(json.subscription?.monthly_price ?? null)
        // resume: infer step
        inferStepFromRow(c)
        localStorage.setItem('cancellationId', c.id)
      } catch (e: unknown) {
        setError((e as Error).message || 'Something went wrong')
      }
    })()
  }, [])

  function dollars(cents: number | null | undefined) {
    if (cents == null) return null
    return (cents / 100).toFixed(0)
  }

  // --- Found-job state ---
  const [foundWithMM, setFoundWithMM] = useState<boolean | null>(null)
  const [applied, setApplied] = useState<number | null>(null)
  const [emailed, setEmailed] = useState<number | null>(null)
  const [interviews, setInterviews] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [hasLawyer, setHasLawyer] = useState<boolean | null>(null)
  const [visaType, setVisaType] = useState('')

  const canContinue1 = foundWithMM !== null && applied !== null && emailed !== null && interviews !== null
  const canContinue2 = feedback.trim().length >= 25
  const canCompleteFound = hasLawyer !== null && visaType.trim().length > 0

  async function patch(partial: Record<string, unknown>) {
    if (!cancellationId) return
    const res = await fetch('/api/cancel/update', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-csrf': csrf }, body: JSON.stringify({ cancellationId, patch: partial })})
    if (!res.ok) {
      const j = await res.json().catch(()=>({error:'Update failed'}))
      throw new Error(j.error || 'Update failed')
    }
  }

  // --- Still-looking state ---
  const reasons = [
    { key: 'too_expensive', label: 'Too expensive' },
    { key: 'platform_not_helpful', label: 'Platform not helpful' },
    { key: 'not_enough_relevant_jobs', label: 'Not enough relevant jobs' },
    { key: 'decided_not_to_move', label: 'Decided not to move' },
    { key: 'other', label: 'Other' },
  ] as const
  type ReasonKey = typeof reasons[number]['key']
  const [reason, setReason] = useState<ReasonKey | null>(null)
  const [reasonText, setReasonText] = useState('')
  const [willingToPay, setWillingToPay] = useState('')
  const needsText25 = (r: ReasonKey | null) => r === 'platform_not_helpful' || r === 'decided_not_to_move' || r === 'other' || r === 'not_enough_relevant_jobs'
  const reasonTextValid = !needsText25(reason) || reasonText.trim().length >= 25
  const willingValid = reason !== 'too_expensive' || /^\d+(?:\.\d{1,2})?$/.test(willingToPay)
  const canContinueReason = !!reason && reasonTextValid && willingValid

  const [uApplied, setUApplied] = useState<number | null>(null)
  const [uEmailed, setUEmailed] = useState<number | null>(null)
  const [uInterviews, setUInterviews] = useState<number | null>(null)
  const canContinueUsage = uApplied !== null && uEmailed !== null && uInterviews !== null
  const [continued, setContinued] = useState(false)

  function mapReasonBack(row: Record<string, unknown>): ReasonKey | null {
    const r = ((row?.extra_details as Record<string, unknown>)?.reason_key || '').toString()
    if (['too_expensive','platform_not_helpful','not_enough_relevant_jobs','decided_not_to_move','other'].includes(r)) return r as ReasonKey
    return null
  }

  // ---- UI helpers ----
  const RangePills = ({ labels, value, onSelect }:{ labels: string[]; value: number | null; onSelect: (i:number)=>void }) => (
    <div className="grid grid-cols-4 gap-3">
      {labels.map((label, i) => (
        <button key={label} type="button" onClick={() => onSelect(i)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${value===i?'bg-violet-600 text-white border-violet-600':'bg-white text-gray-900 border-gray-300 hover:border-gray-400'}`}>{label}</button>
      ))}
    </div>
  )

  const Stepper = ({ current }:{ current: 0|1|2 }) => (
    <div className="flex items-center gap-2">
      {[0,1,2].map(i => (<span key={i} className={`h-2 rounded-full ${i<=current?'w-10 bg-green-500':'w-8 bg-gray-300'}`} />))}
      <span className="text-sm text-gray-600">Step {current+1} of 3</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-[92vw] max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-sm font-medium text-gray-700">Subscription Cancellation</div>
          <button aria-label="Close" onClick={onClose} className="rounded p-2 text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_420px]">
          <div>
            {error && (<div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>)}

            {step === 0 && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Hey mate,<br/>Quick one before you go.</h1>
                <p className="mt-6 text-2xl italic font-semibold text-gray-800">Have you found a job yet?</p>
                <p className="mt-4 text-gray-600 text-sm">Whatever your answer, we’ll help you take the next step.</p>
                <div className="mt-6 space-y-3">
                  <button onClick={() => setStep(1)} className="w-full rounded-xl border px-4 py-3 hover:border-gray-400">Yes, I’ve found a job</button>
                  <button onClick={async () => { setStep(10); try { await patch({ job_found: false }) } catch(e: unknown){ setError((e as Error).message) } }} className="w-full rounded-xl border px-4 py-3 hover:border-gray-400">Not yet – I&apos;m still looking</button>
                </div>
              </>
            )}

            {/* Found job */}
            {step === 1 && (
              <>
                <div className="flex items-center justify-between"><h2 className="text-3xl font-extrabold">Congrats on the new role! 🎉</h2><Stepper current={0} /></div>
                <div className="mt-6 space-y-8">
                  <div><p className="mb-3 text-gray-800">Did you find this job with MigrateMate?*</p><div className="grid grid-cols-2 gap-3"><button onClick={()=>setFoundWithMM(true)} className={`rounded-lg border px-4 py-2 ${foundWithMM===true?'bg-violet-600 text-white border-violet-600':'bg-white border-gray-300 hover:border-gray-400'}`}>Yes</button><button onClick={()=>setFoundWithMM(false)} className={`rounded-lg border px-4 py-2 ${foundWithMM===false?'bg-violet-600 text-white border-violet-600':'bg-white border-gray-300 hover:border-gray-400'}`}>No</button></div></div>
                  <div><p className="mb-3">How many roles did you <u>apply</u> for through Migrate Mate?*</p><RangePills labels={['0','1–5','6–20','20+']} value={applied} onSelect={setApplied} /></div>
                  <div><p className="mb-3">How many companies did you <u>email</u> directly?*</p><RangePills labels={['0','1–5','6–20','20+']} value={emailed} onSelect={setEmailed} /></div>
                  <div><p className="mb-3">How many different companies did you <u>interview</u> with?*</p><RangePills labels={['0','1–2','3–5','5+']} value={interviews} onSelect={setInterviews} /></div>
                </div>
                <div className="mt-8"><button disabled={!canContinue1} onClick={async()=>{ try { await patch({ job_found: true, found_job_with_mm: foundWithMM, roles_applied_mm: applied, companies_emailed: emailed, companies_interviewed: interviews }) ; setStep(2) } catch(e: unknown){ setError((e as Error).message) } }} className={`w-full rounded-xl px-4 py-3 font-semibold ${canContinue1?'bg-gray-900 text-white hover:bg-black':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Continue</button></div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center justify-between"><h2 className="text-3xl font-extrabold">What’s one thing you wish we could’ve helped you with?</h2><Stepper current={1} /></div>
                <p className="mt-3 text-gray-600">We’re always looking to improve—your thoughts help others.</p>
                <textarea value={feedback} onChange={(e)=>setFeedback(e.target.value)} rows={6} className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500" placeholder="Min 25 characters" />
                <div className="mt-2 text-right text-sm text-gray-500">Min 25 characters ({feedback.trim().length}/25)</div>
                <div className="mt-6"><button disabled={!canContinue2} onClick={async()=>{ try { await patch({ feedback_text: feedback }); setStep(3) } catch(e: unknown){ setError((e as Error).message) } }} className={`w-full rounded-xl px-4 py-3 font-semibold ${canContinue2?'bg-gray-900 text-white hover:bg-black':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Continue</button></div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center justify-between"><h2 className="text-3xl font-extrabold">We helped you land the job, now let’s help you secure your visa.</h2><Stepper current={2} /></div>
                <p className="mt-4">Is your company providing an immigration lawyer to help with your visa?*</p>
                <div className="mt-4 space-y-3"><label className="flex items-center gap-3"><input type="radio" name="lawyer" checked={hasLawyer===true} onChange={()=>setHasLawyer(true)} /><span>Yes</span></label><label className="flex items-center gap-3"><input type="radio" name="lawyer" checked={hasLawyer===false} onChange={()=>setHasLawyer(false)} /><span>No</span></label></div>
                {hasLawyer!==null && (<div className="mt-6"><p className="mb-2">{hasLawyer?'What visa will you be applying for?*':'Which visa would you like to apply for?*'}</p><input value={visaType} onChange={(e)=>setVisaType(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500" placeholder="Enter visa type..." /></div>)}
                <div className="mt-8"><button disabled={!canCompleteFound} onClick={async()=>{ try { await patch({ company_provides_lawyer: hasLawyer, visa_type: visaType }); await fetch('/api/cancel/complete',{ method:'POST', headers:{ 'Content-Type':'application/json', 'x-csrf': csrf }, body: JSON.stringify({ cancellationId })}); setStep(4) } catch(e: unknown){ setError((e as Error).message) } }} className={`w-full rounded-xl px-4 py-3 font-semibold ${canCompleteFound?'bg-gray-900 text-white hover:bg-black':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Complete cancellation</button></div>
              </>
            )}

            {step === 4 && !continued && (
              <>
                <h2 className="text-3xl font-extrabold">All done, your cancellation’s been processed.</h2>
                <p className="mt-3 text-gray-700">We’re stoked to hear you’ve landed a job and sorted your visa. Big congrats from the team. 🙌</p>
                <button onClick={onClose} className="mt-8 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700">Finish</button>
              </>
            )}

            {/* Still-looking with A/B */}
            {step === 10 && (
              <>
                {variant === 'B' ? (
                  <>
                    <h2 className="text-3xl font-extrabold">Stick with us and save $10/month until you find a job.</h2>
                    <p className="mt-3 text-gray-700">{planCents==null? 'Save $10 on your current plan.' : `Your plan goes $${dollars(planCents)} → $${dollars(discounted)}.`}</p>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button onClick={async()=>{ try { setContinued(true); await patch({ accepted_downsell: true }); await fetch('/api/cancel/continue',{ method:'POST', headers:{ 'Content-Type':'application/json', 'x-csrf': csrf }, body: JSON.stringify({ cancellationId })}); setStep(16) } catch(e: unknown){ setError((e as Error).message) } }} className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700">Get $10 off</button>
                      <button onClick={()=>setStep(11)} className="rounded-xl border px-4 py-3 hover:border-gray-400">No thanks, continue to cancel</button>
                    </div>
                  </>
                ) : (
                  <>{setStep(11)}</>
                )}
              </>
            )}

            {step === 11 && (
              <>
                <div className="flex items-center justify-between"><h2 className="text-3xl font-extrabold">What’s the main reason you’re cancelling?</h2><Stepper current={0} /></div>
                <div className="mt-6 space-y-3">{reasons.map(r => (<label key={r.key} className="flex items-center gap-3 rounded-xl border p-3 hover:border-gray-400"><input type="radio" name="reason" checked={reason===r.key} onChange={()=>{ setReason(r.key); setReasonText(''); setWillingToPay('') }} /><span>{r.label}</span></label>))}</div>
                {reason==='too_expensive' && (<div className="mt-6"><p className="mb-2">What would you be willing to pay per month?* (numbers only)</p><div className="flex items-center gap-2"><span className="rounded-lg border bg-gray-50 px-3 py-2">$</span><input inputMode="decimal" value={willingToPay} onChange={(e)=>setWillingToPay(e.target.value)} placeholder="15" className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gray-500" /></div>{!willingValid && (<p className="mt-2 text-sm text-red-600">Enter a valid amount (e.g., 15 or 19.99).</p>)}</div>)}
                {needsText25(reason) && (<div className="mt-6"><p className="mb-2">Tell us a little more (min 25 characters)*</p><textarea rows={5} value={reasonText} onChange={(e)=>setReasonText(e.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-gray-500" placeholder="Type here…" />{reasonText.trim().length<25 && (<p className="mt-1 text-sm text-red-600">Min 25 characters ({reasonText.trim().length}/25)</p>)}</div>)}
                <div className="mt-8"><button disabled={!canContinueReason} onClick={async()=>{ try { await patch({ reason: (reasons.find(r=>r.key===reason)?.label)||null, extra_details: { reason_key: reason, willing_to_pay_cents: reason==='too_expensive' ? Math.round(parseFloat(willingToPay||'0')*100) : null, free_text: needsText25(reason) ? reasonText : null } }); setStep(12) } catch(e: unknown){ setError((e as Error).message) } }} className={`w-full rounded-xl px-4 py-3 font-semibold ${canContinueReason?'bg-gray-900 text-white hover:bg-black':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Continue</button></div>
              </>
            )}

            {step === 12 && (
              <>
                <div className="flex items-center justify-between"><h2 className="text-3xl font-extrabold">How were you using Migrate Mate?</h2><Stepper current={1} /></div>
                <div className="mt-6 space-y-8">
                  <div><p className="mb-3">How many roles did you apply for through Migrate Mate?*</p><RangePills labels={['0','1–5','6–20','20+']} value={uApplied} onSelect={setUApplied} /></div>
                  <div><p className="mb-3">How many companies did you email directly?*</p><RangePills labels={['0','1–5','6–20','20+']} value={uEmailed} onSelect={setUEmailed} /></div>
                  <div><p className="mb-3">How many different companies did you interview with?*</p><RangePills labels={['0','1–2','3–5','5+']} value={uInterviews} onSelect={setUInterviews} /></div>
                  {variant==='B' && !continued && (<div className="rounded-2xl border p-4"><p className="font-semibold">Want to keep access for $10 less per month{planCents!=null?` (now $${dollars(discounted)})`:''}?</p><div className="mt-3 flex gap-3"><button onClick={async()=>{ try { setContinued(true); await patch({ accepted_downsell: true }); await fetch('/api/cancel/continue',{ method:'POST', headers:{ 'Content-Type':'application/json', 'x-csrf': csrf }, body: JSON.stringify({ cancellationId })}); setStep(16) } catch(e: unknown){ setError((e as Error).message) } }} className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700">Get $10 off</button><button onClick={()=>setStep(13)} className="rounded-xl border px-4 py-3 hover:border-gray-400">No thanks</button></div></div>)}
                </div>
                <div className="mt-6"><button disabled={!canContinueUsage} onClick={async()=>{ try { await patch({ extra_details: { reason_key: reason, usage_applied: uApplied, usage_emailed: uEmailed, usage_interviews: uInterviews } }); setStep(13) } catch(e: unknown){ setError((e as Error).message) } }} className={`w-full rounded-xl px-4 py-3 font-semibold ${canContinueUsage?'bg-gray-900 text-white hover:bg-black':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Continue</button></div>
              </>
            )}

            {step === 13 && (
              <>
                <div className="flex items-center justify-between"><h2 className="text-3xl font-extrabold">Confirm cancellation</h2><Stepper current={2} /></div>
                <p className="mt-3 text-gray-700">We’ll stop your renewal. You’ll keep access until the end of the current period.</p>
                <div className="mt-6"><button onClick={async()=>{ try { await fetch('/api/cancel/complete',{ method:'POST', headers:{ 'Content-Type':'application/json', 'x-csrf': csrf }, body: JSON.stringify({ cancellationId })}); setStep(15) } catch(e: unknown){ setError((e as Error).message) } }} className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-black">Complete cancellation</button></div>
              </>
            )}

            {step === 15 && !continued && (
              <>
                <h2 className="text-3xl font-extrabold">Sorry to see you go, mate.</h2>
                <p className="mt-3 text-gray-700">Your subscription has been set to cancel at period end.</p>
                <button onClick={onClose} className="mt-8 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700">Finish</button>
              </>
            )}

            {step === 16 && continued && (
              <>
                <h2 className="text-3xl font-extrabold">Great choice, mate! 🎉</h2>
                <p className="mt-3 text-gray-700">Your subscription will continue at $10 off until you find a job{planCents!=null?` (now $${dollars(discounted)})`:''}.</p>
                <button onClick={onClose} className="mt-8 w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700">Finish</button>
              </>
            )}
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <Image src="/main-hero.jpg" alt="Hero" width={900} height={600} priority />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
