import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCategories, getCities, getMyVendor } from "@/lib/queries";
import { AccountForms } from "./AccountForms";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [cities, cats, vendor] = await Promise.all([getCities(), getCategories(), getMyVendor(user.id)]);
  return (
    <div className="wrap max-w-3xl py-10">
      <p className="kicker">Account</p>
      <h1 className="h-display mt-2 text-4xl">Settings</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/onboarding" className="btn btn-sm">Edit welcome answers</Link>
        <Link href={vendor ? "/seller" : "/sell"} className="btn btn-sm btn-blue">{vendor ? "My business" : "Start selling"}</Link>
      </div>
      <AccountForms
        user={{ name: user.name, email: user.email, phone: user.phone, cityId: user.cityId, interests: user.interests ?? [], remindersEnabled: user.remindersEnabled, emailVerified: user.emailVerified }}
        cities={cities.map((c) => ({ id: c.id, name: c.name }))}
        cats={cats.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
