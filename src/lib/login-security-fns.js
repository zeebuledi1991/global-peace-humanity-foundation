import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { currentAdmin } from "@/lib/admin-guard";
import { notifyUser, writeAudit } from "@/lib/notify";
import { BRAND } from "@/lib/mailer";

// Sign-in throttling is enforced by the platform's own authentication service.
// An app-level lockout keyed on a caller-supplied email could not be trusted:
// it was trivially bypassed by calling the auth endpoint directly and could be
// used to lock a chosen administrator out of the sign-in page, so it was removed.

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