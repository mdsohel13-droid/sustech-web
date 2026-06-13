import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "../access";

/**
 * automation-settings (Lead Engine master plan §3.2c) — the DB-level master
 * toggle for the 24 h auto-publish path, flippable from a phone. It is ONE of
 * three independent stops (env AUTO_PUBLISH_ENABLED + this DB toggle + env
 * AUTOMATION_KILL_SWITCH); all three must permit before anything auto-publishes.
 * Ships OFF; the owner flips it on only after ≥2 weeks of shadow-mode logs.
 */
export const AutomationSettings: GlobalConfig = {
  slug: "automation-settings",
  label: "Automation settings",
  admin: {
    group: "Lead Engine",
    description:
      "Master switches for the nightly content pipeline. Auto-publish ships OFF — turn it on " +
      "only after reviewing the shadow-mode logs.",
  },
  access: { read: isAdminOrEditor, update: isAdminOrEditor },
  fields: [
    {
      name: "autoPublishEnabled",
      type: "checkbox",
      defaultValue: false,
      label: "Enable 24-hour auto-publish",
      admin: {
        description:
          "When OFF, every draft waits for your explicit approval forever (recommended until trusted). " +
          "When ON, low-risk prose-only edits in the whitelisted categories may publish 24 h after the " +
          "approval email is delivered — still subject to the env switch, kill switch, claim-diff veto, " +
          "category whitelist and daily cap.",
      },
    },
    {
      name: "pipelineNote",
      type: "textarea",
      admin: { description: "Internal note (e.g. why auto-publish is on/off, who decided)." },
    },
  ],
};
