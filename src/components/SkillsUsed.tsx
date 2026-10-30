import type { SkillUse } from "../types";

export function SkillsUsed({ uses }: { uses: SkillUse[] }) {
  const grouped = new Map<string, { use: SkillUse; n: number }>();
  uses.forEach((u) => {
    const k = `${u.stage}:${u.skill}`;
    const g = grouped.get(k);
    if (g) g.n += 1;
    else grouped.set(k, { use: u, n: 1 });
  });
  if (!grouped.size) return null;
  return (
    <section className="card">
      <h3>Skills applied in this study</h3>
      <ul className="skill-uses">
        {[...grouped.values()].map(({ use, n }) => (
          <li key={`${use.stage}:${use.skill}`}>
            <code>{use.skill}</code> <span className="muted">at {use.stage}{n > 1 ? ` ×${n}` : ""}</span>
            <div className="muted">{use.purpose}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
