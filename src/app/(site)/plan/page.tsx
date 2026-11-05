import Link from "next/link";
import { redirect } from "next/navigation";
import { ListChecks, CalendarHeart, Store, Wallet, Bell, MessageCircle } from "lucide-react";
import { getUser } from "@/lib/auth";
import { HeroStage } from "@/components/three/HeroStage";

export const metadata = { title: "Plan an event" };

export default async function PlanPage() {
  const user = await getUser();
  if (user) redirect(user.launchpadStep >= 4 ? "/dashboard" : "/launchpad");
  return (
    <>
      <section className="dot-bg text-sand">
        <div className="wrap grid items-center gap-10 py-14 lg:grid-cols-[1.2fr_.9fr]">
          <div className="min-w-0">
            <p className="kicker !text-[#ff8a8f]">Free event planner</p>
            <h1 className="h-display mt-3 text-[clamp(2.4rem,7vw,5rem)]">Plan your ronaq in three moves.</h1>
            <p className="mt-4 max-w-[50ch] text-lg text-sand/85">Checklists for shaadi, mehndi and birthdays. A countdown to the big day. Quotes and budget in one place. And a marketplace of local vendors to fill every gap.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup?next=/launchpad" className="btn btn-red !border-sand">Start planning, free</Link>
              <Link href="/login?next=/launchpad" className="btn btn-sand">I have an account</Link>
            </div>
          </div>
          <HeroStage />
        </div>
        <div className="patti" />
      </section>
      <section className="wrap grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { i: ListChecks, t: "Ready-made checklists", d: "Wedding, Mehndi, Birthday, Engagement, Bridal shower, Corporate, or your own." },
          { i: CalendarHeart, t: "Countdown & calendar", d: "Your main event leads the dashboard. Dholki, walima and every deadline sit on the calendar." },
          { i: Store, t: "Vendors for each item", d: "Each checklist item opens the right marketplace category, filtered for your city." },
          { i: Wallet, t: "Quotes & budget", d: "Record what vendors quote you and see what's left of the budget." },
          { i: MessageCircle, t: "Message without sharing your number", d: "Send inquiries with only the event details you choose." },
          { i: Bell, t: "Reminders", d: "30, 7 and 1 day before each event, plus your own deadlines." },
        ].map(({ i: I, t, d }) => (
          <div key={t} className="card p-5 shadow-[5px_5px_0_var(--color-ink)]">
            <I className="text-red" />
            <h2 className="mt-3 font-display text-lg">{t}</h2>
            <p className="mt-1 text-sm text-mute">{d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
