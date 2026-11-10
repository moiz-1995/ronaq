import Link from "next/link";
import { AuthShell } from "@/components/site/AuthShell";
import { findResetToken } from "@/lib/passwordReset";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Naya password", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = !!token && !!(await findResetToken(token));
  return (
    <AuthShell title="Naya password banayein" sub={valid ? "Kam az kam 8 characters ka password rakhein." : "Yeh link purana ho gaya hai ya pehle istemal ho chuka hai."}>
      {valid ? <ResetForm token={token} /> : <Link className="btn btn-red w-full" href="/forgot">Naya link maangein</Link>}
    </AuthShell>
  );
}
