import type { Access, FieldAccess } from "payload";

/**
 * Role hierarchy (highest first):
 *   superAdmin  → full control: manages admins, deploys features, adjusts settings
 *   admin       → full CMS control (all content); cannot manage other admins
 *   editor      → content editing only; cannot publish or manage users
 *   hermes      → service account; draft creation only, never publish
 */
export type Role = "superAdmin" | "admin" | "editor" | "hermes";

const roleOf = (user: unknown): Role | undefined =>
  (user as { role?: Role } | null | undefined)?.role;

export const hasRole = (user: unknown, ...roles: Role[]): boolean => {
  const role = roleOf(user);
  return role ? roles.includes(role) : false;
};

/** Only superAdmin. Used for user management and global settings. */
export const isSuperAdmin: Access = ({ req }) => hasRole(req.user, "superAdmin");

/** Anyone, including anonymous visitors. */
export const anyone: Access = () => true;

/** Any logged-in user. */
export const authenticated: Access = ({ req }) => Boolean(req.user);

/** superAdmin OR admin — full CMS read/write. */
export const isAdmin: Access = ({ req }) => hasRole(req.user, "superAdmin", "admin");

/** superAdmin OR admin OR editor. */
export const isAdminOrEditor: Access = ({ req }) =>
  hasRole(req.user, "superAdmin", "admin", "editor");

/** Admin + Editor + the Hermes service account (Hermes may draft but never publish). */
export const isContentWriter: Access = ({ req }) =>
  hasRole(req.user, "superAdmin", "admin", "editor", "hermes");

/**
 * Field-level: superAdmin or admin can edit.
 * Prevents editors from changing their own role.
 */
export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, "superAdmin", "admin");

/**
 * Field-level: only superAdmin may assign superAdmin / admin roles.
 * A regular admin cannot create another admin or super admin.
 */
export const isSuperAdminField: FieldAccess = ({ req }) => hasRole(req.user, "superAdmin");

/**
 * Public reads see only published documents; logged-in staff (and Hermes) can read drafts
 * so they can preview/work on them.
 */
export const readPublished: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};

/**
 * Read access for collections whose visibility is controlled by an `enabled`
 * checkbox rather than draft/publish versions (e.g. knowledge-resources).
 * Anonymous users see only enabled rows; logged-in staff see everything.
 *
 * Using readPublished here would filter on `_status`, which those collections
 * don't have — that makes their public REST API 500. This is the correct,
 * matching access for an `enabled`-gated collection.
 */
export const readEnabled: Access = ({ req }) => {
  if (req.user) return true;
  return { enabled: { equals: true } };
};
