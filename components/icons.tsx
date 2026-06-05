import {
  Anchor,
  BatteryCharging,
  Building2,
  Castle,
  ClipboardCheck,
  Factory,
  Flame,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Lightbulb,
  PlugZap,
  ShieldCheck,
  Shirt,
  Sun,
  Thermometer,
  Utensils,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Service icon keys — must match the `icon` select options in cms/collections/services.ts. */
export type ServiceIconKey =
  | "solar"
  | "bess"
  | "lps"
  | "electrical"
  | "inspection"
  | "substation"
  | "fire"
  | "lighting"
  | "training"
  | "consultancy";

/** Sector icon keys — must match the `icon` select options in cms/collections/sectors.ts. */
export type SectorIconKey =
  | "garments"
  | "government"
  | "ngo"
  | "industrial"
  | "ports"
  | "healthcare"
  | "academic"
  | "food"
  | "commercial"
  | "heritage";

export const serviceIcons: Record<ServiceIconKey, LucideIcon> = {
  solar: Sun,
  bess: BatteryCharging,
  lps: ShieldCheck,
  electrical: Zap,
  inspection: Thermometer,
  substation: PlugZap,
  fire: Flame,
  lighting: Lightbulb,
  training: GraduationCap,
  consultancy: ClipboardCheck,
};

export const sectorIcons: Record<SectorIconKey, LucideIcon> = {
  garments: Shirt,
  government: Landmark,
  ngo: Globe,
  industrial: Factory,
  ports: Anchor,
  healthcare: HeartPulse,
  academic: GraduationCap,
  food: Utensils,
  commercial: Building2,
  heritage: Castle,
};
