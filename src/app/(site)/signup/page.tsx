import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { AuthShell } from "@/components/site/AuthShell";
import { AuthForm } from "../login/AuthForm";

export const metadata = { title: "Join free" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; as?: string }> }) {
  const { next, as } = await searchParams;
  if (await getUser()) redirect(safeNext(next));
  return (
    <AuthShell title="Join Ronaq, free" sub="One account to plan events, and to sell your services if you're a vendor.">
      <AuthForm mode="signup" next={next} intent={as === "seller" ? "sell" : "plan"} />
      <p className="text-sm">
        Already have an account? <Link className="font-bold text-red underline" href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link>
      </p>
    </AuthShell>
  );
}
