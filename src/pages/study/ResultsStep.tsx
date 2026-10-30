import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, ChartNoAxesCombined, Download, FileText, FlaskConical, Layers3, ListChecks, Printer, ScanLine, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../services/api";
import { Banner } from "../../components/Badges";
import { BaselinePanel } from "../../components/BaselinePanel";
import { ComparisonTable } from "../../components/ComparisonTable";
import { EvidenceCard } from "../../components/EvidenceCard";
import { ExperimentList } from "../../components/ExperimentList";
import { FindingList } from "../../components/FindingList";
import { SkillsUsed } from "../../components/SkillsUsed";
import { Timeline } from "../../components/Timeline";
import type { Study } from "../../types";
import { customerReport } from "../../utils/format";

const TABS = ["Overview", "Compare", "Stress test", "Next experiments", "Evidence", "Report"] as const;
type Tab = (typeof TABS)[number];
const TAB_ICONS = [ListChecks, ChartNoAxesCombined, ScanLine, FlaskConical, Layers3, FileText];

export function ResultsStep({ study, onEvidence }: { study: Study; onEvidence: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [params] = useSearchParams();
  const developerMode = params.get("dev") === "1";
  const report = tab === "Report" ? customerReport(study.report_markdown ?? "") : "";
  const [reportUrl, setReportUrl] = useState("");
  useEffect(() => {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([report], { type: "text/markdown;charset=utf-8" }));
    setReportUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [report]);
  const [evidenceQuery, setEvidenceQuery] = useState("");
  const [conceptFilter, setConceptFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const name = (id: string) => study.brief.concepts.find((c) => c.id === id)?.name ?? id;
  const successful = study.evidence.filter((evidence) => evidence.status === "ok");
  const evidenceItems = successful.reduce((count, evidence) => count + evidence.items.length, 0);
  const evidenceList = study.evidence.filter((evidence) => (conceptFilter === "all" || evidence.concept_id === conceptFilter) && (marketFilter === "all" || (evidence.market ?? "global") === marketFilter) && `${evidence.id} ${evidence.purpose} ${evidence.items.map((item) => item.name).join(" ")}`.toLowerCase().includes(evidenceQuery.toLowerCase()));

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Study results" onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const current = TABS.indexOf(tab);
        const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
        setTab(TABS[next]);
        event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[next].focus();
      }}>
        {TABS.map((title, index) => {
          const Icon = TAB_ICONS[index];
          return <button key={title} id={`tab-${index}`} role="tab" aria-controls="results-panel" tabIndex={tab === title ? 0 : -1} aria-selected={tab === title} className={tab === title ? "on" : ""} onClick={() => setTab(title)}><Icon size={14} />{title}</button>;
        })}
      </div>
      <div id="results-panel" role="tabpanel" aria-labelledby={`tab-${TABS.indexOf(tab)}`} className="tab-panel" key={tab}>
      {tab === "Overview" && (
        <div className="stack">
          <div className="result-summary-layout">
            <section className="summary-narrative">
              <span className="eyebrow">03 / YOUR NEXT MOVE</span><h2>What held up. What to test next.</h2>
              <span className="badge kind-inference">AI interpretation of cultural evidence</span>
              <p>{study.executive_summary || "The executive summary is not available yet."}</p>
              <div className="recommendation"><h4>Suggested validation priority</h4><p>{study.recommendation}</p></div>
              <p className="note muted">Cultural affinity is not purchase intent or causal lift. Human review required.</p>
              {study.open_questions.length > 0 && <div className="summary-secondary"><h3>Questions worth resolving</h3><ol className="question-list">{study.open_questions.map((question, index) => <li key={question}><span>{String(index + 1).padStart(2, "0")}</span>{question}</li>)}</ol></div>}
            </section>
            <aside className="summary-facts"><h3>The evidence behind it</h3><div className="fact"><span>Returned items</span><strong>{evidenceItems}</strong></div><div className="fact"><span>Successful queries</span><strong>{successful.length}<small className="muted"> / {study.evidence.length}</small></strong></div><div className="fact"><span>Markets in the brief</span><strong>{study.brief.markets.length}</strong></div><div className="fact"><span>Validation experiments</span><strong>{study.experiments.length}</strong></div><button className="btn primary" onClick={() => setTab("Next experiments")}>Choose the next experiment <ArrowRight size={14} /></button><button className="btn" onClick={() => setTab("Evidence")}>Inspect evidence <Layers3 size={14} /></button><p className="muted note" style={{ marginTop: 20 }}>{study.mode === "live" ? "Source: Qloo API" : "Source: illustrative demo data"}</p></aside>
          </div>
          {developerMode && <><div className="summary-secondary"><SkillsUsed uses={study.skills_used} /></div>
          <details className="card">
            <summary>Investigation trace ({study.timeline.length} events, {study.qloo_calls_used} Qloo calls)</summary>
            <Timeline events={study.timeline} onEvidence={onEvidence} />
          </details></>}
        </div>
      )}

      {tab === "Compare" && (
        <ComparisonTable concepts={study.brief.concepts} profiles={study.profiles} markets={study.brief.markets} />
      )}

      {tab === "Stress test" && (
        <div className="grid-3 tall">
          {study.assessments.map((a) => (
            <section className="card" key={a.concept_id}>
              <header className="card-head">
                <h3>{name(a.concept_id)}</h3>
                <span className={`badge conf-${a.confidence}`}>confidence: {a.confidence}</span>
              </header>
              <p className="muted note">{a.confidence_rationale}</p>
              <FindingList title="What appears aligned" findings={a.aligned} onEvidence={onEvidence} />
              <FindingList title="Potential mismatch" findings={a.mismatches} onEvidence={onEvidence} />
              <FindingList title="Distinctive territory" findings={a.distinctive} onEvidence={onEvidence} />
              {a.localisation_question && <><h4>Localisation question</h4><p>{a.localisation_question}</p></>}
              {a.evidence_gaps.length > 0 && <><h4>Evidence gaps</h4><ul>{a.evidence_gaps.map((g) => <li key={g}>{g}</li>)}</ul></>}
              {a.alternative_direction && <><h4>Alternative direction to test</h4><p>{a.alternative_direction}</p></>}
            </section>
          ))}
        </div>
      )}

      {tab === "Next experiments" && <><div className="result-section-head"><span className="eyebrow">SMALL TESTS BEFORE BIG BETS</span><h2>Your validation plan.</h2></div><ExperimentList experiments={study.experiments} concepts={study.brief.concepts} onEvidence={onEvidence} /></>}

      {tab === "Evidence" && (
        <div className="stack">
          <div className="evidence-filter"><label className="search-field"><Search size={15} /><input aria-label="Search evidence" placeholder="Find a returned item or query..." value={evidenceQuery} onChange={(event) => setEvidenceQuery(event.target.value)} /></label><select aria-label="Filter evidence by concept" value={conceptFilter} onChange={(event) => setConceptFilter(event.target.value)}><option value="all">All concepts</option>{study.brief.concepts.map((concept) => <option key={concept.id} value={concept.id}>{concept.name}</option>)}</select><select aria-label="Filter evidence by market" value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}><option value="all">All markets</option><option value="global">Not market-specific</option>{study.brief.markets.map((market) => <option key={market}>{market}</option>)}</select></div>
          <Banner tone={study.mode === "live" ? "info" : "warn"}>
            {study.mode === "live" ? "Every card below is a stored Qloo response summary." : "ILLUSTRATIVE FIXTURE DATA — not live Qloo."}
          </Banner>
          <span className="muted note">{evidenceList.length} evidence records</span>
          {evidenceList.map((e) => <EvidenceCard key={e.id} ev={e} conceptName={name(e.concept_id)} />)}
          {evidenceList.length === 0 && <div className="empty-state"><Search size={24} /><h3>No matching evidence</h3><p>Try another query, concept, or market.</p></div>}
          <details className="baseline-details"><summary>Without cultural evidence: an AI-only comparison</summary><BaselinePanel study={study} /></details>
        </div>
      )}

      {tab === "Report" && (
        <div className="stack">
          <div className="report-toolbar">
            <div><span className="eyebrow">DECISION BRIEF</span><h2>Ready for the conversation.</h2></div>
            <div className="actions">{report && <a className="btn" href={reportUrl || undefined} download={`taste-test-dummy-${study.id}.md`}><Download size={14} /> Download brief</a>}<button className="btn primary" onClick={() => window.print()}><Printer size={14} /> Print / PDF</button>{developerMode && <a className="link" href={api.reportUrl(study.id)} download>Original audit report</a>}</div>
          </div>
          <article className="report-paper"><ReactMarkdown remarkPlugins={[remarkGfm]}>{report || "The report is not available yet."}</ReactMarkdown></article>
        </div>
      )}
      </div>
    </>
  );
}
