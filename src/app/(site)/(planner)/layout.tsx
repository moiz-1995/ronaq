import { getUser } from "@/lib/auth";
import { PlannerNav } from "./PlannerNav";

/** Shared bar for the planning pages, so Dashboard, Events, Calendar, Messages and Shortlist are always one tap apart. */
export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <>
      {user && (
        <div className="border-b-[3px] border-ink bg-sand">
          <div className="wrap py-2"><PlannerNav /></div>
        </div>
      )}
      {children}
    </>
  );
}
