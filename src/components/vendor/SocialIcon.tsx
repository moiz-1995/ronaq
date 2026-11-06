import { Globe } from "lucide-react";

/** Simple brand glyphs (lucide no longer ships brand icons). Drawn in currentColor. */
export function SocialIcon({ kind, size = 18 }: { kind: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true as const };
  switch (kind) {
    case "instagram":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...p} fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" /></svg>
      );
    case "youtube":
      return (
        <svg {...p} fill="currentColor"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>
      );
    case "tiktok":
      return (
        <svg {...p} fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.8 3.8v2.7c-1.3.1-2.6-.3-3.8-1v5.9c0 3.4-2.6 5.6-5.6 5.6a5.5 5.5 0 0 1-5.6-5.6c0-3.3 2.9-5.9 6.4-5.5v2.8c-1.6-.4-3.4.6-3.4 2.6 0 1.6 1.2 2.8 2.7 2.8 1.6 0 2.7-1.1 2.7-3V3h2.8z" /></svg>
      );
    default:
      return <Globe size={size} aria-hidden />;
  }
}
