import { requireUser } from "@/lib/auth";
import { ClaimForm } from "./ClaimForm";

export const metadata = { title: "Claim your profile" };

export default async function ClaimPage() {
  await requireUser("/sell/claim");
  return (
    <div className="wrap max-w-xl py-12">
      <p className="kicker">Dukaandaar ke liye</p>
      <h1 className="h-display mt-2 text-4xl">Claim your profile</h1>
      <p className="mt-2 text-mute">Agar Ronaq team ne aap ke liye profile banayi hai to unhon ne aap ko ek claim code diya hoga. Woh code yahan likhein aur profile aap ke account mein aa jayegi. Khud dukaan bana rahe hain? To code ki zaroorat nahi, seedha Start selling dabayein.</p>
      <ClaimForm />
    </div>
  );
}
