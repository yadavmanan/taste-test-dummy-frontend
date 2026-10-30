import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../../services/api";
import { SignalPicker } from "../../components/SignalPicker";
import { outputLabel } from "../../utils/format";
import type { ConceptSeeds, Study } from "../../types";

export function PlanStep({ study, onStarted }: { study: Study; onStarted: () => void }) {
  const plan = study.plan!;
  const [seeds, setSeeds] = useState<ConceptSeeds[]>(plan.concept_seeds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = (id: string) => study.brief.concepts.find((c) => c.id === id)?.name ?? id;
  const missing = seeds.filter((s) => !s.entity_candidates.some((c) => c.selected) && !s.tag_candidates.some((c) => c.selected));
  const queryKinds = [...new Set(plan.queries.map((q) => outputLabel(q.output_type)))];

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.saveInputs(study.id, seeds);
      await api.startRun(study.id);
      onStarted();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <section className="plan-intro">
        <span className="eyebrow">02 / BEFORE IMPACT</span>
        <h2>Right signals. A fairer test.</h2>
        <p><strong>Decision question:</strong> {plan.decision_question}</p>
        <details><summary>Evidence scope and limitations</summary><p>
          Planned Qloo queries: <strong>{plan.queries.length}</strong> across {queryKinds.join(", ")} for {seeds.length} concepts.
          Place queries are run per market ({study.brief.markets.join(", ")}) with the same signals for each concept.
        </p>
          <h4>What Qloo cannot answer by itself</h4>
          <ul>{plan.qloo_cannot_answer.map((q) => <li key={q}>{q}</li>)}</ul>
        </details>
      </section>

      <h3>Confirm the cultural signals</h3>
      <p className="muted">
        These brands, artists, places, and interests are the starting assumptions for each concept. Wrong matches can skew the evidence.
      </p>
      <div className="stack">
        {seeds.map((s) => (
          <SignalPicker key={s.concept_id} seeds={s} conceptName={name(s.concept_id)} mode={study.mode}
                        onChange={(next) => setSeeds(seeds.map((x) => (x.concept_id === next.concept_id ? next : x)))} />
        ))}
      </div>
      {missing.length > 0 && <p className="error-text">Select at least one signal for: {missing.map((m) => name(m.concept_id)).join(", ")}.</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="brief-submit">
        <span>{seeds.length - missing.length} of {seeds.length} concepts have selected signals</span>
        <button className="btn primary" disabled={busy || missing.length > 0} onClick={run}>
          {busy ? "Starting..." : "Confirm & run crash test"}<ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}
