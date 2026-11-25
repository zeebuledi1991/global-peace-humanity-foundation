import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { requireAdmin, requireCapability } from "@/lib/admin-guard";
import { writeAudit, notifyUser, money } from "@/lib/notify";
import { BRAND } from "@/lib/mailer";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);
const lower = (value) => String(value ?? "").trim().toLowerCase();

// Every check re-reads the caller's current user record (see @/lib/admin-guard),
// so a deactivated administrator loses access immediately and the administrator
// role can never come from the request.
const assertAdmin = (context) => requireAdmin(context);
const assertCapability = (context, capability) => requireCapability(context, capability);

function rangeBounds(data) {
  const range = String(data?.range || "all");
  const now = new Date();
  const start = new Date(now);
  if (range === "today") start.setUTCHours(0, 0, 0, 0);
  else if (range === "7d") start.setUTCDate(start.getUTCDate() - 7);
  else if (range === "30d") start.setUTCDate(start.getUTCDate() - 30);
  else if (range === "month") start.setUTCDate(1);
  else if (range === "year") {
    start.setUTCMonth(0);
    start.setUTCDate(1);
  } else if (range === "custom") {
    return { start: data?.from ? new Date(data.from) : null, end: data?.to ? new Date(data.to) : null };
  } else return { start: null, end: null };
  start.setUTCHours(0, 0, 0, 0);
  return { start, end: null };
}

const inRange = (value, bounds) => {
  if (!bounds.start && !bounds.end) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (bounds.start && date < bounds.start) return false;
  if (bounds.end && date > bounds.end) return false;
  return true;
};

const addTotal = (acc, currency, amount) => {
  const code = currency || "USD";
  acc[code] = (acc[code] || 0) + (Number(amount) || 0);
  return acc;
};

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const bounds = rangeBounds(data);

    const [donationRes, projectRes, users, volunteers, partners, messages] = await Promise.all([
      db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 }),
      db.entities.Project.filter({}, { sort: "created_date", limit: 300 }),
      db.entities.User.list("-created_date", 500),
      db.entities.VolunteerApplication.count({ status: "new" }),
      db.entities.Partnership.count({ status: "new" }),
      db.entities.ContactMessage.count({ status: "new" }),
    ]);

    const donations = list(donationRes);
    const projects = list(projectRes);
    const projectTitle = projects.reduce((acc, project) => {
      acc[project.id] = project.title;
      return acc;
    }, {});
    const scoped = donations.filter((donation) => inRange(donation.created_date, bounds));
    const verified = scoped.filter((donation) => donation.status === "completed");

    const totals = verified.reduce((acc, donation) => addTotal(acc, donation.currency, donation.amount), {});
    const guestEmails = new Set(
      scoped.filter((donation) => !donation.user_id).map((donation) => lower(donation.donor_email))
    );

    // Twelve-month revenue series, one bar per currency that appears.
    const months = [];
    const cursor = new Date();
    cursor.setUTCDate(1);
    cursor.setUTCHours(0, 0, 0, 0);
    for (let index = 11; index >= 0; index -= 1) {
      const date = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - index, 1));
      months.push({
        key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      });
    }
    const currencies = [...new Set(verified.map((donation) => donation.currency || "USD"))].slice(0, 3);
    const revenue = months.map((month) => {
      const row = { month: month.label };
      currencies.forEach((currency) => {
        row[currency] = verified
          .filter((donation) => (donation.currency || "USD") === currency)
          .filter((donation) => String(donation.created_date).slice(0, 7) === month.key)
          .reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);
      });
      return row;
    });

    const byProject = Object.values(
      verified.reduce((acc, donation) => {
        const key = donation.project_id || "general";
        acc[key] = acc[key] || {
          name: projectTitle[key] || "General foundation fund",
          amount: 0,
          currency: donation.currency || "USD",
        };
        acc[key].amount += Number(donation.amount) || 0;
        return acc;
      }, {})
    )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const byCountry = Object.values(
      verified.reduce((acc, donation) => {
        const key = donation.country || "Not provided";
        acc[key] = acc[key] || { name: key, amount: 0, currency: donation.currency || "USD" };
        acc[key].amount += Number(donation.amount) || 0;
        return acc;
      }, {})
    )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const projectStatus = ["draft", "upcoming", "active", "paused", "completed", "closed"].map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: projects.filter((project) => project.status === status).length,
    }));

    const registeredDonors = new Set(
      scoped.filter((donation) => donation.user_id).map((donation) => donation.user_id)
    );

    return {
      totals,
      verifiedCount: verified.length,
      pendingCount: scoped.filter((donation) => donation.status === "pending").length,
      failedCount: scoped.filter((donation) => ["failed", "cancelled"].includes(donation.status)).length,
      refundCount: scoped.filter((donation) => donation.status === "refunded").length,
      registeredUsers: users.length,
      guestDonors: guestEmails.size,
      registeredDonors: registeredDonors.size,
      projects: {
        active: projects.filter((project) => project.status === "active").length,
        upcoming: projects.filter((project) => project.status === "upcoming").length,
        completed: projects.filter((project) => ["completed", "closed"].includes(project.status)).length,
        total: projects.length,
      },
      revenue,
      currencies,
      byProject,
      byCountry,
      projectStatus,
      donorSplit: [
        { name: "Registered users", value: Math.max(registeredDonors.size, 0) },
        { name: "Guest donors", value: guestEmails.size },
      ],
      recent: scoped.slice(0, 8).map((donation) => ({
        ...donation,
        project_title: projectTitle[donation.project_id] || "",
      })),
      newVolunteers: volunteers,
      newPartners: partners,
      newMessages: messages,
      donorCount: users.length + guestEmails.size,
    };
  });

