'use client';

import Image from 'next/image';
import type { StepProps } from '../types';

export default function StepJobStatus({ onNext }: StepProps) {
  return (
    <section aria-labelledby="cancel-title" className="w-full">
      {/* Card container (two columns on md+, banner image on mobile) */}
      <div className="
        mx-auto grid w-full gap-6 rounded-[18px] bg-white p-5 shadow-xl ring-1 ring-black/5
        md:grid-cols-[1fr,420px] md:p-6 lg:p-8
      ">
        {/* Top centered eyebrow title like Figma */}
        <div className="md:col-span-2 -mt-1 mb-2 flex items-center justify-center">
          <p className="text-sm font-medium text-gray-500" id="modal-title">
            Subscription Cancellation
          </p>
        </div>

        {/* LEFT: copy + CTAs */}
        <div className="flex flex-col">
          <header className="mb-4 md:mb-6">
            <h1
              id="cancel-title"
              className="mt-1 text-[32px] font-semibold leading-[1.2] text-gray-900"
            >
              Hey mate,<br className="hidden sm:block" />
              <span className="font-extrabold"> Quick one before you go.</span>
            </h1>

            <h2 className="mt-3 text-2xl font-semibold italic text-gray-900">
              Have you found a job yet?
            </h2>

            <p className="mt-3 max-w-prose text-sm leading-6 text-gray-600">
              Whatever your answer, we just want to help you take the next step —
              with visa support, or by hearing how we can do better.
            </p>
          </header>

          {/* Buttons */}
          <div className="mt-auto grid gap-3 sm:max-w-sm">
            <button
              type="button"
              onClick={() => onNext?.({ foundJob: 'yes' })}
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              data-testid="btn-found-job"
            >
              Yes, I&apos;ve found a job
            </button>

            <button
              type="button"
              onClick={() => onNext?.({ foundJob: 'no' })}
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              data-testid="btn-still-looking"
            >
              Not yet — I&apos;m still looking
            </button>
          </div>
        </div>

        {/* RIGHT: image (desktop) */}
        <div className="relative hidden overflow-hidden rounded-xl md:block">
          <Image
            // Your repo shows: public/main-hero.jpeg  (no /public in the URL)
            src="/profile.jpg"
            alt="City skyline"
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Mobile banner image (keeps content near top) */}
        <div className="relative block overflow-hidden rounded-xl md:hidden">
          <Image
            src="/profile.jpg"
            alt="City skyline"
            width={1200}
            height={800}
            className="h-48 w-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
