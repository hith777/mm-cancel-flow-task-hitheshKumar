'use client';

import { useEffect, useRef, useState } from 'react';
import StepJobStatus from './steps/StepJobStatus';

type Step = 'job_status' | 'completion';

export default function CancelFlowModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('job_status');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  // ref to the modal "card" to manage focus trap
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Focus trap + ESC to close + restore focus
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.activeElement as HTMLElement | null;

    // focus the first focusable element in the card when it opens
    const focusFirst = () => {
      const root = cardRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
      (items[0] ?? root).focus();
    };

    focusFirst();

    const onKeyDown = (e: KeyboardEvent) => {
      const root = cardRef.current;
      if (!root) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      // cycle focus inside the modal
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
      prev?.focus(); // return focus to the previously focused element
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const next = (data?: Record<string, unknown>) => {
    setAnswers(a => ({ ...a, ...(data || {}) }));
    setStep('completion');
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3"
      role="presentation"
      aria-hidden={false}
    >
      {/* Modal "card" */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1} // make the card itself focusable as a fallback
        className="relative w-full max-w-[1000px]" // match Figma width
      >
        {/* Render the current step */}
        {step === 'job_status' && <StepJobStatus onNext={next} />}

        {step === 'completion' && (
          <div className="rounded-[18px] bg-white p-6 shadow-xl ring-1 ring-black/5">
            <h3 id="modal-title" className="text-lg font-semibold">Completion (placeholder)</h3>
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">{JSON.stringify(answers, null, 2)}</pre>
            <button onClick={onClose} className="mt-4 rounded border px-3 py-1.5 text-sm">Close</button>
          </div>
        )}

        {/* Close button (kept for mouse users) */}
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
