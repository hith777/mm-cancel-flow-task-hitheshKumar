'use client';

import Image from 'next/image';
import type { StepProps } from '../types';

export default function StepJobStatus({ onNext }: StepProps) {
  return (
    // ARIA: tie title to the section so screen readers announce it
    <section aria-labelledby="cancel-title" className="w-full">
      {/* Card container */}
      <div className="
        mx-auto grid w-full gap-6 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5
        md:grid-cols-[1fr,420px] md:p-6 lg:p-8
      ">
        {/* LEFT: text + actions */}
        <div className="flex flex-col">
          <header className="mb-4 md:mb-6">
            {/* Small eyebrow label */}
            <p className="text-sm font-medium text-gray-500">Subscription Cancellation</p>

            {/* Main heading */}
            <h1 id="cancel-title" className="mt-2 text-2xl font-semibold leading-snug text-gray-900 md:text-[28px]">
              Hey mate,<br className="hidden sm:block" />
              <span className="font-bold"> Quick one before you go.</span>
            </h1>

            {/* Subheading (italic in the design) */}
            <h2 className="mt-2 text-xl font-semibold italic text-gray-900">
              Have you found a job yet?
            </h2>

            {/* Support text */}
            <p className="mt-3 max-w-prose text-sm leading-6 text-gray-600">
              Whatever your answer, we just want to help you take the next step —
              with visa support, or by hearing how we can do better.
            </p>
          </header>

          {/* CTA buttons */}
          <div className="mt-auto grid gap-3 sm:max-w-sm">
            <button
              type="button"
              onClick={() => onNext?.({ foundJob: 'yes' })}
              className="
                inline-flex w-full items-center justify-center rounded-lg
                border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900
                transition hover:bg-gray-50
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              "
              data-testid="btn-found-job"
            >
              Yes, I&apos;ve found a job
            </button>

            <button
              type="button"
              onClick={() => onNext?.({ foundJob: 'no' })}
              className="
                inline-flex w-full items-center justify-center rounded-lg
                border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900
                transition hover:bg-gray-50
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              "
              data-testid="btn-still-looking"
            >
              Not yet — I&apos;m still looking
            </button>
          </div>
        </div>

        {/* RIGHT: image (desktop) */}
        <div className="relative hidden overflow-hidden rounded-xl md:block">
          <Image
            src="/profile.jpg"     // put your provided main image here
            alt="City skyline"
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Mobile image: short banner so content stays near top */}
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
