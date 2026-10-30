import { useEffect, useState } from "react";
import { Command, Play, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api";
import type { SkillDetail, SkillsCatalog } from "../types";

export function SkillsPage() {
  const [cat, setCat] = useState<SkillsCatalog | null>(null);
  const [active, setActive] = useState<SkillDetail | null>(null);
  const [task, setTask] = useState("");
  const [input, setInput] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => { api.skills().then(setCat).catch((e) => setErr((e as Error).message)); }, []);

  const open = async (name: string) => {
    setOut(null);
    setErr(null);
    try { setActive(await api.skill(name)); } catch (error) { setErr((error as Error).message); }
  };

  const run = async () => {
    if (!active) return;
    setBusy(true); setErr(null); setOut(null);
    try {
      const r = await api.runSkill(active.folder, task, input);
      setOut(typeof r.result === "string" ? r.result : JSON.stringify(r.result, null, 2));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const bound = new Map(Object.entries(cat?.stage_bindings ?? {}).map(([stage, b]) => [b.skill, stage]));

  return (
    <>
      <div className="page-head"><div><span className="eyebrow">REASONING & METHODS</span><h1>The skill library.</h1><p className="muted">{cat?.skills.length ?? 0} installed skills. {Object.keys(cat?.stage_bindings ?? {}).length} workflow bindings.</p></div><Command size={28} strokeWidth={1.2} className="muted" /></div>
      <label className="search-field"><Search size={16} /><input aria-label="Search skills" placeholder="Find a skill or method..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {err && <p className="error-text">{err}</p>}
      <div className="skills-layout">
        <div className="skill-list">
          {cat?.skills.filter((skill) => `${skill.folder} ${skill.description}`.toLowerCase().includes(query.toLowerCase())).map((s) => (
            <button key={s.folder} disabled={busy} className={`skill-item ${active?.folder === s.folder ? "on" : ""}`} onClick={() => open(s.folder)}>
              <strong>{s.folder}</strong>
              {bound.has(s.folder) && <span className="badge badge-good">stage: {bound.get(s.folder)}</span>}
              <span className="muted">{s.description.slice(0, 110)}{s.description.length > 110 ? "…" : ""}</span>
            </button>
          ))}
        </div>
        <div>
          {!active && <div className="empty-state"><Command size={35} strokeWidth={1} /><h3>A method for every question.</h3><p className="muted">No skill selected.</p></div>}
          {active && (
            <section className="card">
              <h3>{active.name}</h3>
              <p>{active.description}</p>
              <p className="muted">{active.path} · {active.resource_files.length} reference files</p>
              <h4>Run this skill</h4>
              <label>Task<input value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Review this paragraph" /></label>
              <label>Input<textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} /></label>
              <button className="btn primary" onClick={run} disabled={busy || task.trim().length < 3}><Play size={13} />{busy ? "Running…" : "Run skill"}</button>
              {out && <div className="summary-secondary"><span className="eyebrow">EXECUTION RESULT</span><ReactMarkdown>{out}</ReactMarkdown></div>}
              <details>
                <summary>Skill instructions</summary>
                <pre className="pre">{active.body}</pre>
              </details>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
