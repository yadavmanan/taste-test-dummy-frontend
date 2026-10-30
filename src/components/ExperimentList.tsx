import type { Concept, Experiment } from "../types";

export function ExperimentList({ experiments, concepts, onEvidence }: { experiments: Experiment[]; concepts: Concept[]; onEvidence: (id: string) => void }) {
  const name = (id: string) => concepts.find((c) => c.id === id)?.name ?? id;
  if (!experiments.length) return <p className="muted">No experiments were generated.</p>;
  return (
    <div className="stack">
      {experiments.map((e) => (
        <details key={e.id} className="card" open={e.priority === 1}>
          <summary>
            <span className="prio">P{e.priority}</span>
            <strong>{e.title}</strong>
            <span className={`badge effort-${e.effort}`}>{e.effort} effort</span>
          </summary>
          <dl className="kv">
            <dt>Hypothesis</dt><dd>{e.hypothesis}</dd>
            <dt>Audience</dt><dd>{e.audience}</dd>
            <dt>Variable isolated</dt><dd>{e.variable}</dd>
            <dt>Method</dt><dd>{e.method}</dd>
            <dt>Primary metric</dt><dd>{e.primary_metric}</dd>
            <dt>Guardrail</dt><dd>{e.guardrail}</dd>
            <dt>Decision informed</dt><dd>{e.decision_informed}</dd>
            <dt>Would change the recommendation if</dt><dd>{e.result_that_changes_recommendation}</dd>
            <dt>Concepts</dt><dd>{e.concept_ids.map(name).join(", ") || "all"}</dd>
          </dl>
          <div className="chips">
            {e.evidence_ids.map((id) => <button key={id} className="chip" onClick={() => onEvidence(id)}>{id}</button>)}
          </div>
          <p className="muted note">Set the success threshold before running; Taste Test Dummy does not invent benchmarks.</p>
        </details>
      ))}
    </div>
  );
}