export const getAdminDonors = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const bounds = rangeBounds(data);

    const [donationRes, users] = await Promise.all([
      db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 }),
      db.entities.User.list("-created_date", 500),
    ]);

    const donations = list(donationRes).filter((donation) => inRange(donation.created_date, bounds));
    const byEmail = new Map();

    donations.forEach((donation) => {
      const key = lower(donation.donor_email);
      if (!key) return;
      const entry = byEmail.get(key) || {
        id: donation.user_id || `guest-${key}`,
        name: donation.donor_name,
        email: donation.donor_email,
        phone: donation.donor_phone || "",
        country: donation.country || "",
        type: donation.user_id ? "registered" : "guest",
        user_id: donation.user_id || "",
        count: 0,
        verified_count: 0,
        totals: {},
        last_donation: donation.created_date,
        projects: new Set(),
      };
      entry.count += 1;
      if (donation.status === "completed") {
        entry.verified_count += 1;
        addTotal(entry.totals, donation.currency, donation.amount);
      }
      if (donation.user_id) {
        entry.type = "registered";
        entry.user_id = donation.user_id;
      }
      if (donation.project_id) entry.projects.add(donation.project_id);
      if (String(donation.created_date) > String(entry.last_donation)) entry.last_donation = donation.created_date;
      byEmail.set(key, entry);
    });

    users.forEach((user) => {
      const key = lower(user.email);
      if (!key || byEmail.has(key)) return;
      byEmail.set(key, {
        id: user.id,
        name: user.full_name || user.email,
        email: user.email,
        phone: user.phone || "",
        country: user.country || "",
        type: "registered",
        user_id: user.id,
        count: 0,
        verified_count: 0,
        totals: {},
        last_donation: "",
        projects: new Set(),
        account_status: user.account_status || "active",
      });
    });

    const search = lower(data?.search);
    const type = String(data?.type || "");
    const rows = [...byEmail.values()]
      .map((entry) => ({ ...entry, projects: entry.projects.size }))
      .filter((entry) => (type ? entry.type === type : true))
      .filter((entry) => {
        if (!search) return true;
        return [entry.name, entry.email, entry.country, entry.phone].some((value) => lower(value).includes(search));
      })
      .sort((a, b) => String(b.last_donation || "").localeCompare(String(a.last_donation || "")));

    return rows;
  });

