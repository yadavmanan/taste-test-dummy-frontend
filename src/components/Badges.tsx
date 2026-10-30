import type { ReactNode } from "react";
import type { Mode, StudyStatus } from "../types";
import { statusLabel } from "../utils/format";

export function StatusBadge({ status }: { status: StudyStatus }) {
  const tone = status === "COMPLETE" ? "good" : status === "FAILED" ? "bad" : status === "AWAITING_CONFIRMATION" ? "warn" : "info";
  return <span className={`badge badge-${tone}`}>{statusLabel[status] ?? status}</span>;
}

export function ModeBadge({ mode }: { mode: Mode }) {
  return mode === "live"
    ? <span className="badge badge-good">Live Qloo</span>
    : <span className="badge badge-warn">Illustrative demo data</span>;
}

export function KindBadge({ kind }: { kind: "evidence" | "inference" | "hypothesis" }) {
  const label = { evidence: "Qloo evidence", inference: "AI interpretation", hypothesis: "Hypothesis to validate" }[kind];
  return <span className={`badge kind-${kind}`}>{label}</span>;
}

export function Banner({ tone, children }: { tone: "warn" | "bad" | "info"; children: ReactNode }) {
  return <div className={`banner banner-${tone}`}>{children}</div>;
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="spinner-row" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
