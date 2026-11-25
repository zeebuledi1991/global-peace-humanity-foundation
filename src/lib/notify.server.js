// Shared server helpers for in-app notifications and administrative audit trails.
import { sendBrandedEmail } from "@/lib/mailer.server";

export async function writeAudit(db, { actor, action, entity, recordId, details }) {
  if (!actor) return;
  await db.entities.AuditLog.create({
    actor_id: actor.id || "",
    actor_email: actor.email || "",
    actor_role: actor.admin_role || actor.role || "",
    action,
    entity: entity || "",
    record_id: recordId || "",
    details: details || "",
  });
}

/**
 * Creates an in-app notification for a donor (when the account is known) and,
 * optionally, sends the matching branded email. A notification failure never
 * undoes the action that triggered it.
 */
export async function notifyUser(db, { userId, toEmail, title, message, type = "account", link = "", mail }) {
  if (userId) {
    try {
      await db.entities.Notification.create({
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false,
      });
    } catch {
      // Notifications are best-effort; the audited action still stands.
    }
  }
  if (toEmail && mail) {
    await sendBrandedEmail(db, { to: toEmail, ...mail });
  }
}

export const money = (amount, currency = "USD") => {
  const symbols = { USD: "$", PKR: "Rs ", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$", AED: "AED " };
  const value = Number(amount) || 0;
  return `${symbols[currency] || `${currency} `}${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};