export const getAdminFinance = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "finance");
    const db = context.getBase44().asServiceRole;
    const bounds = rangeBounds(data);

    const [donationRes, projectRes] = await Promise.all([
      db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 }),
      db.entities.Project.filter({}, { limit: 300 }),
    ]);

    const projects = list(projectRes);
    const projectTitle = projects.reduce((acc, project) => {
      acc[project.id] = project.title;
      return acc;
    }, {});

    const scoped = list(donationRes).filter((donation) => inRange(donation.created_date, bounds));
    const status = String(data?.status || "");
    const search = lower(data?.search);

    const rows = scoped
      .filter((donation) => (status ? donation.status === status : true))
      .filter((donation) => {
        if (!search) return true;
        return [donation.reference, donation.donor_name, donation.donor_email, donation.receipt_number]
          .some((value) => lower(value).includes(search));
      })
      .map((donation) => ({
        ...donation,
        donor_type: donation.user_id ? "registered" : "guest",
        project_title: projectTitle[donation.project_id] || "",
      }));

    const verified = scoped.filter((donation) => donation.status === "completed");
    const totals = verified.reduce((acc, donation) => addTotal(acc, donation.currency, donation.amount), {});
    const byMethod = verified.reduce((acc, donation) => {
      const key = donation.payment_method || "bank_transfer";
      acc[key] = acc[key] || { name: key === "card" ? "Card" : "Bank transfer", amount: 0, currency: donation.currency || "USD" };
      acc[key].amount += Number(donation.amount) || 0;
      return acc;
    }, {});
    const byProject = verified.reduce((acc, donation) => {
      const key = donation.project_id || "general";
      acc[key] = acc[key] || { name: projectTitle[key] || "General foundation fund", amount: 0, currency: donation.currency || "USD" };
      acc[key].amount += Number(donation.amount) || 0;
      return acc;
    }, {});

    const guest = verified.filter((donation) => !donation.user_id);
    const registered = verified.filter((donation) => donation.user_id);

    return {
      rows,
      totals,
      counts: {
        all: scoped.length,
        completed: verified.length,
        pending: scoped.filter((donation) => donation.status === "pending").length,
        failed: scoped.filter((donation) => ["failed", "cancelled"].includes(donation.status)).length,
        refunded: scoped.filter((donation) => donation.status === "refunded").length,
      },
      byMethod: Object.values(byMethod),
      byProject: Object.values(byProject).sort((a, b) => b.amount - a.amount).slice(0, 8),
      guestTotals: guest.reduce((acc, donation) => addTotal(acc, donation.currency, donation.amount), {}),
      registeredTotals: registered.reduce((acc, donation) => addTotal(acc, donation.currency, donation.amount), {}),
      guestCount: guest.length,
      registeredCount: registered.length,
    };
  });

export const getAdminDonations = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "finance");
    const db = context.getBase44().asServiceRole;
    const query = data?.status ? { status: data.status } : {};
    const res = await db.entities.Donation.filter(query, { sort: "-created_date", limit: 200 });
    return list(res);
  });

export const getAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "users");
    const db = context.getBase44().asServiceRole;
    const [users, donationRes] = await Promise.all([
      db.entities.User.list("-created_date", 500),
      db.entities.Donation.filter({}, { limit: 1000 }),
    ]);

    const donations = list(donationRes).filter((donation) => donation.status === "completed");
    const search = lower(data?.search);

    const rows = users
      .map((user) => {
        const mine = donations.filter(
          (donation) => donation.user_id === user.id || lower(donation.donor_email) === lower(user.email)
        );
        return {
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
          country: user.country || "",
          phone: user.phone || "",
          role: user.role || "user",
          admin_role: user.admin_role || "",
          account_status: user.account_status || "active",
          created_date: user.created_date,
          donation_count: mine.length,
          totals: mine.reduce((acc, donation) => addTotal(acc, donation.currency, donation.amount), {}),
          projects: new Set(mine.map((donation) => donation.project_id).filter(Boolean)).size,
        };
      })
      .filter((row) => {
        if (!search) return true;
        return [row.name, row.email, row.country].some((value) => lower(value).includes(search));
      });

    return rows;
  });

