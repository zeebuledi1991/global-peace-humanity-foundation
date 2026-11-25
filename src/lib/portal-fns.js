import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { sendBrandedEmail, BRAND } from "@/lib/mailer.server";
import { money } from "@/lib/notify.server";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);
const lower = (value) => String(value ?? "").trim().toLowerCase();
const day = (value) => String(value ?? "").slice(0, 10);

/**
 * Every donation that belongs to the signed-in donor. A donation made before the
 * account existed is claimed only when the platform-verified account email
 * matches the address the donation was made with.
 */
async function loadMyDonations(db, user) {
  const res = await db.entities.Donation.filter({}, { sort: "-created_date", limit: 500 });
  const email = lower(user.email);
  const mine = list(res).filter(
    (donation) =>
      donation.user_id === user.id ||
      (!donation.user_id && email && lower(donation.donor_email) === email)
  );
  const unclaimed = mine.filter((donation) => !donation.user_id);
  if (unclaimed.length) {
    await db.entities.Donation.bulkUpdate(
      unclaimed.map((donation) => ({ id: donation.id, user_id: user.id, donor_type: "registered" }))
    );
    unclaimed.forEach((donation) => {
      donation.user_id = user.id;
      donation.donor_type = "registered";
    });
  }
  return mine;
}

async function loadProjects(db, ids) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const res = await db.entities.Project.filter({ id: { $in: unique } }, { limit: 200 });
  return list(res).reduce((acc, project) => {
    acc[project.id] = project;
    return acc;
  }, {});
}

const publicUser = (user) => ({
  id: user.id,
  full_name: user.full_name || "",
  email: user.email || "",
  country: user.country || "",
  phone: user.phone || "",
  preferred_payment_method: user.preferred_payment_method || "",
  admin_role: user.admin_role || "",
  role: user.role || "user",
  account_status: user.account_status || "active",
});

export const getPortalOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const user = context.user;
    const donations = await loadMyDonations(db, user);
    const completed = donations.filter((donation) => donation.status === "completed");

    const totals = completed.reduce((acc, donation) => {
      const currency = donation.currency || "USD";
      acc[currency] = (acc[currency] || 0) + (Number(donation.amount) || 0);
      return acc;
    }, {});

    const projectIds = [...new Set(completed.map((donation) => donation.project_id).filter(Boolean))];
    const projects = await loadProjects(db, projectIds);
    const joined = projectIds.map((id) => projects[id]).filter(Boolean);

    const [notifications] = await Promise.all([
      db.entities.Notification.filter({ user_id: user.id, is_read: false }, { limit: 50 }),
    ]);

    return {
      user: publicUser(user),
      totals,
      donationCount: donations.length,
      verifiedCount: completed.length,
      pendingCount: donations.filter((donation) => donation.status === "pending").length,
      failedCount: donations.filter((donation) => ["failed", "cancelled"].includes(donation.status)).length,
      refundedCount: donations.filter((donation) => donation.status === "refunded").length,
      supportedProjects: joined.length,
      activeProjects: joined.filter((project) => ["active", "paused"].includes(project.status)).length,
      completedProjects: joined.filter((project) => ["completed", "closed"].includes(project.status)).length,
      unreadNotifications: list(notifications).length,
      recent: donations.slice(0, 5).map((donation) => ({
        ...donation,
        project_title: projects[donation.project_id]?.title || "",
      })),
    };
  });

export const getPortalDonations = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const donations = await loadMyDonations(db, context.user);
    const projects = await loadProjects(db, donations.map((donation) => donation.project_id));

    const status = String(data?.status || "");
    const projectId = String(data?.projectId || "");
    const search = lower(data?.search);
    const from = day(data?.from);
    const to = day(data?.to);

    const rows = donations
      .filter((donation) => (status ? donation.status === status : true))
      .filter((donation) => (projectId ? donation.project_id === projectId : true))
      .filter((donation) => (from ? day(donation.created_date) >= from : true))
      .filter((donation) => (to ? day(donation.created_date) <= to : true))
      .filter((donation) => {
        if (!search) return true;
        const projectTitle = projects[donation.project_id]?.title || "";
        return [donation.reference, donation.receipt_number, projectTitle, donation.amount]
          .some((value) => lower(value).includes(search));
      })
      .map((donation) => ({
        ...donation,
        project_title: projects[donation.project_id]?.title || "",
      }));

    const projectOptions = Object.values(projects).map((project) => ({ id: project.id, title: project.title }));
    return { rows, projectOptions };
  });

export const getPortalTransactions = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const donations = await loadMyDonations(db, context.user);
    const projects = await loadProjects(db, donations.map((donation) => donation.project_id));
    const status = String(data?.status || "");
    const search = lower(data?.search);

    const rows = donations
      .filter((donation) => (status ? donation.status === status : true))
      .filter((donation) => {
        if (!search) return true;
        return [donation.reference, donation.payment_reference, donation.receipt_number]
          .some((value) => lower(value).includes(search));
      })
      .map((donation) => ({
        id: donation.id,
        reference: donation.reference,
        provider: donation.payment_method === "card" ? "Card / hosted checkout" : "Bank transfer",
        payment_reference: donation.payment_reference || "",
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        receipt_number: donation.receipt_number || "",
        created_date: donation.created_date,
        verified_date: donation.verified_date || "",
        project_title: projects[donation.project_id]?.title || "",
        frequency: donation.frequency,
      }));

    const summary = rows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});

    return { rows, summary };
  });

