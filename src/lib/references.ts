// A vendor's previous work and references, shown on their public profile. Pure so it can be unit-tested.
export type WorkReference = { title: string; client?: string; note?: string; link?: string };

export const MAX_REFERENCES = 8;
export const BLANK_REFERENCE: WorkReference = { title: "", client: "", note: "", link: "" };

/** Accepts "instagram.com/x" or a full address. Only http(s) sites are allowed, stored as https. */
export function normalizeReferenceLink(input: string): string | undefined {
  const raw = input.trim();
  if (!raw) return undefined;
  const bad = new Error(`“${raw.slice(0, 40)}” doesn't look like a web link. Check it, or leave the link empty.`);
  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    throw bad;
  }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || !url.hostname.includes(".")) throw bad;
  url.protocol = "https:";
  return url.href.slice(0, 300);
}

/** Rows arrive as parallel form fields. Rows without a title are dropped. Throws on a bad link. */
export function parseReferences(rows: { titles: string[]; clients: string[]; notes: string[]; links: string[] }): WorkReference[] {
  const out: WorkReference[] = [];
  rows.titles.forEach((t, i) => {
    const title = t.trim().slice(0, 100);
    if (!title || out.length >= MAX_REFERENCES) return;
    const client = (rows.clients[i] ?? "").trim().slice(0, 80);
    const note = (rows.notes[i] ?? "").trim().slice(0, 300);
    const link = normalizeReferenceLink(rows.links[i] ?? "");
    out.push({ title, ...(client ? { client } : {}), ...(note ? { note } : {}), ...(link ? { link } : {}) });
  });
  return out;
}
