import type { CollectionConfig } from "payload";
import { hasRole, isAdmin, isAdminField } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Admin",
    defaultColumns: ["name", "email", "role"],
  },
  access: {
    // Only admins manage the staff list; Hermes is API-only (no admin UI).
    admin: ({ req }) => hasRole(req.user, "admin", "editor"),
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin (full control)", value: "admin" },
        { label: "Editor (content only)", value: "editor" },
        { label: "Hermes (service account — draft only)", value: "hermes" },
      ],
      access: { update: isAdminField },
      admin: { description: "Controls permissions. Only admins can change roles." },
    },
  ],
};
