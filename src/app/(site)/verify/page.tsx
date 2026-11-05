import Link from "next/link";
import { verifyEmail } from "@/app/actions/auth";

export const metadata = { title: "Verify email" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmail(token) : false;
  return (
    <div className="wrap grid place-items-center py-20">
      <div className="card card-shadow max-w-md p-8 text-center">
        <h1 className="h-display text-3xl">{ok ? "Email verified" : "Link not valid"}</h1>
        <p className="mt-3 text-mute">{ok ? "Thanks! Your email is confirmed." : "This link has expired or was already used. You can request a new one from your account page."}</p>
        <Link href={ok ? "/dashboard" : "/account"} className="btn btn-blue mt-6">{ok ? "Go to dashboard" : "Go to account"}</Link>
      </div>
    </div>
  );
}
