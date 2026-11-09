import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Toaster } from "@/components/ui/Toaster";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] pb-24 md:pb-0">{children}</main>
      <SiteFooter />
      <Toaster />
    </>
  );
}
