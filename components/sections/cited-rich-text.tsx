import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";
import { splitCiteMarkers } from "@/lib/content/cite-markers";

/**
 * RichText that turns in-body `[cite:n]` markers into superscript footnote
 * links pointing at the Sources & References list (`#ref-n`). Server-rendered,
 * so the citations are real crawlable HTML.
 *
 * It overrides ONLY the `text` node converter — replicating Lexical's format
 * flags (bold/italic/underline/strikethrough/code) so styling is preserved —
 * and splices `<sup>` anchors where markers appear. Everything else uses the
 * default converters. (v2: a proper inline Lexical citation node — Phase 7.)
 */

type RichData = ComponentProps<typeof RichText>["data"];

// Lexical text format bitflags (mirror of NodeFormat).
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

function applyFormat(children: ReactNode, format: number): ReactNode {
  let el: ReactNode = children;
  if (format & IS_BOLD) el = <strong>{el}</strong>;
  if (format & IS_ITALIC) el = <em>{el}</em>;
  if (format & IS_STRIKETHROUGH) el = <span style={{ textDecoration: "line-through" }}>{el}</span>;
  if (format & IS_UNDERLINE) el = <span style={{ textDecoration: "underline" }}>{el}</span>;
  if (format & IS_CODE) el = <code>{el}</code>;
  if (format & IS_SUBSCRIPT) el = <sub>{el}</sub>;
  if (format & IS_SUPERSCRIPT) el = <sup>{el}</sup>;
  return el;
}

const citationConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  text: ({ node }) => {
    const raw = typeof node.text === "string" ? node.text : "";
    const segments = splitCiteMarkers(raw);
    const children = segments.map((seg, i) =>
      seg.type === "cite" ? (
        <sup key={i} className="citation-marker">
          <a
            href={`#ref-${seg.n}`}
            aria-label={`Jump to reference ${seg.n}`}
            className="text-brand font-medium no-underline"
          >
            [{seg.n}]
          </a>
        </sup>
      ) : (
        <Fragment key={i}>{seg.value}</Fragment>
      ),
    );
    return applyFormat(<>{children}</>, typeof node.format === "number" ? node.format : 0);
  },
});

export function CitedRichText({ data }: { data: RichData }) {
  return <RichText data={data} converters={citationConverters} />;
}
