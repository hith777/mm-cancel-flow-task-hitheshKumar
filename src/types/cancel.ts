export type Variant = 'A' | 'B'; // A=no upfront offer, B=show downsell upfront

export type RangeIndex = 0 | 1 | 2 | 3; // mapping to labels in UI

export const RANGE_APPLIED = ['0','1–5','6–20','20+'] as const;
export const RANGE_EMAILED = ['0','1–5','6–20','20+'] as const;
export const RANGE_INTERVIEWS = ['0','1–2','3–5','5+'] as const;

export type ReasonKey =
  | 'too_expensive'
  | 'platform_not_helpful'
  | 'not_enough_relevant_jobs'
  | 'decided_not_to_move'
  | 'other';

export interface CancellationRow {
  id: string;
  user_id: string;
  subscription_id: string;
  downsell_variant: Variant;
  reason: string | null;
  accepted_downsell: boolean | null;
  created_at: string;
  job_found: boolean | null;
  found_job_with_mm: boolean | null;
  roles_applied_mm: number | null;
  companies_emailed: number | null;
  companies_interviewed: number | null;
  feedback_text: string | null;
  company_provides_lawyer: boolean | null;
  visa_type: string | null;
  extra_details: Record<string, unknown> | null;
}