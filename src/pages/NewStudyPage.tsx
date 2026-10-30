import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "../services/api";
import { useHealth } from "../hooks/useHealth";
import type { LaunchBrief, Mode } from "../types";

const EMPTY: LaunchBrief = {
  product_name: "", category: "", description: "", audience: "", objective: "", decision: "",
  markets: ["", ""],
  concepts: [
    { id: "c1", name: "", description: "" },
    { id: "c2", name: "", description: "" },
  ],
  constraints: "", reference_points: [],
};

export function NewStudyPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const fromTemplate = params.get("template") === "demo";
  const developerMode = params.get("dev") === "1";
  const { health } = useHealth();
  const [brief, setBrief] = useState<LaunchBrief>(EMPTY);
  const [refs, setRefs] = useState("");
  const [mode, setMode] = useState<Mode>("live");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof LaunchBrief>(k: K, v: LaunchBrief[K]) => setBrief((b) => ({ ...b, [k]: v }));

  const loadDemo = async () => {
    try {
      const template = await api.demoBrief();
      setBrief({ ...template, markets: [...template.markets] });
      setRefs(template.reference_points.join(", "));
      setError(null);
    } catch (err) { setError((err as Error).message); }
  };

  useEffect(() => { if (fromTemplate) void loadDemo(); }, [fromTemplate]);

  const setConcept = (i: number, patch: Partial<LaunchBrief["concepts"][number]>) =>
    set("concepts", brief.concepts.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const markets = brief.markets.map((m) => m.trim()).filter(Boolean);
    if (markets.length < 1) return setError("Enter at least one market (a city works best).");
    setBusy(true);
    try {
      const payload: LaunchBrief = {
        ...brief,
        markets,
        concepts: brief.concepts.map((c, i) => ({ ...c, id: `c${i + 1}` })),
        reference_points: refs.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const study = await api.createStudy(payload, mode);
      await api.startPlan(study.id);
      nav(`/studies/${study.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const liveOk = health?.qloo_live_available ?? true;

  return (
    <div className="brief-layout">
    <form className="form" onSubmit={submit}>
      <div className="page-head">
        <div><span className="eyebrow">01 / THE BRIEF</span><h1>{fromTemplate ? "Meet Fizzora. Test the possibilities." : "What are you putting to the test?"}</h1><p className="muted">A product, an audience, and two or three competing launch ideas.</p></div>
        <button type="button" className="btn" onClick={loadDemo}><BookOpen size={15} /> {fromTemplate ? "Reset example" : "Use beverage brief"}</button>
      </div>

      <section className="card" id="brief-product">
        <h3><span className="section-number">01</span> Product &amp; audience</h3>
        <div className="grid-2">
          <label>Product / brand<input required value={brief.product_name} onChange={(e) => set("product_name", e.target.value)} /></label>
          <label>Category<input required value={brief.category} onChange={(e) => set("category", e.target.value)} /></label>
        </div>
        <label>Short description<textarea rows={2} value={brief.description} onChange={(e) => set("description", e.target.value)} /></label>
        <label>Target audience (aggregate description, no personal data)
          <textarea required rows={2} value={brief.audience} onChange={(e) => set("audience", e.target.value)} />
        </label>
        <div className="grid-2">
          <label>Launch objective<input required value={brief.objective} onChange={(e) => set("objective", e.target.value)} /></label>
          <label>Decision to be made<input value={brief.decision} onChange={(e) => set("decision", e.target.value)} /></label>
        </div>
        <div className="grid-2">
          <label>Market 1 (city or region)<input required value={brief.markets[0] ?? ""} onChange={(e) => set("markets", [e.target.value, brief.markets[1] ?? ""])} /></label>
          <label>Market 2 (optional)<input value={brief.markets[1] ?? ""} onChange={(e) => set("markets", [brief.markets[0] ?? "", e.target.value])} /></label>
        </div>
        <div className="grid-2">
          <label>Constraints (price tier, channel, tone)<input value={brief.constraints} onChange={(e) => set("constraints", e.target.value)} /></label>
          <label>Known competitors / cultural reference points (comma separated)<input value={refs} onChange={(e) => setRefs(e.target.value)} /></label>
        </div>
      </section>

      <section id="brief-concepts">
        <div className="page-head">
          <h3><span className="section-number">02</span> Competing concepts <span className="count">{brief.concepts.length}/3</span></h3>
          <div className="row-meta">
            {brief.concepts.length < 3 && (
              <button type="button" className="btn" onClick={() => set("concepts", [...brief.concepts, { id: `c${brief.concepts.length + 1}`, name: "", description: "" }])}><Plus size={14} /> Add concept</button>
            )}
            {brief.concepts.length > 2 && (
              <button type="button" className="icon-btn" title="Remove last concept" aria-label="Remove last concept" onClick={() => set("concepts", brief.concepts.slice(0, -1))}><Trash2 size={15} /></button>
            )}
          </div>
        </div>
        <div className="grid-3">
          {brief.concepts.map((c, i) => (
            <div key={i} className="card">
              <label>Concept {i + 1} name<input required value={c.name} onChange={(e) => setConcept(i, { name: e.target.value })} /></label>
              <label>Positioning<textarea required rows={4} value={c.description} onChange={(e) => setConcept(i, { description: e.target.value })} /></label>
            </div>
          ))}
        </div>
      </section>

      <section className="card" id="brief-data">
        <h3><span className="section-number">03</span> Evidence source</h3>
        {developerMode ? <><label className="inline"><input type="radio" checked={mode === "live"} disabled={!liveOk} onChange={() => setMode("live")} /> Live Qloo evidence</label>
        <label className="inline"><input type="radio" checked={mode === "fixture"} onChange={() => setMode("fixture")} /> Illustrative demo data (not live Qloo)</label></> : <p className="source-note"><ShieldCheck size={16} /> Live Qloo cultural evidence</p>}
        {!liveOk && <p className="error-text" role="alert">Live evidence is currently unavailable. Please try again once the service is configured.</p>}
      </section>

      {error && <p className="error-text" role="alert">{error}</p>}
      <div className="brief-submit"><span><ShieldCheck size={14} /> {mode === "live" ? "Next: review the cultural signals" : "Illustrative demo data"}</span><button className="btn primary" disabled={busy || (mode === "live" && !liveOk)}>{busy ? "Preparing your test..." : "Prepare my crash test"}<ArrowRight size={15} /></button></div>
    </form>
    <aside className="brief-outline"><span className="eyebrow">YOUR BRIEF</span>{[["brief-product", "Product & audience", Boolean(brief.product_name && brief.audience)], ["brief-concepts", "Competing concepts", brief.concepts.every((concept) => concept.name && concept.description)], ["brief-data", "Evidence source", true]].map(([target, label, done], index) => <a href={`#${target}`} key={String(target)}><span className="outline-number">{done ? <Check size={11} /> : index + 1}</span>{label}</a>)}<p>Qloo affinity is not purchase intent. All recommendations require human review.</p></aside>
    </div>
  );
}
