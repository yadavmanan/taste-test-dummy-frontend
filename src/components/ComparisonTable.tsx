import type { Concept, ConceptProfile } from "../types";

export function ComparisonTable({ concepts, profiles, markets }: { concepts: Concept[]; profiles: ConceptProfile[]; markets: string[] }) {
  const name = (id: string) => concepts.find((c) => c.id === id)?.name ?? id;
  return (
    <>
      <p className="muted note">
        These columns summarise returned evidence (coverage and tag overlap). They are not Qloo scores and
        raw affinities from different queries are deliberately not compared.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Concept</th><th>Evidence coverage</th><th>Queries</th><th>Domains</th><th>Distinctive tags</th><th>Tags shared with all concepts</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.concept_id}>
                <td><strong>{name(p.concept_id)}</strong></td>
                <td><span className={`badge cov-${p.coverage_label}`}>{p.coverage_label}</span><div className="muted">{p.item_count} items</div></td>
                <td>{p.calls_ok} ok{p.calls_failed ? ` / ${p.calls_failed} failed` : ""}{p.calls_empty ? ` / ${p.calls_empty} empty` : ""}</td>
                <td>{p.domains.join(", ")}</td>
                <td>{p.distinctive_tags.join(", ") || <span className="muted">none</span>}</td>
                <td className="muted">{p.shared_tags.join(", ") || "none"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {markets.length === 2 && (
        <>
          <h3>Market contrast (place results only)</h3>
          <p className="muted note">Only place queries accept a location filter; other output types apply to both markets.</p>
          <div className="grid-3">
            {profiles.map((p) => {
              const m = p.market_overlap[0];
              return (
                <section key={p.concept_id} className="card">
                  <h4>{name(p.concept_id)}</h4>
                  {!m ? <p className="muted">No place evidence returned.</p> : (
                    <>
                      <p><strong>Only {markets[0]}:</strong> {m.only_first.join(", ") || "none"}</p>
                      <p><strong>Only {markets[1]}:</strong> {m.only_second.join(", ") || "none"}</p>
                      <p><strong>Shared:</strong> {m.shared.join(", ") || "none"}</p>
                    </>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
