// Provider webhook verification. A webhook is only trusted when its signature
// matches the gateway's stored webhook secret, the amount and currency match the
// pledge, and the event has not already been processed.
import { openCredentials } from "@/lib/payments/vault.server";
import { hmacHex } from "@/lib/payments/gateway.server";
import { logPaymentEvent, settlePayment, failPayment } from "@/lib/payments/settle.server";

const first = (response) => (Array.isArray(response) ? response : response?.items ?? [])[0] || null;

const pick = (payload, paths) => {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), payload);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const PAID = ["paid", "success", "successful", "completed", "captured", "approved", "settled", "00", "1", "true"];
const FAILED = ["failed", "declined", "cancelled", "canceled", "rejected", "error", "void", "expired"];

const normaliseStatus = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  if (PAID.includes(text)) return "paid";
  if (FAILED.includes(text)) return "failed";
  return "unknown";
};

function sameValue(a, b) {
  if (!a || !b) return false;
  const left = String(a).toLowerCase();
  const right = String(b).toLowerCase();
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export async function handleGatewayWebhook({ db, providerKey, request }) {
  const raw = await request.text();
  const gateway = first(await db.entities.PaymentGateway.filter({ provider: providerKey }, { limit: 1 }));
  if (!gateway) return { status: 404, body: { error: "Unknown gateway" } };

  const credential = first(await db.entities.GatewayCredential.filter({ gateway_id: gateway.id }, { limit: 1 }));
  if (!credential) return { status: 400, body: { error: "Gateway is not configured" } };

  const credentials = await openCredentials(credential.cipher).catch(() => ({}));
  if (!credentials.webhook_secret) {
    return { status: 400, body: { error: "No webhook secret configured" } };
  }

  const url = new URL(request.url);
  const signature =
    request.headers.get("x-gphf-signature") ||
    request.headers.get("x-sfpy-signature") ||
    request.headers.get("x-payfast-signature") ||
    request.headers.get("x-signature") ||
    url.searchParams.get("signature") ||
    "";

  const expected = await hmacHex(credentials.webhook_secret, raw);
  if (!signature || !sameValue(String(signature).replace(/^sha256=/i, ""), expected)) {
    await logPaymentEvent(db, {
      provider: providerKey,
      gatewayId: gateway.id,
      type: "webhook_rejected",
      message: "Signature verification failed",
    });
    return { status: 401, body: { error: "Invalid signature" } };
  }

  let payload = {};
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return { status: 400, body: { error: "Invalid JSON body" } };
  }

  const reference = pick(payload, [
    "order_reference",
    "metadata.order_id",
    "order_id",
    "BASKET_ID",
    "basket_id",
    "reference",
    "merchant_reference",
  ]);
  const status = normaliseStatus(
    pick(payload, ["status", "payment_status", "order_status", "transaction_status", "PROCCODE", "response_code"])
  );
  const amount = pick(payload, ["amount", "transaction_amount", "TXNAMT", "txnamt", "order_amount", "total"]);
  const currency = pick(payload, ["currency", "currency_code", "CURRENCY_CODE", "order_currency"]);
  const providerRef = String(
    pick(payload, ["transaction_id", "TXNREFNO", "tracker", "payment_id", "provider_reference", "id"]) || ""
  );
  const eventId = String(
    pick(payload, ["event_id", "notification_id", "transaction_id", "TXNREFNO", "tracker", "id"]) || `${reference}-${status}`
  );

  await logPaymentEvent(db, {
    provider: providerKey,
    gatewayId: gateway.id,
    type: "webhook_received",
    message: `Event ${eventId} · status ${status}`,
    providerEventId: eventId,
    amount: Number(amount) || 0,
    currency: currency || "",
  });

  if (!reference) return { status: 400, body: { error: "Missing donation reference" } };

  const previous = first(
    await db.entities.PaymentEvent.filter(
      { provider_event_id: eventId, type: "payment_settled" },
      { limit: 1 }
    )
  );
  if (previous) return { status: 200, body: { ok: true, duplicate: true } };

  const donation = first(await db.entities.Donation.filter({ reference: String(reference) }, { limit: 1 }));
  if (!donation) return { status: 404, body: { error: "Donation not found" } };

  if (donation.status === "completed") return { status: 200, body: { ok: true, duplicate: true } };

  const expectedAmount = Number(donation.amount) || 0;
  const reported = Number(amount);
  const amountMatches =
    Number.isFinite(reported) &&
    (Math.abs(reported - expectedAmount) < 0.01 || Math.abs(reported / 100 - expectedAmount) < 0.01);
  const currencyMatches = currency ? String(currency).toUpperCase() === String(donation.currency).toUpperCase() : true;

  if (!amountMatches || !currencyMatches) {
    await logPaymentEvent(db, {
      provider: providerKey,
      gatewayId: gateway.id,
      type: "webhook_rejected",
      message: `Amount or currency mismatch for ${donation.reference} (reported ${amount} ${currency || ""}, expected ${expectedAmount} ${donation.currency})`,
      recordId: donation.id,
      providerEventId: eventId,
      amount: reported || 0,
      currency: currency || "",
    });
    return { status: 409, body: { error: "Amount or currency does not match the pledge" } };
  }

  if (status === "paid") {
    await settlePayment(db, {
      donation,
      provider: providerKey,
      gatewayId: gateway.id,
      providerRef,
      actorEmail: "",
    });
    return { status: 200, body: { ok: true } };
  }

  if (status === "failed") {
    await failPayment(db, {
      donation,
      provider: providerKey,
      gatewayId: gateway.id,
      reason: "the payment provider reported that the payment did not complete",
    });
    return { status: 200, body: { ok: true } };
  }

  return { status: 202, body: { ok: true, ignored: "status not final" } };
}