export const updateUserAccess = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    const actor = await assertCapability(context, "users");
    if (actor.admin_role !== "super_admin") {
      throw Object.assign(new Error("Only a super admin can change administrator access"), { status: 403 });
    }
    const db = context.getBase44().asServiceRole;
    const id = String(data?.id || "");
    const adminRole = String(data?.admin_role || "");
    const status = String(data?.account_status || "");
    if (!id) throw Object.assign(new Error("Missing user"), { status: 400 });
    if (adminRole && !["super_admin", "administrator", "finance_manager", "project_manager"].includes(adminRole)) {
      throw Object.assign(new Error("Unknown administrator role"), { status: 400 });
    }
    if (status && !["active", "suspended"].includes(status)) {
      throw Object.assign(new Error("Unknown account status"), { status: 400 });
    }

    const patch = {};
    if (adminRole) patch.admin_role = adminRole;
    if (status) patch.account_status = status;
    if (data?.role && ["admin", "user"].includes(data.role)) patch.role = data.role;

    const updated = await db.entities.User.update(id, patch);
    await writeAudit(db, {
      actor: context.user,
      action: "user.access_updated",
      entity: "User",
      recordId: id,
      details: JSON.stringify(patch),
    });
    return { ok: true, user: updated };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "users");
    const db = context.getBase44().asServiceRole;
    const res = await db.entities.AuditLog.filter({}, { sort: "-created_date", limit: Number(data?.limit) || 150 });
    const search = lower(data?.search);
    return list(res).filter((log) => {
      if (!search) return true;
      return [log.actor_email, log.action, log.entity, log.record_id, log.details]
        .some((value) => lower(value).includes(search));
    });
  });

