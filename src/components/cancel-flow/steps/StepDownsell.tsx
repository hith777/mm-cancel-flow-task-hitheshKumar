'use client';

import type { StepProps } from '../types';

export default function StepDownsell({ onNext, onBack }: StepProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
      <div className="mb-4 text-xs text-gray-500">Special offer</div>
      <h3 className="text-lg font-semibold">Stay for $10 off your plan</h3>
      <p className="mt-2 text-sm text-gray-600">
        Monthly $25 → <b>$15</b>, Annual $29 → <b>$19</b> (first month).
      </p>

      <div className="mt-5 grid gap-2 sm:max-w-sm">
        <button onClick={() => onNext({ accepted_downsell: true })} className="rounded border bg-gray-50 px-4 py-3 text-sm">
          Apply discount & keep my plan
        </button>
        <button onClick={() => onNext({ accepted_downsell: false })} className="rounded border px-4 py-3 text-sm">
          No thanks, continue to cancel
        </button>
      </div>

      <div className="mt-4">
        <button onClick={onBack} className="rounded border px-3 py-1.5 text-xs">Back</button>
      </div>
    </div>
  );
}