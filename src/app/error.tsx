"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div className="card card-shadow max-w-md p-8">
        <h1 className="h-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-mute">We couldn&apos;t load this page. Check your connection and try again. If it keeps happening, let us know at support@ronaq.pk.</p>
        <div className="mt-6 flex justify-center gap-2"><button className="btn btn-red" onClick={reset}>Try again</button><Link href="/" className="btn">Go home</Link></div>
      </div>
    </div>
  );
}
