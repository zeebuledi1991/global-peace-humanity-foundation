import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { currentAdmin } from "@/lib/admin-guard";
import { notifyUser, writeAudit } from "@/lib/notify";
import { BRAND } from "@/lib/mailer";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);
const lower = (value) => String(value ?? "").trim().toLowerCase();

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function attemptRow(db, email) {
  return list(await db.entities.LoginAttempt.filter({ email }, { limit: 1 }))[0] || null;
}

// Additional app-level brute-force protection in front of the sign-in form. The
// platform rate-limits its own authentication endpoint as well.
export const checkLoginThrottle = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().max(160) }))
  .handler(async ({ data, context }) => {
    const email = lower(data.email);
    if (!email) return { blocked: false, minutes: 0 };
    const db = context.getBase44().asServiceRole;
    const row = await attemptRow(db, email);
    if (!row?.locked_until) return { blocked: false, minutes: 0 };
    const until = new Date(row.locked_until).getTime();
    if (Number.isNaN(until) || until <= Date.now()) return { blocked: false, minutes: 0 };
    return { blocked: true, minutes: Math.max(1, Math.ceil((until - Date.now()) / 60000)) };
  });

export const recordLoginFailure = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().max(160) }))
  .handler(async ({ data, context }) => {
    const email = lower(data.email);
    if (!email) return { blocked: false, minutes: 0 };
    const db = context.getBase44().asServiceRole;
    const now = Date.now();
    const row = await attemptRow(db, email);
    const expired = row?.locked_until ? new Date(row.locked_until).getTime() <= now : false;
    const attempts = (expired ? 0 : Number(row?.attempts) || 0) + 1;
    const lock = attempts >= MAX_ATTEMPTS;
    const payload = {
      email,
      attempts: lock ? 0 : attempts,
      locked_until: lock ? new Date(now + LOCK_MINUTES * 60000).toISOString() : "",
      last_attempt: new Date(now).toISOString(),
    };
    if (row) await db.entities.LoginAttempt.update(row.id, payload);
    else await db.entities.LoginAttempt.create(payload);
    return { blocked: lock, minutes: lock ? LOCK_MINUTES : 0 };
  });

export const clearLoginFailures = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().max(160) }))
  .handler(async ({ data, context }) => {
    const email = lower(data.email);
    if (!email) return { ok: true };
    const db = context.getBase44().asServiceRole;
    const row = await attemptRow(db, email);
    if (row) await db.entities.LoginAttempt.delete(row.id);
    return { ok: true };
  });

// Called right after the platform confirms a password change: audit entry plus a
// security notice to the account's own address.
export const notifyPasswordChanged = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const admin = await currentAdmin(context, db);
    const firstName = String(admin.full_name || admin.email).split(" ")[0];

    await writeAudit(db, {
      actor: admin,
      action: "administrator.password_changed",
      entity: "User",
      recordId: admin.id,
      details: "Changed their own password",
    });
    await notifyUser(db, {
      userId: admin.id,
      toEmail: admin.email,
      title: "Your administrator password was changed",
      message: "Your GPHF administrator password was changed. If this was not you, contact the Super Admin immediately.",
      type: "account",
      link: "/admin/super-admin-settings",
      mail: {
        template: "security_password_changed",
        subject: "Your GPHF administrator password was changed",
        heading: "Your password was changed",
        intro: `Hello ${firstName}, the password for your GPHF administrator account was just changed from the admin dashboard.`,
        rows: [
          { label: "Account", value: admin.email },
          { label: "Changed at", value: new Date().toISOString() },
          { label: "Role", value: admin.admin_role },
        ],
        ctaLabel: "Open account settings",
        ctaUrl: `${BRAND.site}/admin/super-admin-settings`,
        note: "If you did not make this change, contact the foundation's Super Admin immediately and reset your password.",
      },
    });
    return { ok: true };
  });