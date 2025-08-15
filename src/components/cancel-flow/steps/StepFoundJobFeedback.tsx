'use client';

import { useState } from 'react';
import type { StepProps } from '../types';

type FoundJobFeedbackValue = {
  found_via_mm?: boolean | null;
  found_job_feedback?: string;
};

export default function StepFoundJobFeedback({
  value,
  onNext,
  onBack,
  setError,
}: StepProps<FoundJobFeedbackValue>) {
  const [foundVia, setFoundVia] = useState<boolean | null>(value?.found_via_mm ?? null);
  const [text, setText] = useState<string>(value?.found_job_feedback ?? '');

  function handleContinue() {
    const trimmed = text.trim();
    if (trimmed.length < 25) {
      setError?.('Please write at least 25 characters.');
      return;
    }
    if (foundVia === null) {
      setError?.('Please tell us if you found it through MigrateMate.');
      return;
    }
    setError?.(null);
    onNext({ found_via_mm: foundVia, found_job_feedback: trimmed });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
      <div className="mb-4 text-xs text-gray-500">Step 2 of 3</div>
      <h3 className="text-lg font-semibold">Congrats on the new role! 🎉</h3>

      <p className="mt-2 text-sm text-gray-600">Did you find this job through MigrateMate?</p>
      <div className="mt-3 flex gap-3">
        <button
          className={`rounded border px-3 py-1.5 text-sm ${foundVia === true ? 'bg-gray-100' : ''}`}
          onClick={() => setFoundVia(true)}
        >
          Yes
        </button>
        <button
          className={`rounded border px-3 py-1.5 text-sm ${foundVia === false ? 'bg-gray-100' : ''}`}
          onClick={() => setFoundVia(false)}
        >
          No
        </button>
      </div>

      <label className="mt-6 block text-sm font-medium text-gray-700">
        What could we have done better?
      </label>
      <textarea
        className="mt-2 w-full rounded border p-3 text-sm"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your feedback (min 25 characters)…"
      />
      <div className="mt-1 text-right text-xs text-gray-500">{text.trim().length}/2000</div>

      <div className="mt-4 flex gap-2">
        <button onClick={onBack} className="rounded border px-4 py-2 text-sm">Back</button>
        <button onClick={handleContinue} className="rounded border px-4 py-2 text-sm">Continue</button>
      </div>
    </div>
  );
}