import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resolveHref, type CmsLink } from "@/lib/resolve-link";

export type Appearance = "default" | "muted" | "dark" | null | undefined;
export type SectionTone = "light" | "muted" | "dark";

export const toneOf = (a: Appearance): SectionTone =>
  a === "dark" ? "dark" : a === "muted" ? "muted" : "light";

export type Cta = CmsLink & { style?: ("primary" | "secondary") | null };

export function CtaButtons({
  ctas,
  onDark = false,
  className = "mt-9",
}: {
  ctas?: Cta[] | null;
  onDark?: boolean;
  className?: string;
}) {
  if (!ctas?.length) return null;
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      {ctas.map((cta, i) => (
        <Button
          key={i}
          asChild
          size="lg"
          variant={cta.style === "secondary" ? "secondary" : "primary"}
          onDark={onDark}
        >
          <Link
            href={resolveHref(cta)}
            prefetch={false}
            target={cta.newTab ? "_blank" : undefined}
            rel={cta.newTab ? "noopener noreferrer" : undefined}
          >
            {cta.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
