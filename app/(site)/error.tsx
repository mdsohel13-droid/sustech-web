"use client";

/**
 * Site-level error boundary.
 *
 * Catches unhandled runtime errors in Server Components within the (site)
 * route group and renders a branded recovery UI instead of the generic
 * Next.js error page.
 */
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SiteError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to the browser console for debugging; replace with your error
    // reporting service (e.g. Sentry) once configured.
    console.error("[SiteError]", error);
  }, [error]);

  return (
    <main
      id="main"
      className="bg-surface flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center"
    >
      <div className="border-border bg-surface-2 mx-auto max-w-md rounded-2xl border p-10">
        <AlertTriangle className="text-solar mx-auto mb-4 h-12 w-12" aria-hidden />
        <h1 className="text-h2 font-bold">Something went wrong</h1>
        <p className="text-text-soft mt-3">
          We&apos;ve encountered an unexpected error. Please try again — if the problem persists,
          contact our team.
        </p>
        {error.digest && (
          <p className="text-text-soft mt-2 font-mono text-xs">Reference: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
