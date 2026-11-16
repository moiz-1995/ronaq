import Link from "next/link";
import { AuthShell } from "@/components/site/AuthShell";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Password bhool gaye?" };

export default function ForgotPage() {
  return (
    <AuthShell title="Password bhool gaye?" sub="Fikar na karein. We'll send a reset link to the email you registered with.">
      <ForgotForm />
      <p className="rounded-xl bg-sand px-3 py-2 text-sm"><b>Can&apos;t get into your email?</b> Contact Ronaq support at <a className="font-bold underline" href="mailto:support@ronaq.pk">support@ronaq.pk</a> to recover your account.</p>
      <p className="text-sm">Password yaad aa gaya? <Link className="font-bold text-red underline" href="/login">Sign in</Link></p>
    </AuthShell>
  );
}
