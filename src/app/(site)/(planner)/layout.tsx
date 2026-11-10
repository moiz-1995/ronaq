import { cookies } from "next/headers";
import { getUser } from "@/lib/auth";
import { MODE_COOKIE } from "@/lib/mode";
import { PlannerNav } from "./PlannerNav";

/** Shared bar for the planning pages, so Dashboard, Events, Calendar, Messages and Shortlist are always one tap apart. */
export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  // the planning bar is for khareedar; a dukaandaar reading their notifications doesn't get it
  const vendorMode = (await cookies()).get(MODE_COOKIE)?.value === "vendor";
  return (
    <>
      {user && !vendorMode && (
        <div className="border-b-[3px] border-ink bg-sand">
          <div className="wrap py-2"><PlannerNav /></div>
        </div>
      )}
      {children}
    </>
  );
}
