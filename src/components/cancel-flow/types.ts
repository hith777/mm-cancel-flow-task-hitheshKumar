// Shared types so all steps agree on shapes

export type Step =
  | 'job_status'       // "Have you found a job yet?"
  | 'found_feedback'   // textarea screen for the "found a job" path
  | 'downsell'         // B-variant only, "stay for $10 off"
  | 'reasons'          // "still looking" reasons + follow-ups
  | 'completion';      // final confirmation screen


export interface StepProps {
  value?: unknown;
  onNext: (payload?: Record<string, unknown>) => void;
  onBack?: () => void;
  setError?: (msg: string | null) => void;
}

export interface FlowState {
  step: Step;
  downsellVariant: 'A' | 'B' | null;
  answers: {
    found_job?: boolean;
    found_via_mm?: boolean;
    found_job_feedback?: string;
    reason_code?: string;
    follow_up?: string;
    accepted_downsell?: boolean;
  };
}
