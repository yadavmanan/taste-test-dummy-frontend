import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Evidence } from "../types";
import { fmtDate, outputLabel } from "../utils/format";
import { ModeBadge } from "./Badges";

export function EvidenceCard({ ev, conceptName, defaultOpen = false }: { ev: Evidence; conceptName: string; defaultOpen?: boolean }) {
  return (
    <details className={`card evidence ev-${ev.status}`} open={defaultOpen} id={`evidence-${ev.id}`}>
      <summary>
        <code>{ev.id}</code>
        <strong>{conceptName}</strong>
        <span className="muted">{outputLabel(ev.output_type)}{ev.market ? ` · ${ev.market}` : ""}</span>
        <ModeBadge mode={ev.mode} />
        <span className={`badge badge-${ev.status === "ok" ? "good" : ev.status === "empty" ? "warn" : "bad"}`}>{ev.status}</span>
      </summary>
      <dl className="kv">
        <dt>Query purpose</dt><dd>{ev.purpose}</dd>
        <dt>Output type</dt><dd><code>{ev.output_type}</code></dd>
        <dt>Input entities</dt><dd>{ev.input_entities.map((e) => e.name).join(", ") || "none"}</dd>
        <dt>Input tags</dt><dd>{ev.input_tags.map((t) => t.name).join(", ") || "none"}</dd>
        {ev.location_context && (<><dt>Location context</dt><dd>{ev.location_context}</dd></>)}
        <dt>Retrieved</dt><dd>{fmtDate(ev.retrieved_at)}</dd>
      </dl>
      <details><summary className="muted note">Resolved identifiers</summary><dl className="kv">{[...ev.input_entities, ...ev.input_tags].map((signal) => <div key={signal.id}><dt>{signal.name}</dt><dd><code>{signal.id}</code></dd></div>)}</dl></details>
      {ev.error && <p className="error-text">{ev.error}</p>}
      {ev.items.length > 0 && (
        <table className="table compact">
          <thead><tr><th>Returned item</th><th>Affinity (as returned)</th><th>Tags</th></tr></thead>
          <tbody>
            {ev.items.map((i) => (
              <tr key={i.entity_id}>
                <td title={i.description}>{i.name}</td>
                <td>{i.affinity != null ? i.affinity.toFixed(3) : "n/a"}</td>
                <td className="muted">{i.tags.slice(0, 5).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ul className="limits">{ev.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
    </details>
  );
}

export function EvidenceDialog({ ev, conceptName, onClose }: { ev: Evidence; conceptName: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="evidence-dialog" aria-label={`Evidence ${ev.id}`} onCancel={onClose} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }} onClick={(event) => { if (event.target === event.currentTarget && event.clientX < event.currentTarget.getBoundingClientRect().left) onClose(); }}>
    <div className="drawer-head"><div><span className="eyebrow">EVIDENCE LEDGER</span><h2>{ev.id}</h2></div><button className="icon-btn" aria-label="Close evidence" title="Close evidence" onClick={onClose}><X size={18} /></button></div>
    <EvidenceCard ev={ev} conceptName={conceptName} defaultOpen />
  </dialog>;
}
