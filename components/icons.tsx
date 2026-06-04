import {
  Anchor,
  Building2,
  ClipboardCheck,
  Cpu,
  Factory,
  PlugZap,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SectorIconKey, ServiceIconKey } from "@/lib/home-content";

export const serviceIcons: Record<ServiceIconKey, LucideIcon> = {
  solar: Sun,
  electrical: Zap,
  grounding: ShieldCheck,
  smart: Cpu,
  testing: ClipboardCheck,
};

export const sectorIcons: Record<SectorIconKey, LucideIcon> = {
  manufacturing: Factory,
  power: PlugZap,
  commercial: Building2,
  ports: Anchor,
};
