export type Step =
  | 'job_status'
  | 'found_feedback'
  | 'downsell'
  | 'reasons'
  | 'completion';

export type Answers = {
  found_job?: boolean;
  found_via_mm?: boolean | null;
  found_job_feedback?: string;
  reason_code?: string;
  follow_up?: string;
  accepted_downsell?: boolean;
};

export interface FlowState {
  step: Step;
  downsellVariant: 'A' | 'B' | null;
  answers: Answers;
}

export interface StepProps<V = unknown> {
  value?: V;
  onNext: (payload?: Partial<Answers>) => void;
  onBack?: () => void;
  setError?: (msg: string | null) => void;
}