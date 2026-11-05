import { notFound } from "next/navigation";

// Placeholder copy. PRD §13: terms, privacy, vendor terms and disclaimers need review by qualified Pakistan counsel before public launch.
const DOCS: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: "Terms of use",
    body: [
      "Ronaq is a discovery and communication platform. It helps you find vendors and contact them. Ronaq is not a party to any agreement between you and a vendor.",
      "Prices, availability, deposits and services are agreed directly between you and the vendor. Ronaq does not collect payments, hold deposits or guarantee any booking, price or outcome.",
      "Keep your account details safe, and don't post content that is false, abusive, or copied from someone else.",
      "We may hide content or suspend accounts that break these terms. We record the reason when we do.",
      "DRAFT: these terms will be reviewed by qualified Pakistan legal counsel before public launch.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "We collect only what we need: your name, email, city and, if you choose, your phone number and event details.",
      "Your event plans are private. Vendors see only the details you choose to share when you send an inquiry.",
      "Vendors' phone numbers are hidden unless the vendor chooses to show them.",
      "Analytics use pseudonymous IDs and never include message text or private event details.",
      "You can ask us to export or delete your data by writing to privacy@ronaq.pk.",
      "DRAFT: this policy will be reviewed by qualified Pakistan legal counsel before public launch.",
    ],
  },
  disclaimer: {
    title: "How Ronaq works",
    body: [
      "Browse vendors for free. You don't need an account to look around.",
      "Create a free account to save vendors, plan events and send inquiries.",
      "An inquiry is a message, not a booking. When a vendor replies, you agree the details with them directly.",
      "“Founding vendor” means one of the first 200 approved vendors on Ronaq. It is not a quality rating.",
      "Verification badges show what we've checked (phone, email, profile review). They are not a guarantee of service.",
      "Attributes marked “vendor-declared”, such as organic henna or dietary options, come from the vendor and have not been certified by Ronaq.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const d = DOCS[(await params).doc];
  if (!d) notFound();
  return (
    <article className="wrap max-w-2xl py-12">
      <h1 className="h-display text-4xl">{d.title}</h1>
      <div className="mt-6 grid gap-4 text-[17px] leading-relaxed">{d.body.map((p, i) => <p key={i} className={p.startsWith("DRAFT") ? "rounded-xl bg-sun/40 p-3 text-sm" : ""}>{p}</p>)}</div>
    </article>
  );
}
