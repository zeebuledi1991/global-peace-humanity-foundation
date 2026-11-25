import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const honeypot = (value) => typeof value === "string" && value.trim().length > 0;

function reference(prefix) {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${prefix}-${id}`;
}

export const submitDonation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      donor_name: z.string().trim().min(2).max(120),
      donor_email: z.string().trim().regex(EMAIL).max(160),
      donor_phone: z.string().trim().max(40).optional(),
      country: z.string().trim().min(2).max(80),
      amount: z.coerce.number().min(1).max(5000000),
      currency: z.enum(["USD", "PKR", "GBP", "EUR", "CAD", "AUD", "AED"]),
      frequency: z.enum(["one_time", "monthly"]),
      is_anonymous: z.boolean().optional(),
      dedication: z.string().trim().max(400).optional(),
      campaign_id: z.string().trim().max(80).optional(),
      project_id: z.string().trim().max(80).optional(),
      payment_method: z.enum(["bank_transfer", "card"]),
      website: z.string().max(200).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    if (honeypot(data.website)) return { reference: null, spam: true };
    const db = context.getBase44().asServiceRole;
    const donor = await context
      .getBase44()
      .auth.me()
      .catch(() => null);
    const linked =
      donor && String(donor.email || "").toLowerCase() === data.donor_email.toLowerCase() ? donor.id : "";
    const record = await db.entities.Donation.create({
      reference: reference("GPHF"),
      donor_name: data.donor_name,
      donor_email: data.donor_email,
      user_id: linked,
      donor_type: linked ? "registered" : "guest",
      donor_phone: data.donor_phone || "",
      country: data.country,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      is_anonymous: Boolean(data.is_anonymous),
      dedication: data.dedication || "",
      campaign_id: data.campaign_id || "",
      project_id: data.project_id || "",
      payment_method: data.payment_method,
      status: "pending",
    });
    return { reference: record.reference, spam: false };
  });

export const getDonationReceipt = createServerFn({ method: "GET" })
  .inputValidator(z.object({ reference: z.string().trim().min(4).max(40) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const res = await db.entities.Donation.filter({ reference: data.reference }, { limit: 1 });
    const donation = (Array.isArray(res) ? res : res?.items ?? [])[0];
    if (!donation) return null;
    return {
      reference: donation.reference,
      amount: donation.amount,
      currency: donation.currency,
      frequency: donation.frequency,
      status: donation.status,
      payment_method: donation.payment_method,
      receipt_number: donation.receipt_number || "",
      verified_date: donation.verified_date || "",
      created_date: donation.created_date,
      donor_display: donation.is_anonymous ? "Anonymous donor" : donation.donor_name,
      dedication: donation.dedication || "",
      campaign_id: donation.campaign_id || "",
      project_id: donation.project_id || "",
    };
  });

export const submitVolunteerApplication = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      full_name: z.string().trim().min(2).max(120),
      email: z.string().trim().regex(EMAIL).max(160),
      phone: z.string().trim().max(40).optional(),
      country: z.string().trim().min(2).max(80),
      city: z.string().trim().max(80).optional(),
      areas_of_interest: z.array(z.string().max(80)).max(12).optional(),
      availability: z.string().trim().max(120).optional(),
      skills: z.string().trim().max(2000).optional(),
      motivation: z.string().trim().max(2000).optional(),
      website: z.string().max(200).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    if (honeypot(data.website)) return { ok: true };
    const db = context.getBase44().asServiceRole;
    await db.entities.VolunteerApplication.create({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || "",
      country: data.country,
      city: data.city || "",
      areas_of_interest: data.areas_of_interest || [],
      availability: data.availability || "",
      skills: data.skills || "",
      motivation: data.motivation || "",
      status: "new",
    });
    return { ok: true };
  });

export const submitPartnership = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      organization_name: z.string().trim().min(2).max(160),
      contact_name: z.string().trim().min(2).max(120),
      email: z.string().trim().regex(EMAIL).max(160),
      phone: z.string().trim().max(40).optional(),
      country: z.string().trim().min(2).max(80),
      partnership_type: z.enum(["corporate", "ngo", "fundraising", "project_sponsorship"]),
      message: z.string().trim().max(3000).optional(),
      website: z.string().max(200).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    if (honeypot(data.website)) return { ok: true };
    const db = context.getBase44().asServiceRole;
    await db.entities.Partnership.create({
      organization_name: data.organization_name,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone || "",
      country: data.country,
      partnership_type: data.partnership_type,
      message: data.message || "",
      status: "new",
    });
    return { ok: true };
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().regex(EMAIL).max(160),
      phone: z.string().trim().max(40).optional(),
      subject: z.string().trim().max(160).optional(),
      message: z.string().trim().min(10).max(3000),
      website: z.string().max(200).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    if (honeypot(data.website)) return { ok: true };
    const db = context.getBase44().asServiceRole;
    await db.entities.ContactMessage.create({
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      subject: data.subject || "Website enquiry",
      message: data.message,
      status: "new",
    });
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().trim().regex(EMAIL).max(160),
      website: z.string().max(200).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    if (honeypot(data.website)) return { ok: true };
    const db = context.getBase44().asServiceRole;
    const existing = await db.entities.NewsletterSubscriber.filter({ email: data.email }, { limit: 1 });
    const found = (Array.isArray(existing) ? existing : existing?.items ?? [])[0];
    if (found) {
      if (found.status !== "subscribed") {
        await db.entities.NewsletterSubscriber.update(found.id, { status: "subscribed" });
      }
      return { ok: true };
    }
    await db.entities.NewsletterSubscriber.create({
      email: data.email,
      source: "website",
      status: "subscribed",
    });
    return { ok: true };
  });