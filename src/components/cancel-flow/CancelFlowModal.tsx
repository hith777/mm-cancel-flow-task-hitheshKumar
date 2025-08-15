'use client';

import { useState } from 'react';
import type { FlowState, Step } from './types';
import StepJobStatus from './steps/StepJobStatus';

// A lightweight modal + step router. Pure placeholders now.
export default function CancelFlowModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Initialize the walking skeleton state.
  const [state, setState] = useState<FlowState>({
    step: 'job_status',        // start at first screen
    answers: {},               // we collect answers here
    downsellVariant: null,     // we'll assign A/B later
  });

  // Called by each step when the user clicks "Continue".
  function next(payload?: Record<string, unknown>) {
    // Merge new answers into the running object.
    setState(prev => {
      const answers = { ...prev.answers, ...(payload || {}) };

      // Decide the next step based on what we know.
      let nextStep: Step = prev.step;

      if (prev.step === 'job_status') {
        const found = (payload?.foundJob as 'yes' | 'no') || 'no';

        // For now (skeleton), route simply:
        // yes  -> found_feedback
        // no   -> reasons  (we'll insert the downsell step later when we add A/B)
        nextStep = found === 'yes' ? 'found_feedback' : 'reasons';
      } else if (prev.step === 'found_feedback' || prev.step === 'reasons') {
        nextStep = 'completion';
      } else if (prev.step === 'downsell') {
        // placeholder logic; real accept/decline will come later
        nextStep = 'reasons';
      }

      return { ...prev, step: nextStep, answers };
    });
  }

  // Optional "Back" handler (we’ll refine per step later).
  function back() {
    setState(prev => {
      // Simple demo: go back to job_status from any step.
      // We'll make this smarter once each step is in place.
      return { ...prev, step: 'job_status' };
    });
  }

  if (!isOpen) return null;

  return (
    // Dark backdrop
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      {/* Modal card */}
      <div className="relative w-full max-w-3xl">
        {/* Render current step */}
        {state.step === 'job_status' && <StepJobStatus onNext={next} />}

        {state.step === 'found_feedback' && (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
            <p className="text-sm text-gray-600">
              Placeholder for “Found a job → feedback” screen.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={back} className="rounded-lg border px-4 py-2 text-sm">Back</button>
              <button onClick={() => next({ foundJob_feedback: '...' })} className="rounded-lg border px-4 py-2 text-sm">Continue</button>
            </div>
          </div>
        )}

        {state.step === 'reasons' && (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
            <p className="text-sm text-gray-600">
              Placeholder for “Reasons” screen (still looking).
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={back} className="rounded-lg border px-4 py-2 text-sm">Back</button>
              <button onClick={() => next({ reason_code: 'placeholder' })} className="rounded-lg border px-4 py-2 text-sm">Continue</button>
            </div>
          </div>
        )}

        {state.step === 'completion' && (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
            <h3 className="text-lg font-semibold">Completion (placeholder)</h3>
            <p className="mt-2 text-sm text-gray-600">We’ll implement real copy + DB commit later.</p>
            <div className="mt-4">
              <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Close</button>
            </div>
          </div>
        )}

        {/* Close button in top-right corner of the card */}
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
