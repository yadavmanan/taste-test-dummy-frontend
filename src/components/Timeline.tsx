import type { TimelineEvent } from "../types";
import { fmtTime } from "../utils/format";

export function Timeline({ events, onEvidence }: { events: TimelineEvent[]; onEvidence?: (id: string) => void }) {
  return (
    <ol className="timeline">
      {events.map((e, i) => (
        <li key={i} className={`tl-${e.level}`}>
          <time>{fmtTime(e.ts)}</time>
          <span className="tl-stage">{e.stage}</span>
          <span className="tl-msg">
            {e.message}
            {e.evidence_id && onEvidence && (
              <button className="link" onClick={() => onEvidence(e.evidence_id!)}>inspect</button>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
