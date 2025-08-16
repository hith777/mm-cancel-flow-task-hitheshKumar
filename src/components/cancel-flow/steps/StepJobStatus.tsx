'use client';

import Image from 'next/image';
import type { StepProps } from '../types';

/**
 * Step 1 — Matched to Figma-exported code
 * - Card: 1000px wide, rounded 22px, soft ring + deep shadow
 * - Top eyebrow centered with 1px divider
 * - Desktop grid: [540px | 400px] with 40px gap
 * - H1 36px (tight tracking/leading), italic H2, body 16px
 * - Dividers above buttons; pill buttons with inset highlight
 * - “3D” image frame (white frame, ring, deep drop shadow)
 * - Mobile order: eyebrow+divider → image → headings → body → divider → buttons
 */
export default function StepJobStatus({ onNext }: StepProps) {
  return (
    <section aria-labelledby="cancel-title" className="w-full">
      {/* Card */}
      <div
        className="
          mx-auto w-full max-w-[1000px]
          rounded-[22px] bg-white p-5 md:p-6 lg:p-8
          ring-1 ring-black/5 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.25)]
          grid gap-[24px] md:grid-cols-[540px_400px] md:gap-[40px]
        "
      >
        {/* Top bar: centered eyebrow + thin bottom divider (height ≈ 60) */}
        <div className="md:col-span-2 flex items-center justify-center h-[60px] -mt-1 mb-0 border-b border-[#e6e6e6]">
          <p id="modal-title" className="text-[16px] font-medium text-[#41403d]">
            Subscription Cancellation
          </p>
        </div>

        {/* ===== MOBILE IMAGE (top) ===== */}
        <div className="block md:hidden">
          <div className="overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-black/10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)]">
            <Image
              src="/main-hero.jpg"
              alt="City skyline"
              width={1200}
              height={800}
              className="h-40 w-full rounded-xl object-cover"
              priority
            />
          </div>
        </div>

        {/* LEFT COLUMN: text + buttons */}
        <div className="flex flex-col">
          <header className="mt-1">
            {/* H1 */}
            <h1
              id="cancel-title"
              className="
                text-[36px] leading-[36px] tracking-[-1.08px] text-[#41403d]
                font-semibold
              "
            >
              Hey mate,
              <br />
              <span className="font-extrabold">Quick one before you go.</span>
            </h1>

            {/* H2 (italic) */}
            <h2 className="mt-4 text-[36px] italic font-semibold text-[#41403d] leading-[normal]">
              Have you found a job yet?
            </h2>

            {/* Body copy (≈469px) */}
            <p className="mt-5 max-w-[469px] text-[16px] leading-[normal] tracking-[-0.8px] text-[#62605c]">
              Whatever your answer, we just want to help you take the next step.
              With visa support, or by hearing how we can do better.
            </p>
          </header>

          {/* Divider above buttons */}
          <div className="mt-6 border-t border-[#e6e6e6] pt-6">
            <div className="grid gap-[14px] sm:max-w-[540px]">
              {/* CTA 1 */}
              <button
                type="button"
                onClick={() => onNext?.({ found_job: true })}
                className="
                  w-full rounded-[12px] border border-[#e6e6e6] bg-white
                  px-6 py-4 text-[16px] font-semibold text-[#62605c]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                  transition-colors hover:bg-gray-50 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-500
                "
                data-testid="btn-found-job"
              >
                Yes, I&apos;ve found a job
              </button>

              {/* CTA 2 */}
              <button
                type="button"
                onClick={() => onNext?.({ found_job: false })}
                className="
                  w-full rounded-[12px] border border-[#e6e6e6] bg-white
                  px-6 py-4 text-[16px] font-semibold text-[#62605c]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                  transition-colors hover:bg-gray-50 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-500
                "
                data-testid="btn-still-looking"
              >
                Not yet — I&apos;m still looking
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: framed image (desktop) */}
        <div className="hidden md:flex items-start justify-end">
          <div className="overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-black/10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)]">
            <Image
              src="/main-hero.jpg"
              alt="City skyline"
              width={400}
              height={333}
              className="rounded-xl object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
