import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { AuthForm } from "./AuthForm";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const { next, reason } = await searchParams;
  if (await getUser()) redirect(safeNext(next));
  return (
    <AuthShell
      title="Khush aamdeed!"
      sub={reason ?? (next ? "Sign in karein aur wahin se shuru karein." : "Welcome back. Sign in karein aur apna kaam jaari rakhein.")}
    >
      <AuthForm mode="login" next={next} />
      <p className="text-sm">
        Ronaq par naye hain? <Link className="font-bold text-red underline" href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Free account banayein</Link>
      </p>
      <p className="rounded-xl bg-sand px-3 py-2 text-sm"><b>Dukaandaar hain?</b> Isi account se sign in karein, phir profile menu se <b>Switch to dukaandaar</b> dabayein.</p>
      <DemoLogins />
    </AuthShell>
  );
}

function DemoLogins() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <details className="rounded-xl bg-sand p-3 text-sm">
      <summary className="cursor-pointer font-bold">Demo accounts (development only)</summary>
      <ul className="mt-2 grid gap-1 font-mono text-xs">
        <li>ayesha@example.com / password123 (family planning a wedding)</li>
        <li>hina@example.com / password123 (vendor: Hina&apos;s Henna Studio)</li>
        <li>admin@ronaq.pk / ronaq-admin (admin)</li>
        <li>moderator@ronaq.pk / ronaq-mod (moderator)</li>
      </ul>
    </details>
  );
}
