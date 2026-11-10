import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { NavProgress } from "@/components/motion/NavProgress";
import { StaggerObserver } from "@/components/motion/StaggerObserver";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] pb-24 md:pb-0">{children}</main>
      <SiteFooter />
      <Toaster />
      <StaggerObserver />
      <Suspense fallback={null}><NavProgress /></Suspense>
    </>
  );
}
