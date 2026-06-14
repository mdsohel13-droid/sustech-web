/**
 * Auto-publish policy (Lead Engine master plan §3.2c). PURE, unit-tested — this
 * is the single decision that lets a robot publish without a human, so it is the
 * most safety-critical function in the system. ALL conditions must hold; any
 * failure denies and names the reason. Default-deny on anything unexpected.
 */

export interface AutoPublishContext {
  envEnabled: boolean; // AUTO_PUBLISH_ENABLED
  dbEnabled: boolean; // automation-settings.autoPublishEnabled
  killSwitch: boolean; // AUTOMATION_KILL_SWITCH set
  pendingSinceMs: number | null; // when the approval email was DELIVERED (clock start)
  nowMs: number;
  afterHours: number; // AUTO_PUBLISH_AFTER_HOURS (24)
  category: string | null | undefined;
  allowedCategories: string[]; // AUTO_PUBLISH_CATEGORIES
  riskFlags: string[] | null | undefined;
  claimsIdentical: boolean; // diffClaims(prev, candidate).identical
  staleSource: boolean; // revisionMeta.staleSource — excluded entirely
  todayCount: number; // auto-publishes already done today
  dailyCap: number; // AUTO_PUBLISH_DAILY_CAP (5)
}

export interface PolicyDecision {
  allow: boolean;
  reasons: string[]; // why it was DENIED (empty when allowed)
}

/**
 * Decide whether a pending draft may auto-publish. Returns allow=false with the
 * failing reason(s). Never throws; unknown/missing inputs deny.
 */
export function canAutoPublish(ctx: AutoPublishContext): PolicyDecision {
  const reasons: string[] = [];

  // 1 — three independent master switches
  if (!ctx.envEnabled) reasons.push("AUTO_PUBLISH_ENABLED is off");
  if (!ctx.dbEnabled) reasons.push("automation-settings.autoPublishEnabled is off");
  if (ctx.killSwitch) reasons.push("AUTOMATION_KILL_SWITCH is engaged");

  // 2 — 24 h since the approval email was DELIVERED (clock never starts otherwise)
  if (ctx.pendingSinceMs == null) {
    reasons.push("no delivered approval email (clock not started)");
  } else if (ctx.nowMs - ctx.pendingSinceMs < ctx.afterHours * 3600 * 1000) {
    reasons.push(`less than ${ctx.afterHours}h since delivery`);
  }

  // 3 — category whitelist (never company/product/market-insight/pages/etc.)
  if (!ctx.category || !ctx.allowedCategories.includes(ctx.category)) {
    reasons.push(`category "${ctx.category ?? "none"}" not in auto-publish whitelist`);
  }

  // 4 — no risk flags AND the numeric ledger is byte-identical
  if (ctx.riskFlags && ctx.riskFlags.length > 0) {
    reasons.push(`risk flags present: ${ctx.riskFlags.join(", ")}`);
  }
  if (!ctx.claimsIdentical) {
    reasons.push("numeric claims changed (numeric-change veto)");
  }
  if (ctx.staleSource) {
    reasons.push("source flagged stale — excluded from auto path");
  }

  // 5 — daily cap
  if (ctx.todayCount >= ctx.dailyCap) {
    reasons.push(`daily cap reached (${ctx.todayCount}/${ctx.dailyCap})`);
  }

  return { allow: reasons.length === 0, reasons };
}

/** Parse the comma-separated AUTO_PUBLISH_CATEGORIES env into a clean list. */
export function parseAllowedCategories(env: string | undefined): string[] {
  return (env ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
