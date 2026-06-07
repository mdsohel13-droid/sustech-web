import { Section } from "@/components/ui/section";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import type { ImageGalleryBlock } from "@/payload-types";
import { mediaUrl } from "./shared";

export function ImageGalleryView({ block }: { block: ImageGalleryBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const images = (block.images ?? [])
    .map((row) => mediaUrl(row.image))
    .filter((x): x is { url: string; alt: string } => Boolean(x));
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      title={block.heading ?? undefined}
    >
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((img, i) => (
          <li key={i} className="border-border overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
