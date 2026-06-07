import { Container } from "@/components/ui/container";
import type { SpacerBlock } from "@/payload-types";

export function SpacerView({ block }: { block: SpacerBlock }) {
  const h = block.size === "lg" ? "h-24" : block.size === "sm" ? "h-8" : "h-16";
  return (
    <div className={`bg-surface ${h}`}>
      {block.divider && (
        <Container>
          <hr className="border-border" />
        </Container>
      )}
    </div>
  );
}
