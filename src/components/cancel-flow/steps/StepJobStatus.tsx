'use client';

import Image from 'next/image';

export default function StepJobStatus({
  onNext,
  setError,
}: {
  onNext: (payload: { found_job: boolean }) => void;
  setError: (msg: string | null) => void;
}) {
  return (
    <div className="font-dm">
      {/* DESKTOP: card body is 1000 wide in the parent; this is the 20px top padding + 540|20|400 grid */}
      <div className="hidden md:grid md:grid-cols-[540px_20px_400px] md:pt-5">
        {/* LEFT COLUMN (540 × 333 area overall) */}
        <div className="pl-5">
          {/* Text block 540 × 135 */}
          <div className="w-[540px]">
            {/* Title 540 × 72 */}
            <h2 className="text-warm-800 font-semibold text-[36px] leading-[44px] tracking-[-0.01em]">
              Hey mate,
              <br />
              Quick one before you go.
            </h2>

            {/* 16px vertical gap */}
            <div className="h-4" />

            {/* Question */}
            <h3 className="text-warm-800 font-semibold italic text-[36px] leading-[44px] tracking-[-0.01em]">
              Have you found a job yet?
            </h3>

            {/* 20px vertical gap */}
            <div className="h-5" />

            {/* Helper 469 × 42 */}
            <p className="text-warm-700 font-semibold text-[16px] leading-[21px] max-w-[469px]">
              Whatever your answer, we just want to help you take the next step. With
              visa support, or by hearing how we can do better.
            </p>

            {/* 20px gap + divider + 20px gap */}
            <div className="h-5" />
            <div className="h-px w-[540px] bg-warm-300" />
            <div className="h-5" />
          </div>

          {/* Buttons area (each 540×40), gap 16, 20 bottom space */}
          <div className="w-[540px]">
            <button
              onClick={() => {
                setError(null);
                onNext({ found_job: true });
              }}
              className="h-10 w-[540px] rounded-[10px] border border-warm-300 bg-white text-warm-700 text-[16px] font-semibold hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#8952FC]"
            >
              Yes, I’ve found a job
            </button>

            <div className="h-4" />

            <button
              onClick={() => {
                setError(null);
                onNext({ found_job: false });
              }}
              className="h-10 w-[540px] rounded-[10px] border border-warm-300 bg-white text-warm-700 text-[16px] font-semibold hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#8952FC]"
            >
              Not yet — I’m still looking
            </button>

            {/* bottom 20 */}
            <div className="h-5" />
          </div>
        </div>

        {/* GUTTER (20px column) */}
        <div />

        {/* RIGHT COLUMN: Image 400 × 333 with “3D” frame */}
        <div className="pr-5">
          <div className="w-[400px] h-[333px] rounded-[12px] overflow-hidden shadow-image-3d">
            <Image
              src="/main-hero.jpg"
              alt="City skyline"
              className="w-full h-full object-cover"
              width={400}
              height={333}
            />
          </div>
        </div>
      </div>

      {/* MOBILE: 320×520 modal content */}
      <div className="md:hidden">
        {/* 12px gap after header divider */}
        <div className="h-3" />

        {/* Image 296×122 with same frame; 12px side padding */}
        <div className="px-3">
          <div
            className="mx-auto rounded-[12px] overflow-hidden shadow-image-3d"
            style={{ width: 296, height: 122 }}
          >
            <Image
              src="/main-hero.jpg"
              alt="City skyline"
              className="w-full h-full object-cover"
              width={296}
              height={122}
            />
          </div>
        </div>

        <div className="h-3" />

        {/* Text stack 296 wide */}
        <div className="px-3">
          <div className="max-w-[296px] mx-auto">
            <h2 className="text-warm-800 font-semibold text-[24px] leading-[30px] tracking-[-0.01em]">
              Hey mate,
              <br />
              Quick one before you go.
            </h2>

            <div className="h-4" />

            <h3 className="text-warm-800 font-semibold italic text-[24px] leading-[30px] tracking-[-0.01em]">
              Have you found a job yet?
            </h3>

            <div className="h-3" />

            <p className="text-warm-700 font-semibold text-[14px] leading-[18px]">
              Whatever your answer, we just want to help you take the next step. With
              visa support, or by hearing how we can do better.
            </p>
          </div>
        </div>

        {/* Buttons sheet with top drop shadow; buttons 296×40, gap 8, 12px sides */}
        <div className="mt-4 bg-white shadow-[0_-8px_24px_rgba(16,24,40,0.12)]">
          <div className="px-3 py-3">
            <div className="max-w-[296px] mx-auto">
              <button
                onClick={() => {
                  setError(null);
                  onNext({ found_job: true });
                }}
                className="h-10 w-[296px] rounded-[10px] border border-warm-300 bg-white text-warm-700 text-[16px] font-semibold hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8952FC]"
              >
                Yes, I’ve found a job
              </button>

              <div className="h-2" />

              <button
                onClick={() => {
                  setError(null);
                  onNext({ found_job: false });
                }}
                className="h-10 w-[296px] rounded-[10px] border border-warm-300 bg-white text-warm-700 text-[16px] font-semibold hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8952FC]"
              >
                Not yet — I’m still looking
              </button>
            </div>
          </div>
        </div>

        {/* bottom space if needed */}
        <div className="h-3" />
      </div>
    </div>
  );
}