'use client';

import type { StepProps } from '../types';

// This is a minimal placeholder UI for Step 1 so we can prove the router works.
// We'll replace this with the pixel-perfect Figma markup in a later phase.
export default function StepJobStatus({ onNext }: StepProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
      <h2 className="text-xl font-semibold">Have you found a job yet?</h2>

      <p className="mt-2 text-sm text-gray-600">
        Placeholder UI — click a button to move to the next step.
      </p>

      <div className="mt-4 grid gap-2 sm:max-w-sm">
        <button
          type="button"
          onClick={() => onNext({ foundJob: 'yes' })}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Yes, I’ve found a job
        </button>

        <button
          type="button"
          onClick={() => onNext({ foundJob: 'no' })}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Not yet — I’m still looking
        </button>
      </div>
    </section>
  );
}
