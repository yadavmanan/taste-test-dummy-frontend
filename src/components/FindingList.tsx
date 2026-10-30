import type { Finding } from "../types";
import { KindBadge } from "./Badges";

export function FindingList({ title, findings, onEvidence }: { title: string; findings: Finding[]; onEvidence: (id: string) => void }) {
  if (!findings.length) return null;
  return (
    <div className="findings">
      <h4>{title}</h4>
      <ul>
        {findings.map((f, i) => (
          <li key={i}>
            <KindBadge kind={f.kind} />
            <p>{f.statement}</p>
            <div className="chips">
              {f.evidence_ids.map((id) => (
                <button key={id} className="chip" onClick={() => onEvidence(id)}>{id}</button>
              ))}
              {f.flag && <span className="flag">{f.flag}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
