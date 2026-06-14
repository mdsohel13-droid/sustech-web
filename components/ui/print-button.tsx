"use client";

/** Small client island so a server-rendered page can offer "Print / Save PDF". */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print / Save PDF
    </button>
  );
}
