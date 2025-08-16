'use client';

import { useEffect, useRef, useState } from 'react';
import StepJobStatus from './steps/StepJobStatus';
import StepFoundJobFeedback from './steps/StepFoundJobFeedback';
import StepDownsell from './steps/StepDownsell';
import StepReasons from './steps/StepReasons';
import { Answers, Step } from './types';

export default function CancelFlowModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('job_status');
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);

  // Focus trap
  const cardRef = useRef<HTMLDivElement | null>(null);
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
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
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

  // Navigation helpers
  function goNext(payload?: Partial<Answers>) {
    if (payload) setAnswers((prev) => ({ ...prev, ...payload }));

    setStep((prev) => {
      if (prev === 'job_status') {
        return payload?.found_job ? 'found_feedback' : 'reasons'; // downsell omitted for now
      }
      if (prev === 'found_feedback' || prev === 'reasons') return 'completion';
      if (prev === 'downsell') return payload?.accepted_downsell ? 'completion' : 'reasons';
      return prev;
    });
  }

  function goBack() {
    setError(null);
    setStep('job_status');
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 font-dm">
      {/* Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cxl-title"
        className="w-full max-w-[1000px] rounded-[20px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.25)]"
      >
        {/* Header bar (1000×60, 18px Y padding, bottom divider) */}
        <div className="relative flex h-[60px] items-center justify-center px-0 py-[18px] border-b border-warm-300">
          <div
            id="cxl-title"
            className="text-[16px] font-semibold text-warm-800"
          >
            Subscription Cancellation
          </div>

          {/* Close button 24×24 with 11.9×11.9 “X” */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 inline-grid size-6 place-items-center rounded-md ring-1 ring-warm-300 hover:bg-neutral-50"
          >
            <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M4.5 4.5 L15.5 15.5 M15.5 4.5 L4.5 15.5"
                stroke="#62605C"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-0">
          {error && (
            <div className="mx-5 my-3 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {step === 'job_status' && (
            <StepJobStatus onNext={goNext} setError={setError} />
          )}

          {step === 'found_feedback' && (
            <StepFoundJobFeedback
              value={{
                found_via_mm: answers.found_via_mm,
                found_job_feedback: answers.found_job_feedback,
              }}
              onNext={goNext}
              onBack={goBack}
              setError={setError}
            />
          )}

          {step === 'downsell' && (
            <StepDownsell onNext={goNext} onBack={goBack} />
          )}

          {step === 'reasons' && (
            <StepReasons
              value={{
                reason_code: answers.reason_code,
                follow_up: answers.follow_up,
              }}
              onNext={goNext}
              onBack={goBack}
              setError={setError}
            />
          )}

          {step === 'completion' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-warm-800">
                Thanks — we’ve recorded your response.
              </h3>
              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="rounded-md border border-warm-300 px-4 py-2 text-sm text-warm-700 hover:bg-neutral-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE bottom-sheet overlay feel */}
      <style jsx global>{`
        @media (max-width: 767px) {
          [role='dialog'] {
            width: 320px;
          }
        }
      `}</style>
    </div>
  );
}