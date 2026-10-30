import { useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Clock3, Globe2, Layers3 } from "lucide-react";
import { api } from "../services/api";
import { useStudy } from "../hooks/useStudy";
import { Banner, ModeBadge, Spinner, StatusBadge } from "../components/Badges";
import { EvidenceCard, EvidenceDialog } from "../components/EvidenceCard";
import { fmtDate } from "../utils/format";
import { Timeline } from "../components/Timeline";
import { PlanStep } from "./study/PlanStep";
import { ResultsStep } from "./study/ResultsStep";

export function StudyPage() {
  const { id } = useParams();
  const { study, error, refresh } = useStudy(id);
  const [openEv, setOpenEv] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error && !study) return <p className="error-text">{error}</p>;
  if (!study) return <Spinner label="Loading study…" />;

  const evidence = study.evidence.find((e) => e.id === openEv);
  const conceptName = (cid: string) => study.brief.concepts.find((c) => c.id === cid)?.name ?? cid;
  const hasResults = study.assessments.length > 0;
  const stage = study.status === "COMPLETE" ? 4 : study.status === "ANALYSING" ? 3 : study.status === "RETRIEVING" ? 2 : study.status === "AWAITING_CONFIRMATION" ? 1 : 0;

  const retryPlan = async () => {
    setActionError(null);
    try { await api.startPlan(study.id); await refresh(); } catch (e) { setActionError((e as Error).message); }
  };

  let body;
  if (study.status === "PLANNING" || study.status === "DRAFT") {
    body = (
      <>
        {study.status === "PLANNING" && <><h2>Finding the starting signals.</h2><Spinner label="Matching your concepts to cultural references for your review..." /></>}
        {study.status === "DRAFT" && <button className="btn primary" onClick={retryPlan}>Build research plan</button>}
        <details><summary>Research activity</summary><Timeline events={study.timeline} /></details>
      </>
    );
  } else if (study.status === "RETRIEVING" || study.status === "ANALYSING") {
    body = (
      <>
        <h2>{study.status === "RETRIEVING" ? "Your ideas are on the test track." : "Turning evidence into your next move."}</h2>
        <Spinner label={study.status === "RETRIEVING" ? "Collecting cultural evidence for each concept..." : "Checking assumptions and shaping the validation plan..."} />
        <div className="grid-2">
          <section>
            <h3>Live investigation</h3>
            <Timeline events={study.timeline} onEvidence={setOpenEv} />
          </section>
          <section>
            <h3>Evidence so far</h3>
            <div className="stack">
              {study.evidence.filter((e) => e.status !== "error" || e.error).map((e) => (
                <EvidenceCard key={e.id} ev={e} conceptName={conceptName(e.concept_id)} />
              ))}
            </div>
          </section>
        </div>
      </>
    );
  } else if (study.status === "AWAITING_CONFIRMATION" || (study.status === "FAILED" && study.plan && !hasResults)) {
    body = (
      <>
        {study.status === "FAILED" && <Banner tone="bad">Last run failed: {study.error}. Adjust the signals and run again.</Banner>}
        <PlanStep study={study} onStarted={refresh} />
      </>
    );
  } else if (study.status === "FAILED" && !study.plan) {
    body = (
      <>
        <Banner tone="bad">{study.error}</Banner>
        <button className="btn primary" onClick={retryPlan}>Retry planning</button>
        <Timeline events={study.timeline} />
      </>
    );
  } else {
    body = (
      <>
        {study.status === "FAILED" && <Banner tone="bad">Run did not finish: {study.error}. Partial results are shown.</Banner>}
        <ResultsStep study={study} onEvidence={setOpenEv} />
      </>
    );
  }

  return (
    <>
      <div className="page-head study-heading">
        <div>
          <span className="eyebrow">CULTURAL CRASH TEST</span>
          <h1>{study.brief.product_name}</h1>
          <p className="muted">{study.brief.category}</p>
          <div className="study-meta"><span><Globe2 size={14} />{study.brief.markets.join(" / ")}</span><span><Layers3 size={14} />{study.brief.concepts.length} concepts</span><span><Clock3 size={14} />{fmtDate(study.created_at)}</span></div>
        </div>
        <div className="row-meta">
          <ModeBadge mode={study.mode} />
          <StatusBadge status={study.status} />
        </div>
      </div>
      <div className="workflow-track" aria-label="Study progress">{["Brief", "Review signals", "Evidence", "Crash test", "Next move"].map((label, index) => <span key={label} className={stage > index || study.status === "COMPLETE" ? "done" : stage === index ? "current" : ""} aria-current={stage === index ? "step" : undefined}><i>{stage > index || study.status === "COMPLETE" ? <Check size={11} /> : index + 1}</i>{label}</span>)}</div>
      {study.mode === "fixture" && <Banner tone="warn">Illustrative demo data, not live Qloo. Nothing on these screens reflects real Qloo results.</Banner>}
      {actionError && <p className="error-text">{actionError}</p>}
      {body}

      {evidence && (
        <EvidenceDialog ev={evidence} conceptName={conceptName(evidence.concept_id)} onClose={() => setOpenEv(null)} />
      )}
    </>
  );
}
