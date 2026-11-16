import Link from "next/link";
import { getUser, safeNext } from "@/lib/auth";
import { AuthShell } from "@/components/site/AuthShell";
import { AuthForm } from "../login/AuthForm";

export const metadata = { title: "Join free" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; as?: string }> }) {
  const { next, as } = await searchParams;
  // no server redirect here: signing in re-renders this page, and a redirect from it would race the form's own hand-off
  const signedIn = await getUser();
  const signedInHome = signedIn ? safeNext(next, signedIn.role !== "user" ? "/admin" : "/dashboard") : undefined;
  return (
    <AuthShell title="Ronaq join karein, bilkul free" sub="Khareedar hon ya dukaandaar, ek hi account kaafi hai.">
      <AuthForm mode="signup" next={next} intent={as === "seller" ? "sell" : "plan"} signedInHome={signedInHome} />
      <p className="text-sm">
        Pehle se account hai? <Link className="font-bold text-red underline" href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link>
      </p>
    </AuthShell>
  );
}
