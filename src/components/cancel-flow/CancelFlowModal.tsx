'use client';

import { useEffect, useRef, useState } from 'react';
import type { FlowState, Step, Answers } from './types';
import StepJobStatus from './steps/StepJobStatus';
import StepFoundJobFeedback from './steps/StepFoundJobFeedback';
import StepDownsell from './steps/StepDownsell';
import StepReasons from './steps/StepReasons';

// ---- API types (client-side) ----
type DraftBody = Partial<Answers> & { init?: boolean };
type DraftResponse = {
  id: string;
  user_id: string;
  subscription_id: string;
  downsell_variant: 'A' | 'B';
  status: 'draft' | 'committed';
  found_job?: boolean | null;
  found_via_mm?: boolean | null;
  found_job_feedback?: string | null;
  reason_code?: string | null;
  follow_up?: string | null;
  accepted_downsell?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type CommitResponse = { ok: boolean; accepted_downsell: boolean };

function getCsrfFromCookie(): string {
  return (
    document.cookie
      .split('; ')
      .find((c) => c.startsWith('csrf_token='))?.split('=')[1] ?? ''
  );
}

async function draftSave(payload: DraftBody): Promise<DraftResponse> {
  const res = await fetch('/api/cancellation/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfFromCookie() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }
  return (await res.json()) as DraftResponse;
}

async function commitFinalize(): Promise<CommitResponse> {
  const res = await fetch('/api/cancellation/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfFromCookie() },
    body: JSON.stringify({ confirm: true }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }
  return (await res.json()) as CommitResponse;
}

export default function CancelFlowModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [state, setState] = useState<FlowState>({
    step: 'job_status',
    downsellVariant: null,
    answers: {},
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Create draft & assign A/B on open
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(true);
    draftSave({ init: true })
      .then((row) =>
        setState((s) => ({ ...s, downsellVariant: row.downsell_variant })),
      )
      .catch(() => setError('Could not initialize cancellation.'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Focus trap + ESC close
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key !== 'Tab') return;
      const root = cardRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function goNext(payload?: Partial<Answers>): Promise<void> {
    try {
      setError(null);
      setLoading(true);

      // Save answers progressively
      if (payload && Object.keys(payload).length > 0) {
        await draftSave(payload);
        setState((s) => ({ ...s, answers: { ...s.answers, ...payload } }));
      }

      // Decide next step
      setState((prev) => {
        let next: Step = prev.step;

        if (prev.step === 'job_status') {
          next = payload?.found_job
            ? 'found_feedback'
            : prev.downsellVariant === 'B'
            ? 'downsell'
            : 'reasons';
        } else if (prev.step === 'downsell') {
          next = payload?.accepted_downsell ? 'completion' : 'reasons';
        } else if (prev.step === 'found_feedback' || prev.step === 'reasons') {
          next = 'completion';
        }

        return { ...prev, step: next };
      });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function goBack(): void {
    setError(null);
    setState((prev) => {
      if (
        prev.step === 'found_feedback' ||
        prev.step === 'reasons' ||
        prev.step === 'downsell'
      ) {
        return { ...prev, step: 'job_status' };
      }
      return prev;
    });
  }

  async function finish(): Promise<void> {
    try {
      setLoading(true);
      await commitFinalize();
      onClose();
    } catch {
      setError('Could not finalize cancellation.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative w-full max-w-[1000px]"
      >
        {error && (
          <div className="mb-2 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {state.step === 'job_status' && (
          <StepJobStatus onNext={goNext} setError={setError} />
        )}
        {state.step === 'found_feedback' && (
          <StepFoundJobFeedback
            value={{
              found_via_mm: state.answers.found_via_mm,
              found_job_feedback: state.answers.found_job_feedback,
            }}
            onNext={goNext}
            onBack={goBack}
            setError={setError}
          />
        )}
        {state.step === 'downsell' && (
          <StepDownsell onNext={goNext} onBack={goBack} />
        )}
        {state.step === 'reasons' && (
          <StepReasons
            value={{
              reason_code: state.answers.reason_code,
              follow_up: state.answers.follow_up,
            }}
            onNext={goNext}
            onBack={goBack}
            setError={setError}
          />
        )}

        {state.step === 'completion' && (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
            <div className="mb-2 text-xs text-gray-500">All done</div>
            {state.answers.accepted_downsell ? (
              <h3 className="text-lg font-semibold">
                Discount applied. Thanks for staying! 🎉
              </h3>
            ) : (
              <h3 className="text-lg font-semibold">
                Your subscription will be cancelled at period end.
              </h3>
            )}
            <div className="mt-4">
              <button
                onClick={finish}
                className="rounded border px-4 py-2 text-sm"
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute -top-3 right-0 rounded-md bg-white/80 p-2 text-sm shadow ring-1 ring-black/5"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}