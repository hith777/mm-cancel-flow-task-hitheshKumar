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
}

export interface FlowState {
  step: Step;                              // which screen we're on
  answers: Record<string, unknown>;        // everything the user has answered so far
  downsellVariant: 'A' | 'B' | null;       // A/B value (we'll fill this later)
}
