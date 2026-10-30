import type {
  EntityHit, Health, LaunchBrief, Mode, SkillDetail, SkillsCatalog, Study, StudySummary, TagHit,
} from "../types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch { /* keep statusText */ }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<Health>("/health"),
  demoBrief: () => request<LaunchBrief>("/templates/demo"),
  listStudies: () => request<StudySummary[]>("/studies"),
  getStudy: (id: string) => request<Study>(`/studies/${id}`),
  createStudy: (brief: LaunchBrief, mode: Mode) =>
    request<Study>("/studies", { method: "POST", body: JSON.stringify({ brief, mode }) }),
  startPlan: (id: string) => request<Study>(`/studies/${id}/plan`, { method: "POST" }),
  saveInputs: (id: string, concept_seeds: unknown[]) =>
    request<Study>(`/studies/${id}/inputs`, { method: "PUT", body: JSON.stringify({ concept_seeds }) }),
  startRun: (id: string) => request<Study>(`/studies/${id}/run`, { method: "POST" }),
  searchEntities: (query: string, mode: Mode) =>
    request<EntityHit[]>(`/qloo/entities?query=${encodeURIComponent(query)}&mode=${mode}`),
  searchTags: (query: string, mode: Mode) =>
    request<TagHit[]>(`/qloo/tags?query=${encodeURIComponent(query)}&mode=${mode}`),
  skills: () => request<SkillsCatalog>("/skills"),
  skill: (name: string) => request<SkillDetail>(`/skills/${encodeURIComponent(name)}`),
  runSkill: (name: string, task: string, input: string) =>
    request<{ skill: string; result: string }>(`/skills/${encodeURIComponent(name)}/run`, {
      method: "POST",
      body: JSON.stringify({ task, input, json_output: false }),
    }),
  reportUrl: (id: string) => `/api/studies/${id}/report.md`,
};
