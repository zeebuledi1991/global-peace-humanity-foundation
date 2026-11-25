// Server-side administrator guard, shared by every protected server function.
//
// The role is NEVER taken from the request or from the cached session: each call
// re-reads the caller's current user record with the service-role client, so a
// deactivated administrator loses access on their very next request and an
// administrator cannot obtain Super Admin powers by editing frontend requests or
// database values (administrator access fields are written only from here).

export const ADMIN_ROLES = ["super_admin", "administrator", "finance_manager", "project_manager"];

export const ADMIN_ROLE_LABELS = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  finance_manager: "Finance Manager",
  project_manager: "Project Manager",
};

// What each administrator role may do. "administrators" is Super Admin only.
const CAPABILITIES = {
  finance: ["super_admin", "administrator", "finance_manager"],
  projects: ["super_admin", "administrator", "project_manager"],
  content: ["super_admin", "administrator"],
  users: ["super_admin", "administrator"],
  administrators: ["super_admin"],
};

export const deny = (message, status = 403) => Object.assign(new Error(message), { status });

/**
 * The caller as an administrator, resolved from the database on every request.
 * Throws 403 for a donor account, a deactivated account, or a missing record.
 */
export async function currentAdmin(context, db) {
  const client = db || context.getBase44().asServiceRole;
  const record = await client.entities.User.get(context.user.id).catch(() => null);
  if (!record || record.role !== "admin") throw deny("Administrator access required");
  if ((record.account_status || "active") !== "active") {
    throw deny("This administrator account has been deactivated. Contact the Super Admin.");
  }
  return { ...context.user, ...record, admin_role: record.admin_role || "administrator" };
}

export const requireAdmin = (context, db) => currentAdmin(context, db);

export async function requireCapability(context, capability, db) {
  const admin = await currentAdmin(context, db);
  const allowed = CAPABILITIES[capability] || [];
  if (!allowed.includes(admin.admin_role)) {
    throw deny("Your administrator role does not allow this action");
  }
  return admin;
}

export async function requireSuperAdmin(context, db) {
  const admin = await currentAdmin(context, db);
  if (admin.admin_role !== "super_admin") {
    throw deny("Only a Super Admin can manage administrator accounts");
  }
  return admin;
}