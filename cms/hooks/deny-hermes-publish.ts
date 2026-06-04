import { APIError, type CollectionBeforeChangeHook } from "payload";
import { hasRole } from "../access";

/**
 * Enforces the security model: the Hermes service account is DRAFT-ONLY. It may create and
 * update drafts (e.g. case studies from the ERP) but cannot publish — publishing requires an
 * admin/editor. Trusted human staff publish normally.
 */
export const denyHermesPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (hasRole(req.user, "hermes") && data?._status === "published") {
    throw new APIError(
      "The Hermes service account can save drafts only. An admin or editor must publish.",
      403,
    );
  }
  return data;
};
