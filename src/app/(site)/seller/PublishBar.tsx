import Link from "next/link";
import { Megaphone } from "lucide-react";
import { PublishButton } from "./PublishButton";

const FIX: Record<string, string> = { name: "/seller/profile", location: "/seller/profile", modes: "/seller/profile", contact: "/seller/profile", service: "/seller/services" };

/** Shown on every vendor tab until the shop is live, so Publish is never hard to find. */
export function PublishBar({ status, statusReason, ready, missing }: { status: string; statusReason: string | null; ready: boolean; missing: { key: string; label: string }[] }) {
  const resubmit = status === "rejected";
  return (
    <div className="border-b-[3px] border-ink bg-sun">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <Megaphone size={20} className="mt-0.5 flex-none text-red" />
          <div className="min-w-[220px]">
            <p className="font-bold">{resubmit ? "Team ne kuch tabdeeli maangi hai" : "Aap ki dukaan abhi publish nahi hui"}</p>
            {resubmit && statusReason && <p className="text-sm">{statusReason}</p>}
            {ready ? (
              <p className="text-sm">{resubmit ? "Tabdeeli karne ke baad dobara review ke liye bhejein." : "Abhi khareedar ko nazar nahi aa rahi. Publish dabayein aur dukaan live ho jayegi."}</p>
            ) : (
              <p className="text-sm">Publish se pehle yeh bharein: {missing.map((m, i) => <span key={m.key}>{i > 0 && ", "}<Link className="font-bold underline" href={FIX[m.key] ?? "/seller/profile"}>{m.label}</Link></span>)}</p>
            )}
          </div>
        </div>
        <PublishButton ready={ready} resubmit={resubmit} />
      </div>
    </div>
  );
}
