import Link from "next/link";
import { AuthShell } from "@/components/site/AuthShell";
import { emailEnabled } from "@/lib/email";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Password bhool gaye?" };

export default function ForgotPage() {
  const byEmail = emailEnabled();
  return (
    <AuthShell
      title="Password bhool gaye?"
      sub={byEmail ? "Fikar na karein. Apni email likhein, hum password badalne ka link bhej denge." : "Fikar na karein. Apni email likhein, Ronaq team aap ko password badalne ka link de degi."}
    >
      <ForgotForm byEmail={byEmail} />
      <p className="text-sm">Password yaad aa gaya? <Link className="font-bold text-red underline" href="/login">Sign in karein</Link></p>
    </AuthShell>
  );
}
