// Shared settlement logic: a donation only becomes "completed" here, after a
// provider confirmation or an authorised finance verification.
import { notifyUser, money } from "@/lib/notify";
import { BRAND } from "@/lib/mailer";
import { providerByKey } from "@/lib/payments/providers";

export const paymentLabel = (donation) => {
  const provider = providerByKey(donation.gateway_provider);
  if (provider) return provider.name;
  return donation.payment_method === "bank_transfer" ? "Bank transfer" : "Card";
};

export const receiptNumber = (donation) =>
  `GPHF-R-${new Date().getUTCFullYear()}-${String(donation.reference || "").slice(-6)}`;

export async function logPaymentEvent(db, event) {
  try {
    await db.entities.PaymentEvent.create({
      provider: event.provider || "",
      gateway_id: event.gatewayId || "",
      type: event.type,
      message: String(event.message || "").slice(0, 500),
      actor_email: event.actorEmail || "",
      record_id: event.recordId || "",
      provider_event_id: event.providerEventId || "",
      amount: Number(event.amount) || 0,
      currency: event.currency || "",
    });
  } catch {
    // Event logging is secondary to the payment decision itself.
  }
}

async function projectName(db, donation) {
  if (!donation.project_id) return "General foundation fund";
  const project = await db.entities.Project.get(donation.project_id).catch(() => null);
  return project?.title || "General foundation fund";
}

export async function settlePayment(db, { donation, provider, gatewayId, providerRef, actorEmail }) {
  if (donation.status === "completed") return { ok: true, duplicate: true, donation };
  const project = await projectName(db, donation);
  const receipt = donation.receipt_number || receiptNumber(donation);
  const updated = await db.entities.Donation.update(donation.id, {
    status: "completed",
    receipt_number: receipt,
    payment_reference: providerRef || donation.payment_reference || "",
    verified_date: new Date().toISOString(),
    verified_by: actorEmail || `verified by ${provider || "payment provider"}`,
  });

  await notifyUser(db, {
    userId: donation.user_id,
    toEmail: donation.donor_email,
    title: "Donation confirmed",
    message: `Your gift of ${money(donation.amount, donation.currency)} to ${project} has been verified. Receipt ${receipt}.`,
    type: "donation",
    link: "/portal/donations",
    mail: {
      template: "donation_receipt",
      subject: `Your GPHF receipt · ${receipt}`,
      heading: "Your donation is confirmed",
      intro: `Thank you, ${String(donation.donor_name || "friend").split(" ")[0]}. Your payment was verified and your official receipt is below.`,
      rows: [
        { label: "Receipt number", value: receipt },
        { label: "Amount", value: money(donation.amount, donation.currency) },
        { label: "Project", value: project },
        { label: "Payment method", value: paymentLabel({ ...donation, gateway_provider: provider || donation.gateway_provider }) },
      ],
      ctaLabel: "View my donations",
      ctaUrl: `${BRAND.site}/portal/donations`,
      note: "Keep this email for your records. Your receipt is also available to download from your portal.",
      relatedId: donation.id,
    },
  });

  await logPaymentEvent(db, {
    provider,
    gatewayId,
    type: "payment_settled",
    message: `${donation.reference} settled · ${money(donation.amount, donation.currency)}`,
    recordId: donation.id,
    amount: donation.amount,
    currency: donation.currency,
  });

  return { ok: true, donation: updated };
}

export async function failPayment(db, { donation, provider, gatewayId, reason, actorEmail }) {
  if (["completed", "failed", "refunded"].includes(donation.status)) {
    return { ok: true, duplicate: true, donation };
  }
  const project = await projectName(db, donation);
  const updated = await db.entities.Donation.update(donation.id, {
    status: "failed",
    admin_notes: reason ? String(reason).slice(0, 400) : donation.admin_notes || "",
  });

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
      intro: `Hello ${String(donation.donor_name || "friend").split(" ")[0]}, ${reason || "the payment provider did not confirm your donation"}. No money has been recorded against your pledge.`,
      rows: [
        { label: "Reference", value: donation.reference || "—" },
        { label: "Amount", value: money(donation.amount, donation.currency) },
        { label: "Project", value: project },
      ],
      ctaLabel: "Review my donations",
      ctaUrl: `${BRAND.site}/portal/donations`,
      note: `If you believe you already paid, write to ${BRAND.support} with your payment confirmation and we will trace it.`,
      relatedId: donation.id,
    },
  });

  await logPaymentEvent(db, {
    provider,
    gatewayId,
    type: "payment_failed",
    message: `${donation.reference} not completed · ${reason || "provider reported failure"}`,
    actorEmail,
    recordId: donation.id,
    amount: donation.amount,
    currency: donation.currency,
  });

  return { ok: true, donation: updated };
}