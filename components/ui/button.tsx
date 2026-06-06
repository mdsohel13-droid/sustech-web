import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DESIGN-SYSTEM.md §6. Solar-amber `primary` is reserved for the single conversion
 * action (Request a Consultation); all other actions use `secondary`/`ghost`/`dark`.
 * `onDark` adapts outline/ghost styles for dark anchor bands. Min 44px touch target.
 */
const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-[0.9375rem] font-medium whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] duration-[var(--duration-base)] ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-solar text-solar-text shadow-sm hover:bg-solar-600 hover:scale-[1.02] hover:shadow-md",
        secondary: "border border-brand bg-transparent text-brand hover:bg-brand/5",
        ghost: "text-brand hover:bg-brand/5",
        dark: "bg-ink-900 text-text-invert shadow-sm hover:bg-ink-800 hover:shadow-md",
      },
      size: {
        default: "min-h-11",
        lg: "min-h-[3.25rem] px-7 text-base",
      },
      onDark: { true: "", false: "" },
    },
    compoundVariants: [
      {
        variant: "secondary",
        onDark: true,
        className: "border-brand-300 text-brand-300 hover:bg-white/10",
      },
      { variant: "ghost", onDark: true, className: "text-brand-300 hover:bg-white/10" },
      {
        variant: "dark",
        onDark: true,
        className: "bg-surface text-ink-900 hover:bg-surface-2",
      },
    ],
    defaultVariants: { variant: "primary", size: "default", onDark: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a Next `<Link>`) with button styles. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, onDark, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, onDark }), className)}
      {...props}
    />
  );
});

export { buttonVariants };
