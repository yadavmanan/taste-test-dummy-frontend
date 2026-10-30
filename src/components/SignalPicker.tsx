import { useState } from "react";
import { api } from "../services/api";
import type { ConceptSeeds, Mode, SignalCandidate } from "../types";

interface Props {
  seeds: ConceptSeeds;
  conceptName: string;
  mode: Mode;
  onChange: (next: ConceptSeeds) => void;
}

export function SignalPicker({ seeds, conceptName, mode, onChange }: Props) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"entity" | "tag">("entity");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggle = (list: "entity_candidates" | "tag_candidates", id: string) =>
    onChange({ ...seeds, [list]: seeds[list].map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)) });

  const search = async () => {
    if (q.trim().length < 2) return;
    setBusy(true);
    setErr(null);
    try {
      if (kind === "entity") {
        const hits = await api.searchEntities(q.trim(), mode);
        const add: SignalCandidate[] = hits
          .filter((h) => !seeds.entity_candidates.some((c) => c.id === h.entity_id))
          .map((h) => ({ kind: "entity", id: h.entity_id, name: h.name, type: h.type, parents: [], description: h.description, selected: false }));
        onChange({ ...seeds, entity_candidates: [...seeds.entity_candidates, ...add] });
      } else {
        const hits = await api.searchTags(q.trim(), mode);
        const add: SignalCandidate[] = hits
          .filter((h) => !seeds.tag_candidates.some((c) => c.id === h.id))
          .map((h) => ({ kind: "tag", id: h.id, name: h.name, type: h.type, parents: h.parents, description: `matched '${q}'`, selected: false }));
        onChange({ ...seeds, tag_candidates: [...seeds.tag_candidates, ...add] });
      }
      setQ("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const renderList = (title: string, list: "entity_candidates" | "tag_candidates") => (
    <div className="signal-col">
      <h4>{title}</h4>
      {seeds[list].length === 0 && <p className="muted">No candidates resolved.</p>}
      {seeds[list].map((c) => (
        <label key={c.id} className={`signal ${c.selected ? "on" : ""}`} title={c.description}>
          <input type="checkbox" checked={c.selected} onChange={() => toggle(list, c.id)} />
          <span>
            {c.name}
            <small>{c.type.split(":").slice(-1)[0]}{c.parents.length ? ` · ${c.parents.map((p) => p.split(":").pop()).join("/")}` : ""}</small>
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <section className="card">
      <header className="card-head">
        <h3>{conceptName}</h3>
      </header>
      <p className="hypothesis"><strong>Hypothesis:</strong> {seeds.hypothesis}</p>
      {seeds.ambiguous.length > 0 && (
        <div className="banner banner-warn">
          No exact name match for: {seeds.ambiguous.join(", ")}. Check the pre-selected entities, or search for a better one.
        </div>
      )}
      <div className="signal-grid">
        {renderList("Entities", "entity_candidates")}
        {renderList("Tags", "tag_candidates")}
      </div>
      <div className="search-row">
        <select value={kind} onChange={(e) => setKind(e.target.value as "entity" | "tag")}>
          <option value="entity">Entity</option>
          <option value="tag">Tag</option>
        </select>
        <input value={q} placeholder="Search Qloo to add a signal" onChange={(e) => setQ(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && search()} />
        <button className="btn" onClick={search} disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </div>
      {err && <p className="error-text">{err}</p>}
    </section>
  );
}