export const updateDonationStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "finance");
    const db = context.getBase44().asServiceRole;
    const status = String(data?.status || "");
    if (!["pending", "processing", "completed", "failed", "cancelled", "refunded"].includes(status)) {
      throw Object.assign(new Error("Invalid status"), { status: 400 });
    }

    const donation = await db.entities.Donation.get(String(data?.id || ""));
    const patch = { status };
    if (status === "completed") {
      if (!donation.receipt_number) {
        const year = new Date().getUTCFullYear();
        patch.receipt_number = `GPHF-R-${year}-${String(donation.reference || "").slice(-6)}`;
      }
      patch.verified_date = new Date().toISOString();
      patch.verified_by = context.user.email || "";
    } else {
      patch.verified_date = "";
    }

    const updated = await db.entities.Donation.update(donation.id, patch);
    await writeAudit(db, {
      actor: context.user,
      action: `donation.${status}`,
      entity: "Donation",
      recordId: donation.id,
      details: `${donation.reference} · ${money(donation.amount, donation.currency)} · ${status}`,
    });

    const project = donation.project_id
      ? await db.entities.Project.get(donation.project_id).catch(() => null)
      : null;
    const projectName = project?.title || "General foundation fund";
    const firstName = String(donation.donor_name || "friend").split(" ")[0];

    if (status === "completed") {
      await notifyUser(db, {
        userId: donation.user_id,
        toEmail: donation.donor_email,
        title: "Donation confirmed",
        message: `Your gift of ${money(donation.amount, donation.currency)} to ${projectName} has been verified. Receipt ${patch.receipt_number || donation.receipt_number}.`,
        type: "donation",
        link: "/portal/donations",
        mail: {
          template: "donation_receipt",
          subject: `Your GPHF receipt · ${patch.receipt_number || donation.receipt_number}`,
          heading: "Your donation is confirmed",
          intro: `Thank you, ${firstName}. We have verified your gift and your official receipt is below.`,
          rows: [
            { label: "Receipt number", value: patch.receipt_number || donation.receipt_number || "—" },
            { label: "Amount", value: money(donation.amount, donation.currency) },
            { label: "Project", value: projectName },
            { label: "Payment method", value: donation.payment_method === "card" ? "Card" : "Bank transfer" },
          ],
          ctaLabel: "View my donations",
          ctaUrl: `${BRAND.site}/portal/donations`,
          note: "Keep this email for your records. Your receipt is also available to download from your portal.",
          relatedId: donation.id,
        },
      });
    } else if (status === "failed") {
      await notifyUser(db, {
        userId: donation.user_id,
        toEmail: donation.donor_email,
        title: "Payment could not be completed",
        message: `Your donation of ${money(donation.amount, donation.currency)} could not be confirmed.`,
        type: "donation",
        link: "/portal/donations",
        mail: {
          template: "payment_failed",
          subject: "Your GPHF donation payment was not completed",
          heading: "We could not confirm your payment",
          intro: `Hello ${firstName}, the payment for your donation could not be confirmed by our team. No money has been recorded against your pledge.`,
          rows: [
            { label: "Reference", value: donation.reference || "—" },
            { label: "Amount", value: money(donation.amount, donation.currency) },
            { label: "Project", value: projectName },
          ],
          ctaLabel: "Review my donations",
          ctaUrl: `${BRAND.site}/portal/donations`,
          note: "If you believe you already paid, reply to support@gphf.pk with your transfer confirmation and we will trace it.",
          relatedId: donation.id,
        },
      });
    } else if (status === "refunded") {
      await notifyUser(db, {
        userId: donation.user_id,
        toEmail: donation.donor_email,
        title: "Donation refunded",
        message: `Your donation of ${money(donation.amount, donation.currency)} to ${projectName} has been marked refunded.`,
        type: "donation",
        link: "/portal/transactions",
        mail: {
          template: "donation_refund",
          subject: "Your GPHF donation has been refunded",
          heading: "Your donation has been refunded",
          intro: `Hello ${firstName}, we have recorded a refund for your donation.`,
          rows: [
            { label: "Reference", value: donation.reference || "—" },
            { label: "Amount", value: money(donation.amount, donation.currency) },
            { label: "Project", value: projectName },
          ],
          ctaLabel: "View my transactions",
          ctaUrl: `${BRAND.site}/portal/transactions`,
          relatedId: donation.id,
        },
      });
    }

    return { ok: true, donation: updated };
  });

export const updateProjectStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "projects");
    const db = context.getBase44().asServiceRole;
    const id = String(data?.id || "");
    const status = String(data?.status || "");
    if (!["draft", "upcoming", "active", "paused", "completed", "closed"].includes(status)) {
      throw Object.assign(new Error("Invalid project status"), { status: 400 });
    }

    const project = await db.entities.Project.get(id);
    const updated = await db.entities.Project.update(id, { status });
    await writeAudit(db, {
      actor: context.user,
      action: `project.status.${status}`,
      entity: "Project",
      recordId: id,
      details: `${project.title} → ${status}`,
    });

    if (["completed", "closed"].includes(status)) {
      const donations = list(
        await db.entities.Donation.filter({ project_id: id, status: "completed" }, { limit: 500 })
      );
      const recipients = new Map();
      donations.forEach((donation) => {
        const key = donation.user_id || lower(donation.donor_email);
        if (key) recipients.set(key, donation);
      });
      for (const donation of recipients.values()) {
        await notifyUser(db, {
          userId: donation.user_id,
          toEmail: donation.donor_email,
          title: "Project completed",
          message: `${project.title} has been marked ${status} by the GPHF team. Thank you for making it possible.`,
          type: "project",
          link: "/portal/projects/completed",
          mail: {
            template: "project_completed",
            subject: `${project.title} has been completed`,
            heading: `${project.title} is complete`,
            intro: `Hello ${String(donation.donor_name || "friend").split(" ")[0]}, the project you supported has been marked ${status}. Thank you for standing with the community it served.`,
            rows: [
              { label: "Project", value: project.title },
              { label: "Location", value: project.location || "—" },
              { label: "Your support", value: money(donation.amount, donation.currency) },
            ],
            ctaLabel: "See my supported projects",
            ctaUrl: `${BRAND.site}/portal/projects/completed`,
            relatedId: id,
          },
        });
      }
    }

    return { ok: true, project: updated };
  });

