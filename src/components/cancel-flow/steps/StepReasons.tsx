'use client';

import { useState } from 'react';
import type { StepProps } from '../types';

type ReasonsValue = {
  reason_code?: string;
  follow_up?: string;
};

const REASONS = [
  { code: 'too_expensive', label: 'Too expensive', follow: { type: 'price' as const, placeholder: 'What would you be willing to pay (USD)?' } },
  { code: 'not_using', label: 'Not using it enough', follow: { type: 'text' as const,  placeholder: 'What would make it more useful?' } },
  { code: 'switched', label: 'Switched to another product', follow: { type: 'text' as const,  placeholder: 'Which one? Why?' } },
  { code: 'visa_not_helpful', label: 'Visa support wasn’t helpful', follow: { type: 'text' as const,  placeholder: 'What should we improve?' } },
  { code: 'technical', label: 'Technical issues', follow: { type: 'text' as const,  placeholder: 'What went wrong?' } },
  { code: 'other', label: 'Other', follow: { type: 'text' as const,  placeholder: 'Anything else you want us to know?' } },
] as const;

export default function StepReasons({
  value,
  onNext,
  onBack,
  setError,
}: StepProps<ReasonsValue>) {
  const [code, setCode] = useState<string>(value?.reason_code ?? '');
  const [follow, setFollow] = useState<string>(value?.follow_up ?? '');

  const selected = REASONS.find(r => r.code === code);

  function continueClick() {
    if (!code) {
      setError?.('Please pick a reason.');
      return;
    }
    if (selected?.follow?.type === 'price') {
      const n = Number(follow);
      if (!Number.isFinite(n) || n <= 0) {
        setError?.('Please enter a valid price.');
        return;
      }
    } else if (selected?.follow && follow.trim().length < 5) {
      setError?.('Please add a brief explanation.');
      return;
    }
    setError?.(null);
    onNext({ reason_code: code, follow_up: follow.trim() });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-black/5">
      <div className="mb-4 text-xs text-gray-500">Step 2 of 3</div>
      <h3 className="text-lg font-semibold">What’s the main reason you’re cancelling?</h3>

      <div className="mt-4 grid gap-2">
        {REASONS.map(r => (
          <label key={r.code} className="flex items-center gap-2 rounded border p-3 text-sm">
            <input
              type="radio"
              name="reason"
              className="h-4 w-4"
              checked={code === r.code}
              onChange={() => setCode(r.code)}
            />
            <span>{r.label}</span>
          </label>
        ))}
      </div>

      {selected?.follow && (
        <div className="mt-4">
          {selected.follow.type === 'price' ? (
            <input
              type="number"
              className="w-full rounded border p-3 text-sm"
              placeholder={selected.follow.placeholder}
              value={follow}
              onChange={(e) => setFollow(e.target.value)}
            />
          ) : (
            <textarea
              className="w-full rounded border p-3 text-sm"
              rows={4}
              placeholder={selected.follow.placeholder}
              value={follow}
              onChange={(e) => setFollow(e.target.value)}
            />
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={onBack} className="rounded border px-4 py-2 text-sm">Back</button>
        <button onClick={continueClick} className="rounded border px-4 py-2 text-sm">Continue</button>
      </div>
    </div>
  );
}