import type { Access, FieldAccess } from "payload";

export type Role = "admin" | "editor" | "hermes";

const roleOf = (user: unknown): Role | undefined =>
  (user as { role?: Role } | null | undefined)?.role;

export const hasRole = (user: unknown, ...roles: Role[]): boolean => {
  const role = roleOf(user);
  return role ? roles.includes(role) : false;
};

/** Anyone, including anonymous visitors. */
export const anyone: Access = () => true;

/** Any logged-in user. */
export const authenticated: Access = ({ req }) => Boolean(req.user);

export const isAdmin: Access = ({ req }) => hasRole(req.user, "admin");
export const isAdminOrEditor: Access = ({ req }) => hasRole(req.user, "admin", "editor");

/** Admin + Editor + the Hermes service account (Hermes may draft but never publish). */
export const isContentWriter: Access = ({ req }) => hasRole(req.user, "admin", "editor", "hermes");

/** Field-level: only admins. */
export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, "admin");

/**
 * Public reads see only published documents; logged-in staff (and Hermes) can read drafts
 * so they can preview/work on them.
 */
export const readPublished: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
