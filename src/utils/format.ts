import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

export const outputLabel = (t: string) =>
  ({
    "urn:entity:place": "Places",
    "urn:entity:brand": "Brands",
    "urn:entity:artist": "Artists",
    "urn:entity:tv_show": "TV shows",
  }[t] ?? t.split(":").pop() ?? t);

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
export const fmtDate = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PLANNING: "Building plan",
  AWAITING_CONFIRMATION: "Confirm signals",
  RETRIEVING: "Retrieving evidence",
  ANALYSING: "Analysing",
  COMPLETE: "Complete",
  FAILED: "Failed",
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type ReportNode = { type: string; value?: string; children?: ReportNode[] };

export function customerReport(markdown: string): string {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify);
  const tree = processor.parse(markdown);
  let internalSection = false;
  tree.children = tree.children.filter((node) => {
    if (node.type === "heading" && node.depth === 2) {
      internalSection = node.children.some((child) => child.type === "text" && child.value.includes("Methodology and skills"));
    }
    return !internalSection;
  });
  const rebrand = (node: ReportNode) => {
    if (node.type === "text" && node.value) {
      node.value = node.value.replace(/Cultural Fit Stress Test(?:er)?|\bCFST\b/g, "Taste Test Dummy");
    }
    node.children?.forEach(rebrand);
  };
  rebrand(tree);
  return processor.stringify(tree);
}
