import type { Study } from "../types";

export function BaselinePanel({ study }: { study: Study }) {
  const b = study.baseline;
  if (!b) return <p className="muted">Baseline not available.</p>;
  const name = (id: string) => study.brief.concepts.find((c) => c.id === id)?.name ?? id;
  const okEvidence = study.evidence.filter((e) => e.status === "ok");
  const items = okEvidence.reduce((n, e) => n + e.items.length, 0);
  const cited = new Set(study.assessments.flatMap((a) => [...a.aligned, ...a.mismatches, ...a.distinctive].flatMap((f) => f.evidence_ids))).size;

  return (
    <>
      <p className="muted note">
        Same brief, no Qloo evidence. The baseline is useful for ideation; the comparison below is about grounding and
        decision usefulness, not which paragraph sounds better. No quantitative superiority is claimed.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Dimension</th><th>AI without evidence</th><th>Taste Test Dummy + Qloo</th></tr></thead>
          <tbody>
            <tr><td>Cultural claims traceable to evidence</td><td>No ({b.audit.evidence_references ?? 0} references)</td><td>{cited} evidence records cited from {okEvidence.length} retrieved</td></tr>
            <tr><td>Returned cultural items inspected</td><td>0</td><td>{items}</td></tr>
            <tr><td>Evidence vs inference labelled</td><td>No</td><td>Yes, per finding</td></tr>
            <tr><td>Concrete validation experiments</td><td>One-line next step</td><td>{study.experiments.length} structured experiments</td></tr>
            <tr><td>Language check</td><td>{b.audit.language_flag ?? "No overstated claims detected"}</td><td>Checked per finding</td></tr>
          </tbody>
        </table>
      </div>
      <h3>Baseline output</h3>
      <p>{b.summary}</p>
      <div className="grid-3">
        {b.concept_views.map((v) => (
          <section className="card" key={v.concept_id}>
            <h4>{name(v.concept_id)}</h4>
            <p>{v.view}</p>
            {v.assumptions && v.assumptions.length > 0 && (
              <><strong>Unverified assumptions</strong><ul>{v.assumptions.map((a) => <li key={a}>{a}</li>)}</ul></>
            )}
          </section>
        ))}
      </div>
      <p><strong>Recommended next step:</strong> {b.recommended_next_step}</p>
    </>
  );
}
