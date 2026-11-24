import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);

function assertAdmin(user) {
  if (user?.role !== "admin") {
    throw Object.assign(new Error("Forbidden"), { status: 403, code: "FORBIDDEN" });
  }
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    const db = context.getBase44().asServiceRole;

    const [
      completedDonations,
      pendingCount,
      failedCount,
      volunteers,
      partners,
      messages,
      projects,
      news,
      subscribers,
      documents,
    ] = await Promise.all([
      db.entities.Donation.filter({ status: "completed" }, { limit: 500 }),
      db.entities.Donation.count({ status: "pending" }),
      db.entities.Donation.count({ status: "failed" }),
      db.entities.VolunteerApplication.count({ status: "new" }),
      db.entities.Partnership.count({ status: "new" }),
      db.entities.ContactMessage.count({ status: "new" }),
      db.entities.Project.count({}),
      db.entities.NewsPost.count({ is_published: true }),
      db.entities.NewsletterSubscriber.count({ status: "subscribed" }),
      db.entities.Document.count({ is_published: true }),
    ]);

    const verified = list(completedDonations);
    const totals = verified.reduce((acc, donation) => {
      const currency = donation.currency || "USD";
      acc[currency] = (acc[currency] || 0) + (Number(donation.amount) || 0);
      return acc;
    }, {});

    const recent = list(
      await db.entities.Donation.list({ sort: "-created_date", limit: 8 })
    );

    const recentMessages = list(
      await db.entities.ContactMessage.list({ sort: "-created_date", limit: 5 })
    );

    return {
      totals,
      verifiedCount: verified.length,
      pendingCount,
      failedCount,
      volunteers,
      partners,
      messages,
      projects,
      news,
      subscribers,
      documents,
      recent,
      recentMessages,
    };
  });

export const getAdminDonations = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const db = context.getBase44().asServiceRole;
    const query = data?.status ? { status: data.status } : {};
    const res = await db.entities.Donation.filter(query, { sort: "-created_date", limit: 200 });
    return list(res);
  });

export const updateDonationStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const db = context.getBase44().asServiceRole;
    const status = String(data?.status || "");
    if (!["pending", "completed", "failed", "cancelled"].includes(status)) {
      throw Object.assign(new Error("Invalid status"), { status: 400 });
    }
    const donation = await db.entities.Donation.get(String(data?.id || ""));
    const patch = { status };
    if (status === "completed" && !donation.receipt_number) {
      const year = new Date().getUTCFullYear();
      patch.receipt_number = `GPHF-R-${year}-${String(donation.reference || "").slice(-6)}`;
      patch.verified_date = new Date().toISOString();
    }
    if (status !== "completed") {
      patch.verified_date = "";
    }
    const updated = await db.entities.Donation.update(donation.id, patch);
    return { ok: true, donation: updated };
  });