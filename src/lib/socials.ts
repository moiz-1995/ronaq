// Vendor social links: what a vendor types (a handle, a bare domain, or a full link) becomes a safe https URL.

export const SOCIALS = [
  { key: "instagram", label: "Instagram", host: ["instagram.com"], base: "https://instagram.com/", placeholder: "@yourstudio or instagram.com/yourstudio" },
  { key: "facebook", label: "Facebook", host: ["facebook.com", "fb.com", "m.facebook.com"], base: "https://facebook.com/", placeholder: "facebook.com/yourpage" },
  { key: "tiktok", label: "TikTok", host: ["tiktok.com"], base: "https://www.tiktok.com/@", placeholder: "@yourname" },
  { key: "youtube", label: "YouTube", host: ["youtube.com", "youtu.be", "m.youtube.com"], base: "https://youtube.com/@", placeholder: "@yourchannel or a channel link" },
  { key: "website", label: "Website", host: [], base: "", placeholder: "yourbusiness.pk" },
] as const;

export type SocialKey = (typeof SOCIALS)[number]["key"];
export type Socials = Partial<Record<SocialKey, string>>;

/** Returns a clean https URL, null for empty input, or throws a friendly message for something invalid. */
export function normalizeSocial(key: SocialKey, input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  const def = SOCIALS.find((s) => s.key === key)!;
  if (raw.length > 200) throw new Error(`${def.label} link is too long.`);
  // a plain handle like "@hina.henna" or "hina.henna"
  if (key !== "website" && /^@?[A-Za-z0-9._-]{2,60}$/.test(raw) && !raw.includes(".com")) {
    return def.base + raw.replace(/^@/, "");
  }
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new Error(`That ${def.label} link doesn't look right.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`That ${def.label} link doesn't look right.`);
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (def.host.length && !def.host.some((h) => host === h || host.endsWith("." + h))) throw new Error(`Use a ${def.label} link (${def.host[0]}).`);
  if (key === "website" && !/\.[a-z]{2,}$/i.test(host)) throw new Error("Enter a full website address, like yourbusiness.pk.");
  url.protocol = "https:";
  return url.toString().replace(/\/$/, "");
}

/** Short label for display: instagram.com/hina.henna → @hina.henna */
export function socialLabel(key: SocialKey, url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    if (key === "website") return u.hostname.replace(/^www\./, "");
    if (!path) return u.hostname.replace(/^www\./, "");
    return "@" + path.replace(/^@/, "").split("/")[0];
  } catch {
    return url;
  }
}
