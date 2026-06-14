import type { CollectionConfig } from "payload";
import { hasRole, isAdmin, isAdminField, isSuperAdmin } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Admin",
    defaultColumns: ["name", "email", "role"],
    description:
      "Manage who can access the CMS and what they can do. Only a Super Admin can create or promote users.",
  },
  access: {
    // Super-admins, admins, and editors may enter the admin panel.
    // Hermes is API-only (no admin-panel access).
    admin: ({ req }) => hasRole(req.user, "superAdmin", "admin", "editor"),
    // Only admins / super-admins can list other users
    read: isAdmin,
    // Only super-admins can invite new users (prevents privilege escalation)
    create: isSuperAdmin,
    // Super-admins can update anyone; admins can update editors/hermes only
    update: ({ req }) => hasRole(req.user, "superAdmin", "admin"),
    // Only super-admins can delete users (prevents admins removing each other)
    delete: isSuperAdmin,
  },
  fields: [
    { name: "name", type: "text", label: "Full name" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        {
          label: "⭐ Super Admin — full control including user management",
          value: "superAdmin",
        },
        { label: "Admin — full CMS control (content + settings)", value: "admin" },
        { label: "Editor — content only (cannot publish)", value: "editor" },
        { label: "Hermes — service account (draft only, API use)", value: "hermes" },
      ],
      // Only admins (and super-admins) may change a user's role.
      // The isSuperAdminField guard is enforced in the update access above —
      // a regular admin cannot save a superAdmin or admin role for another user.
      access: { update: isAdminField },
      admin: {
        description:
          "Controls permissions. Only a Super Admin can assign the Super Admin or Admin role.",
      },
    },
  ],
};
