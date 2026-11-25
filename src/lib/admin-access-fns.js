import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { ADMIN_ROLES, deny, requireSuperAdmin } from "@/lib/admin-guard";
import { writeAudit } from "@/lib/notify";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);
const lower = (value) => String(value ?? "").trim().toLowerCase();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const active = (user) => (user.account_status || "active") === "active";
const roleOf = (user) => user.admin_role || "administrator";

const shape = (user) => ({
  id: user.id,
  name: user.full_name || user.email,
  email: user.email,
  admin_role: roleOf(user),
  account_status: user.account_status || "active",
  created_date: user.created_date || "",
  last_login_at: user.last_login_at || "",
});

async function administrators(db) {
  return list(await db.entities.User.list("-created_date", 500)).filter((user) => user.role === "admin");
}

async function otherActiveSuperAdmins(db, exceptId) {
  const rows = await administrators(db);
  return rows.filter(
    (user) => user.id !== exceptId && roleOf(user) === "super_admin" && active(user)
  );
}

/* --------------------------------------------------------------- the caller */

// Fresh, server-verified view of the signed-in user's administrator status. The
// dashboard layout and the admin sign-in page use this instead of the cached
// session copy, so a deactivation takes effect immediately.
export const getAdminSession = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const record = await db.entities.User.get(context.user.id).catch(() => null);
    if (!record || record.role !== "admin") {
      return { isAdmin: false, reason: "not_admin" };
    }
    if (!active(record)) return { isAdmin: false, reason: "deactivated" };
    return {
      isAdmin: true,
      user_id: record.id,
      name: record.full_name || record.email,
      email: record.email,
      admin_role: roleOf(record),
      account_status: record.account_status || "active",
      last_login_at: record.last_login_at || "",
    };
  });

// Records the administrator's sign-in time (shown in the management table).
export const recordAdminSignIn = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const record = await db.entities.User.get(context.user.id).catch(() => null);
    if (!record || record.role !== "admin" || !active(record)) return { ok: false };
    const at = new Date().toISOString();
    await db.entities.User.update(record.id, { last_login_at: at });
    await writeAudit(db, {
      actor: { ...record, admin_role: roleOf(record) },
      action: "administrator.signed_in",
      entity: "User",
      recordId: record.id,
      details: `${record.email} · ${roleOf(record)}`,
    });
    return { ok: true, last_login_at: at };
  });

/* ------------------------------------------------------- administrator table */

export const listAdministrators = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context);
    const db = context.getBase44().asServiceRole;
    return (await administrators(db)).map(shape);
  });

export const createAdministrator = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator(
    z.object({
      full_name: z.string().trim().min(2).max(120),
      email: z.string().trim().regex(EMAIL).max(160),
      admin_role: z.enum(ADMIN_ROLES),
      account_status: z.enum(["active", "suspended"]).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context);
    const db = context.getBase44().asServiceRole;
    const email = lower(data.email);

    const existing = list(await db.entities.User.list("-created_date", 500)).find(
      (user) => lower(user.email) === email
    );
    if (existing?.role === "admin") throw deny("That email already belongs to an administrator.", 400);
    if (existing) {
      throw deny("That email already has a donor account. Use a different address for an administrator.", 400);
    }

    // The platform sends the invitation and the person sets their own password —
    // no password is ever created, shown or stored by this app.
    await db.users.inviteUser(data.email, "admin");

    let created = null;
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      if (attempt) await new Promise((resolve) => setTimeout(resolve, 400));
      created =
        list(await db.entities.User.list("-created_date", 200)).find((user) => lower(user.email) === email) || null;
    }
    if (!created) {
      throw deny("The invitation was sent, but the account is not ready yet. Refresh the list in a moment.", 400);
    }

    const updated = await db.entities.User.update(created.id, {
      full_name: data.full_name,
      admin_role: data.admin_role,
      account_status: data.account_status || "active",
    });
    await writeAudit(db, {
      actor,
      action: "administrator.invited",
      entity: "User",
      recordId: created.id,
      details: `${data.email} · ${data.admin_role} · ${data.account_status || "active"}`,
    });
    return { ok: true, admin: shape(updated) };
  });

export const updateAdministrator = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator(
    z.object({
      id: z.string().trim().min(1).max(80),
      admin_role: z.enum(ADMIN_ROLES).optional(),
      account_status: z.enum(["active", "suspended"]).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context);
    const db = context.getBase44().asServiceRole;
    const target = await db.entities.User.get(data.id).catch(() => null);
    if (!target || target.role !== "admin") throw deny("Administrator not found", 404);

    const nextRole = data.admin_role || roleOf(target);
    const nextStatus = data.account_status || target.account_status || "active";
    const wasActiveSuper = roleOf(target) === "super_admin" && active(target);
    const staysActiveSuper = nextRole === "super_admin" && nextStatus === "active";

    if (target.id === actor.id && nextStatus !== "active") {
      throw deny("You cannot deactivate your own administrator account.", 400);
    }
    if (target.id === actor.id && nextRole !== "super_admin") {
      throw deny("You cannot remove your own Super Admin role.", 400);
    }
    if (wasActiveSuper && !staysActiveSuper) {
      const remaining = await otherActiveSuperAdmins(db, target.id);
      if (remaining.length === 0) {
        throw deny("At least one active Super Admin must always remain.", 400);
      }
    }

    const updated = await db.entities.User.update(target.id, {
      admin_role: nextRole,
      account_status: nextStatus,
    });
    await writeAudit(db, {
      actor,
      action: "administrator.updated",
      entity: "User",
      recordId: target.id,
      details: `${target.email} · ${roleOf(target)} → ${nextRole} · ${target.account_status || "active"} → ${nextStatus}`,
    });
    return { ok: true, admin: shape(updated) };
  });

export const removeAdministrator = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator(z.object({ id: z.string().trim().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context);
    const db = context.getBase44().asServiceRole;
    const target = await db.entities.User.get(data.id).catch(() => null);
    if (!target || target.role !== "admin") throw deny("Administrator not found", 404);
    if (target.id === actor.id) throw deny("You cannot remove your own administrator access.", 400);

    if (roleOf(target) === "super_admin" && active(target)) {
      const remaining = await otherActiveSuperAdmins(db, target.id);
      if (remaining.length === 0) throw deny("At least one active Super Admin must always remain.", 400);
    }

    const updated = await db.entities.User.update(target.id, { role: "user" });
    await writeAudit(db, {
      actor,
      action: "administrator.access_removed",
      entity: "User",
      recordId: target.id,
      details: `${target.email} · administrator access removed`,
    });
    return { ok: true, admin: shape(updated) };
  });

// The platform owns password reset. This records the authorised request and hands
// the address back so the page can ask the platform to email a reset link.
export const recordAdministratorReset = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator(z.object({ id: z.string().trim().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const actor = await requireSuperAdmin(context);
    const db = context.getBase44().asServiceRole;
    const target = await db.entities.User.get(data.id).catch(() => null);
    if (!target || target.role !== "admin") throw deny("Administrator not found", 404);

    await writeAudit(db, {
      actor,
      action: "administrator.password_reset_sent",
      entity: "User",
      recordId: target.id,
      details: target.email,
    });
    return { ok: true, email: target.email };
  });