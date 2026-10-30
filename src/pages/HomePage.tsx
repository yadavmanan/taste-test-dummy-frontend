import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownWideNarrow, ArrowRight, ArrowUpRight, CheckCheck, FlaskConical, Globe2, LayoutGrid, List, Plus, ScanLine, Search } from "lucide-react";
import { api } from "../services/api";
import { ModeBadge, StatusBadge, Spinner } from "../components/Badges";
import { fmtDate } from "../utils/format";
import type { StudySummary } from "../types";

export function HomePage() {
  const [studies, setStudies] = useState<StudySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [layout, setLayout] = useState("list");
  const [sort, setSort] = useState("newest");
  const search = useDeferredValue(query.trim().toLowerCase());
  const load = () => { setError(null); api.listStudies().then(setStudies).catch((err) => setError(err.message)); };
  useEffect(() => { load(); }, []);
  const complete = studies?.filter((study) => study.status === "COMPLETE").length ?? 0;
  const review = studies?.filter((study) => study.status === "AWAITING_CONFIRMATION").length ?? 0;
  const markets = new Set(studies?.flatMap((study) => study.markets));
  const example = studies?.find((study) => study.status === "COMPLETE" && study.mode === "live");
  const filtered = (studies ?? []).filter((study) => {
    const matches = [study.product_name, ...study.markets, ...study.concepts].join(" ").toLowerCase().includes(search);
    return matches && (filter === "all" || (filter === "complete" && study.status === "COMPLETE") || (filter === "review" && study.status === "AWAITING_CONFIRMATION"));
  }).sort((first, second) => sort === "name" ? first.product_name.localeCompare(second.product_name) : Date.parse(second.created_at) - Date.parse(first.created_at));

  return (
    <>
      <section className="launch-intro" aria-labelledby="product-title">
        <div className="intro-meta"><span className="eyebrow"><ScanLine size={15} /> PRE-LAUNCH CULTURAL CRASH TESTING</span><span className="test-label">POWERED BY QLOO</span></div>
        <h1 id="product-title">Taste Test Dummy<span className="brand-period">.</span></h1>
        <p className="launch-tagline">Crash-test your launch<br />before the market does.</p>
        <p className="launch-description">Your launch deserves more than a gut feeling. Put competing concepts up against Qloo's cultural evidence, uncover shaky assumptions, and decide what to test next.</p>
        <div className="intro-actions"><Link className="btn primary" to="/new?template=demo"><FlaskConical size={17} /> Try the beverage brief <ArrowRight size={16} /></Link><Link className="btn" to="/new"><Plus size={16} /> Start with your own idea</Link>{example && <Link className="text-action" to={`/studies/${example.id}`}>View a completed live test <ArrowUpRight size={14} /></Link>}</div>
        <div className="intro-footnote">Real taste signals. Human judgment. No crystal ball.</div>
      </section>
      <ol className="journey-strip" aria-label="Your crash test journey">
        <li><span>01</span><div><strong>The brief</strong><p>A product. An audience. Competing ideas.</p></div></li>
        <li><span>02</span><div><strong>The crash test</strong><p>Confirmed signals. Evidence. Weak spots.</p></div></li>
        <li><span>03</span><div><strong>The next move</strong><p>A testable hypothesis, not a blind bet.</p></div></li>
      </ol>
      {studies && studies.length > 0 && <section className="lab-stats" aria-label="Workspace statistics"><span><FlaskConical size={14} /><strong>{studies.length}</strong> saved tests</span><span><CheckCheck size={14} /><strong>{complete}</strong> completed</span><span><Globe2 size={14} /><strong>{markets.size}</strong> markets in briefs</span></section>}
      <div className="library-layout">
        <section className="study-library">
          <div className="section-heading"><h2>Your crash tests <span className="count">{studies?.length ?? 0}</span></h2><div className="segmented view-switch" aria-label="Study layout"><button title="List view" aria-label="List view" aria-pressed={layout === "list"} className={layout === "list" ? "on" : ""} onClick={() => setLayout("list")}><List size={16} /></button><button title="Grid view" aria-label="Grid view" aria-pressed={layout === "grid"} className={layout === "grid" ? "on" : ""} onClick={() => setLayout("grid")}><LayoutGrid size={16} /></button></div></div>
          <div className="library-filters"><div className="filter-tabs">{[["all", "All tests"], ["review", `Needs your review (${review})`], ["complete", "Completed"]].map(([value, label]) => <button key={value} className={filter === value ? "on" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
          <div className="library-tools"><label className="search-field"><Search size={17} /><input aria-label="Search studies" placeholder="Search studies, concepts, markets..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="sort-control"><ArrowDownWideNarrow size={16} /><select aria-label="Sort studies" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="name">Name A-Z</option></select></label></div>
          {error && <div className="banner banner-bad" role="alert">{error} <button className="link" onClick={load}>Retry</button></div>}
          {!studies && !error && <Spinner label="Loading your studies" />}
          {studies && filtered.length === 0 && <div className="empty-state"><ScanLine size={30} /><h3>{search || filter !== "all" ? "No matching tests" : "Your first idea is in good company."}</h3><p className="muted">{search || filter !== "all" ? "Try another search or filter." : "Start with the beverage brief or bring a launch of your own."}</p><Link to="/new" className="btn">New crash test <ArrowRight size={15} /></Link></div>}
          <div className={`study-collection ${layout === "grid" ? "is-grid" : ""}`}>
            {filtered.map((study, index) => <Link key={study.id} to={`/studies/${study.id}`} className="study-item" style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}>
              <span className={`study-icon tone-${index % 3}`}><FlaskConical size={22} strokeWidth={1.5} /></span>
              <div className="study-item-body"><div className="study-item-title"><h3>{study.product_name}</h3><StatusBadge status={study.status} /></div><p>{study.markets.join(" / ")}<span className="meta-separator" />{study.concepts.length} concepts</p><div className="study-item-bottom"><ModeBadge mode={study.mode} /><time>{fmtDate(study.created_at)}</time></div></div>
              <ArrowUpRight className="study-arrow" size={19} />
            </Link>)}
          </div>
          <div className="library-count">{filtered.length} of {studies?.length ?? 0} tests</div>
        </section>
        <aside className="library-aside">
          <div className="section-heading"><h2>Meet the test subject</h2><span className="eyebrow">EXAMPLE BRIEF</span></div>
          <Link to="/new?template=demo" className="template-card">
            <div className="template-image"><img src={new URL("../beverage.jpg", import.meta.url).href} alt="Citrus beverages served over ice" /><span className="image-label">Beverage launch</span></div>
            <div className="template-body"><span className="eyebrow">FIZZORA / FICTIONAL BEVERAGE BRAND</span><h3>Three launch ideas.<br />One reality check.</h3><p>Mumbai &amp; Berlin<br />Everyday Reset / Creative Ritual / Natural Social Energy</p><span className="template-cta">Put it to the test <ArrowRight size={17} /></span></div>
          </Link>
          <div className="research-note"><span className="eyebrow">THE RESEARCH STANDARD</span><p>Cultural affinity is a signal.<br /><strong>Not a sales forecast.</strong></p><span className="muted">Human review required before acting on a recommendation.</span></div>
        </aside>
      </div>
    </>
  );
}