export const setProjectPublish = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "projects");
    const db = context.getBase44().asServiceRole;
    const id = String(data?.id || "");
    const publish = Boolean(data?.is_published);
    const updated = await db.entities.Project.update(id, { is_published: publish });
    await writeAudit(db, {
      actor: context.user,
      action: publish ? "project.published" : "project.unpublished",
      entity: "Project",
      recordId: id,
      details: updated.title || "",
    });
    return { ok: true, project: updated };
  });

export const createProjectUpdate = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertCapability(context, "projects");
    const db = context.getBase44().asServiceRole;
    const projectId = String(data?.project_id || "");
    const title = String(data?.title || "").trim();
    const body = String(data?.body || "").trim();
    if (!projectId || title.length < 3) {
      throw Object.assign(new Error("Add a project and an update title"), { status: 400 });
    }

    const project = await db.entities.Project.get(projectId);
    const update = await db.entities.ProjectUpdate.create({
      project_id: projectId,
      title,
      body,
      image_url: String(data?.image_url || ""),
      author: context.user.full_name || context.user.email || "GPHF team",
      is_published: true,
    });
    await writeAudit(db, {
      actor: context.user,
      action: "project.update_published",
      entity: "Project",
      recordId: projectId,
      details: title,
    });

    const donations = list(
      await db.entities.Donation.filter({ project_id: projectId, status: "completed" }, { limit: 500 })
    );
    const recipients = new Map();
    donations.forEach((donation) => {
      const key = donation.user_id || lower(donation.donor_email);
      if (key) recipients.set(key, donation);
    });
    for (const donation of recipients.values()) {
      await notifyUser(db, {
        userId: donation.user_id,
        toEmail: donation.donor_email,
        title: `Update: ${project.title}`,
        message: title,
        type: "project",
        link: `/portal/projects`,
        mail: {
          template: "project_update",
          subject: `${project.title}: ${title}`,
          heading: title,
          intro: `Hello ${String(donation.donor_name || "friend").split(" ")[0]}, here is the latest from ${project.title}.`,
          rows: [{ label: "Project", value: project.title }, { label: "Update", value: title }],
          ctaLabel: "Read in my portal",
          ctaUrl: `${BRAND.site}/portal/projects`,
          note: body.slice(0, 400),
          relatedId: projectId,
        },
      });
    }

    return { ok: true, update };
  });

export const getDonorDetail = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = context.getBase44().asServiceRole;
    const email = lower(data?.email);
    if (!email) return { donations: [], projects: [] };

    const [donationRes, projectRes] = await Promise.all([
      db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 }),
      db.entities.Project.filter({}, { limit: 300 }),
    ]);
    const projects = list(projectRes).reduce((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
    const donations = list(donationRes)
      .filter((donation) => lower(donation.donor_email) === email)
      .map((donation) => ({
        id: donation.id,
        reference: donation.reference,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        created_date: donation.created_date,
        receipt_number: donation.receipt_number || "",
        project_title: projects[donation.project_id]?.title || "General foundation fund",
      }));

    const supported = Object.values(
      donations
        .filter((donation) => donation.status === "completed")
        .reduce((acc, donation) => {
          const project = projects[Object.keys(projects).find((id) => projects[id].title === donation.project_title)];
          if (!project) return acc;
          acc[project.id] = acc[project.id] || {
            id: project.id,
            title: project.title,
            status: project.status,
            amount: 0,
            currency: donation.currency,
          };
          acc[project.id].amount += Number(donation.amount) || 0;
          return acc;
        }, {})
    );

    return { donations, projects: supported };
  });