export const getPortalPaymentMethods = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const donations = await loadMyDonations(db, context.user);
    const verified = donations.filter((donation) => donation.status === "completed");

    const methods = Object.values(
      verified.reduce((acc, donation) => {
        const key = donation.payment_method || "bank_transfer";
        acc[key] = acc[key] || {
          method: key,
          label: key === "card" ? "Card / hosted checkout" : "Bank transfer",
          count: 0,
          totals: {},
          last_used: donation.created_date,
        };
        acc[key].count += 1;
        const currency = donation.currency || "USD";
        acc[key].totals[currency] = (acc[key].totals[currency] || 0) + (Number(donation.amount) || 0);
        if (String(donation.created_date) > String(acc[key].last_used)) acc[key].last_used = donation.created_date;
        return acc;
      }, {})
    );

    return {
      preferred: context.user.preferred_payment_method || "",
      methods,
    };
  });

export const getPortalProjects = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const category = String(data?.category || "all");
    const donations = await loadMyDonations(db, context.user);
    const verified = donations.filter((donation) => donation.status === "completed");

    const support = verified.reduce((acc, donation) => {
      if (!donation.project_id) return acc;
      const entry = acc[donation.project_id] || {
        total: 0,
        currency: donation.currency || "USD",
        count: 0,
        first: donation.created_date,
        last: donation.created_date,
      };
      entry.total += Number(donation.amount) || 0;
      entry.count += 1;
      if (String(donation.created_date) < String(entry.first)) entry.first = donation.created_date;
      if (String(donation.created_date) > String(entry.last)) entry.last = donation.created_date;
      acc[donation.project_id] = entry;
      return acc;
    }, {});

    const projects = await loadProjects(db, Object.keys(support));
    let rows = Object.entries(support).map(([id, entry]) => ({
      ...projects[id],
      my_total: entry.total,
      my_currency: entry.currency,
      my_donation_count: entry.count,
      joined_date: entry.first,
      last_donation_date: entry.last,
    }));
    rows = rows.filter((row) => row.id);

    if (category === "active") rows = rows.filter((row) => ["active", "paused"].includes(row.status));
    if (category === "completed") rows = rows.filter((row) => ["completed", "closed"].includes(row.status));

    if (category === "upcoming") {
      const res = await db.entities.Project.filter(
        { is_published: true, status: "upcoming" },
        { sort: "created_date", limit: 60 }
      );
      const supported = new Set(Object.keys(support));
      rows = list(res).filter((project) => !supported.has(project.id));
    }

    if (rows.length) {
      const updates = await db.entities.ProjectUpdate.filter(
        { project_id: { $in: rows.map((row) => row.id) }, is_published: true },
        { sort: "-created_date", limit: 100 }
      );
      const byProject = list(updates).reduce((acc, update) => {
        acc[update.project_id] = acc[update.project_id] || [];
        acc[update.project_id].push(update);
        return acc;
      }, {});
      rows = rows.map((row) => ({ ...row, updates: (byProject[row.id] || []).slice(0, 3) }));
    }

    return { category, projects: rows };
  });

export const getPortalNotifications = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const res = await db.entities.Notification.filter(
      { user_id: context.user.id },
      { sort: "-created_date", limit: 100 }
    );
    return list(res);
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const id = String(data?.id || "");
    if (!id) return { ok: false };
    const record = await db.entities.Notification.get(id).catch(() => null);
    if (!record || record.user_id !== context.user.id) return { ok: false };
    await db.entities.Notification.update(id, { is_read: true });
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    await db.entities.Notification.updateMany(
      { user_id: context.user.id, is_read: false },
      { $set: { is_read: true } }
    );
    return { ok: true };
  });

export const getPortalProfile = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const donations = await loadMyDonations(db, context.user);
    const verified = donations.filter((donation) => donation.status === "completed");
    const totals = verified.reduce((acc, donation) => {
      const currency = donation.currency || "USD";
      acc[currency] = (acc[currency] || 0) + (Number(donation.amount) || 0);
      return acc;
    }, {});
    return {
      user: publicUser(context.user),
      memberSince: context.user.created_date || "",
      verifiedCount: verified.length,
      totals,
    };
  });

export const setPreferredPaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const method = String(data?.method || "");
    if (!["bank_transfer", "card", ""].includes(method)) {
      throw Object.assign(new Error("Unknown payment method"), { status: 400 });
    }
    const updated = await db.entities.User.update(context.user.id, { preferred_payment_method: method });
    return { ok: true, preferred: updated.preferred_payment_method || "" };
  });

export const updatePortalProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator(
    z.object({
      full_name: z.string().trim().min(2).max(120),
      country: z.string().trim().max(80).optional(),
      phone: z.string().trim().max(40).optional(),
      preferred_payment_method: z.enum(["bank_transfer", "card", ""]).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const user = context.user;
    const updated = await db.entities.User.update(user.id, {
      full_name: data.full_name,
      country: data.country || "",
      phone: data.phone || "",
      preferred_payment_method: data.preferred_payment_method || "",
    });

    const existing = await db.entities.EmailLog.filter(
      { to_email: user.email, template: "welcome" },
      { limit: 1 }
    );
    let welcome = { sent: false };
    if (!list(existing).length) {
      welcome = await sendBrandedEmail(db, {
        to: user.email,
        template: "welcome",
        subject: "Welcome to the Global Peace & Humanity Foundation",
        heading: `Welcome, ${data.full_name.split(" ")[0]}`,
        intro:
          "Your GPHF donor portal is ready. From your dashboard you can follow the projects your gifts support, download receipts and manage your account details.",
        rows: [
          { label: "Account email", value: user.email },
          { label: "Portal", value: "gphf.pk/portal" },
        ],
        ctaLabel: "Open my portal",
        ctaUrl: `${BRAND.site}/portal`,
        note: "Questions about your giving? Write to support@gphf.pk and our team will reply.",
      });
    }

    return { user: publicUser(updated), welcomeSent: Boolean(welcome.ok) };
  });