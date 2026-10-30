export type Mode = "live" | "fixture";
export type StudyStatus =
  | "DRAFT" | "PLANNING" | "AWAITING_CONFIRMATION" | "RETRIEVING" | "ANALYSING" | "COMPLETE" | "FAILED";

export interface Concept { id: string; name: string; description: string }

export interface LaunchBrief {
  product_name: string;
  category: string;
  description: string;
  audience: string;
  objective: string;
  decision: string;
  markets: string[];
  concepts: Concept[];
  constraints: string;
  reference_points: string[];
}

export interface SignalCandidate {
  kind: "entity" | "tag";
  id: string;
  name: string;
  type: string;
  parents: string[];
  description: string;
  selected: boolean;
}

export interface ConceptSeeds {
  concept_id: string;
  hypothesis: string;
  entity_queries: string[];
  tag_queries: string[];
  entity_candidates: SignalCandidate[];
  tag_candidates: SignalCandidate[];
  ambiguous: string[];
}

export interface PlannedQuery { concept_id: string; market: string | null; output_type: string; purpose: string }

export interface ResearchPlan {
  decision_question: string;
  concept_seeds: ConceptSeeds[];
  qloo_cannot_answer: string[];
  queries: PlannedQuery[];
}

export interface EvidenceItem {
  entity_id: string;
  name: string;
  type: string;
  affinity: number | null;
  popularity: number | null;
  tags: string[];
  description: string;
}

export interface Evidence {
  id: string;
  mode: Mode;
  concept_id: string;
  market: string | null;
  purpose: string;
  output_type: string;
  input_entities: { id: string; name: string }[];
  input_tags: { id: string; name: string }[];
  location_context: string | null;
  retrieved_at: string;
  status: "ok" | "empty" | "error";
  error: string | null;
  items: EvidenceItem[];
  limitations: string[];
}

export interface Finding {
  statement: string;
  kind: "evidence" | "inference" | "hypothesis";
  evidence_ids: string[];
  flag: string | null;
}

export interface ConceptAssessment {
  concept_id: string;
  aligned: Finding[];
  mismatches: Finding[];
  distinctive: Finding[];
  localisation_question: string;
  evidence_gaps: string[];
  alternative_direction: string;
  confidence: "low" | "medium" | "high";
  confidence_rationale: string;
}

export interface ConceptProfile {
  concept_id: string;
  calls_ok: number;
  calls_failed: number;
  calls_empty: number;
  item_count: number;
  domains: string[];
  top_tags: { tag: string; count: number }[];
  distinctive_tags: string[];
  shared_tags: string[];
  market_overlap: { markets: string[]; shared: string[]; only_first: string[]; only_second: string[] }[];
  coverage_label: "thin" | "moderate" | "broad";
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  audience: string;
  variable: string;
  method: string;
  primary_metric: string;
  guardrail: string;
  decision_informed: string;
  effort: "low" | "medium" | "high";
  priority: number;
  result_that_changes_recommendation: string;
  concept_ids: string[];
  evidence_ids: string[];
}

export interface Baseline {
  label: string;
  summary: string;
  concept_views: { concept_id: string; view: string; assumptions?: string[] }[];
  recommended_next_step: string;
  audit: { evidence_references?: number; language_flag?: string | null };
}

export interface TimelineEvent {
  ts: string;
  stage: string;
  message: string;
  level: "info" | "warn" | "error";
  evidence_id: string | null;
}

export interface SkillUse { stage: string; skill: string; purpose: string; ts: string }

export interface Study {
  id: string;
  status: StudyStatus;
  mode: Mode;
  created_at: string;
  updated_at: string;
  brief: LaunchBrief;
  plan: ResearchPlan | null;
  evidence: Evidence[];
  profiles: ConceptProfile[];
  assessments: ConceptAssessment[];
  experiments: Experiment[];
  executive_summary: string;
  recommendation: string;
  open_questions: string[];
  baseline: Baseline | null;
  report_markdown: string;
  timeline: TimelineEvent[];
  skills_used: SkillUse[];
  error: string | null;
  qloo_calls_used: number;
}

export interface StudySummary {
  id: string;
  status: StudyStatus;
  mode: Mode;
  product_name: string;
  markets: string[];
  concepts: string[];
  created_at: string;
}

export interface Health {
  status: string;
  qloo_live_available: boolean;
  llm_configured: boolean;
  model: string;
  skills_loaded: number;
  skills_dir: string;
  qloo_call_budget: number;
}

export interface SkillSummary { name: string; folder: string; description: string; resources: number; chars: number }
export interface SkillsCatalog {
  skills: SkillSummary[];
  stage_bindings: Record<string, { skill: string; purpose: string }>;
}
export interface SkillDetail extends SkillSummary { path: string; body: string; resource_files: string[] }

export interface EntityHit { entity_id: string; name: string; type: string; description: string }
export interface TagHit { id: string; name: string; type: string; parents: string[] }
