import { requireUser } from "@/lib/auth";
import { ClaimForm } from "./ClaimForm";

export const metadata = { title: "Claim your profile" };

export default async function ClaimPage() {
  await requireUser("/sell/claim");
  return (
    <div className="wrap max-w-xl py-12">
      <p className="kicker">For vendors</p>
      <h1 className="h-display mt-2 text-4xl">Claim your profile</h1>
      <p className="mt-2 text-mute">If the Ronaq team set up your profile with you, they gave you a claim code. Enter it to take over your profile and manage it yourself.</p>
      <ClaimForm />
    </div>
  );
}
