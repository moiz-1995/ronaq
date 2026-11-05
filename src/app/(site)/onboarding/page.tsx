import { requireUser, safeNext } from "@/lib/auth";
import { getCategories, getCities } from "@/lib/queries";
import { HEARD_FROM } from "@/db/catalog";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await requireUser("/onboarding");
  const [cities, cats] = await Promise.all([getCities(), getCategories()]);
  return (
    <div className="wrap max-w-2xl py-10">
      <p className="kicker">Welcome to Ronaq</p>
      <h1 className="h-display mt-2 text-[clamp(2rem,6vw,3.2rem)]">A few quick questions</h1>
      <p className="mt-2 text-mute">Only your name and city are needed. Skip anything else. You can change it all later in your account.</p>
      <OnboardingForm
        next={safeNext(next, "/marketplace")}
        user={{ name: user.name, cityId: user.cityId, interests: user.interests ?? [] }}
        cities={cities.map((c) => ({ id: c.id, name: c.name, active: c.active }))}
        cats={cats.map((c) => ({ id: c.slug, name: c.name }))}
        heard={HEARD_FROM}
      />
    </div>
  );
}
