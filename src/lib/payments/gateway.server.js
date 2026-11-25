// Real provider calls. Nothing here fabricates a payment: every function talks
// to the provider's documented endpoint and surfaces the provider's own answer.
import { providerByKey } from "@/lib/payments/providers";

const encoder = new TextEncoder();

const asForm = (fields) => new URLSearchParams(fields).toString();

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const minorUnits = (amount) => Math.round(Number(amount) * 100);

async function safepayCheckout({ provider, environment, credentials, donation }) {
  const host = provider.hosts[environment] || provider.hosts.sandbox;
  const response = await fetch(`${host}/order/v1/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client: credentials.api_key,
      amount: minorUnits(donation.amount),
      currency: donation.currency,
      environment: environment === "live" ? "production" : "sandbox",
    }),
  });
  const json = await readJson(response);
  if (!response.ok || !json.token) {
    throw new Error(`Safepay rejected the session request (HTTP ${response.status})${json.message ? `: ${json.message}` : ""}`);
  }
  return { url: `${host}/embedded/?tbt=${encodeURIComponent(json.token)}`, method: "GET", fields: {} };
}

async function payfastCheckout({ provider, environment, credentials, donation, returnUrl }) {
  const host = provider.hosts[environment] || provider.hosts.sandbox;
  const origin = new URL(returnUrl).origin;
  const tokenResponse = await fetch(`${host}/Ecommerce/api/Transaction/GetAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: asForm({
      MERCHANT_ID: credentials.merchant_id,
      SECURED_KEY: credentials.secured_key,
      BASKET_ID: donation.reference,
      TXNAMT: Number(donation.amount).toFixed(2),
      CURRENCY_CODE: donation.currency,
    }),
  });
  const tokenJson = await readJson(tokenResponse);
  const token = tokenJson.ACCESS_TOKEN || tokenJson.access_token;
  if (!tokenResponse.ok || !token) {
    throw new Error(`PayFast rejected the token request (HTTP ${tokenResponse.status})${tokenJson.ERROR ? `: ${tokenJson.ERROR}` : ""}`);
  }
  return {
    url: `${host}/Ecommerce/api/Transaction/PostTransaction`,
    method: "POST",
    fields: {
      MERCHANT_ID: credentials.merchant_id,
      MERCHANT_NAME: credentials.merchant_name || "GPHF",
      TOKEN: token,
      PROCCODE: "00",
      TXNAMT: Number(donation.amount).toFixed(2),
      CUSTOMER_MOBILE_NO: donation.donor_phone || "",
      CUSTOMER_EMAIL_ADDRESS: donation.donor_email,
      TXNDESC: `Donation ${donation.reference}`,
      BASKET_ID: donation.reference,
      ORDER_DATE: new Date().toISOString().slice(0, 19).replace("T", " "),
      SUCCESS_URL: `${origin}/donation-confirmation?ref=${encodeURIComponent(donation.reference)}`,
      FAILURE_URL: `${origin}/donation-confirmation?ref=${encodeURIComponent(donation.reference)}`,
      CHECKOUT_URL: `${origin}/api/webhooks/payfast`,
    },
  };
}

async function bankHostedCheckout({ provider, credentials, donation, returnUrl }) {
  if (!credentials.checkout_endpoint) {
    throw new Error(
      `${provider.name} requires the hosted checkout endpoint from your merchant onboarding pack. Add it in the gateway configuration.`
    );
  }
  const origin = new URL(returnUrl).origin;
  const fields = {
    merchant_id: credentials.merchant_id,
    merchant_account_id: credentials.merchant_account_id,
    order_reference: donation.reference,
    amount: Number(donation.amount).toFixed(2),
    currency: donation.currency,
    description: `GPHF donation ${donation.reference}`,
    success_url: `${origin}/donation-confirmation?ref=${encodeURIComponent(donation.reference)}`,
    failure_url: `${origin}/donation-confirmation?ref=${encodeURIComponent(donation.reference)}`,
    callback_url: `${origin}/api/webhooks/${provider.key.replace(/_/g, "-")}`,
  };
  if (credentials.api_secret) {
    fields.signature = await hmacHex(
      credentials.api_secret,
      `${donation.reference}|${fields.amount}|${donation.currency}`
    );
  }
  return { url: credentials.checkout_endpoint, method: "POST", fields };
}

export async function initiatePayment({ providerKey, environment, credentials, donation, returnUrl }) {
  const provider = providerByKey(providerKey);
  if (!provider) throw new Error("Unknown payment provider");
  if (providerKey === "safepay") return safepayCheckout({ provider, environment, credentials, donation });
  if (providerKey === "payfast") return payfastCheckout({ provider, environment, credentials, donation, returnUrl });
  return bankHostedCheckout({ provider, credentials, donation, returnUrl });
}

/**
 * Real connectivity check against the provider. Returns the provider's own
 * response so the administrator can see exactly what happened.
 */
export async function testProviderConnection({ providerKey, environment, credentials }) {
  const provider = providerByKey(providerKey);
  if (!provider) return { ok: false, message: "Unknown payment provider." };

  try {
    if (providerKey === "safepay") {
      const host = provider.hosts[environment] || provider.hosts.sandbox;
      const response = await fetch(`${host}/order/v1/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: credentials.api_key, amount: 100, currency: "PKR", environment: environment === "live" ? "production" : "sandbox" }),
      });
      const json = await readJson(response);
      if (response.ok && json.token) return { ok: true, message: `Safepay accepted the credentials (HTTP ${response.status}).` };
      return { ok: false, message: `Safepay rejected the credentials (HTTP ${response.status})${json.message ? `: ${json.message}` : ""}` };
    }
    if (providerKey === "payfast") {
      const host = provider.hosts[environment] || provider.hosts.sandbox;
      const response = await fetch(`${host}/Ecommerce/api/Transaction/GetAccessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: asForm({ MERCHANT_ID: credentials.merchant_id, SECURED_KEY: credentials.secured_key, BASKET_ID: "GPHF-CONNECTION-TEST", TXNAMT: "100.00", CURRENCY_CODE: "PKR" }),
      });
      const json = await readJson(response);
      const token = json.ACCESS_TOKEN || json.access_token;
      if (response.ok && token) return { ok: true, message: `PayFast issued an access token (HTTP ${response.status}).` };
      return { ok: false, message: `PayFast did not issue a token (HTTP ${response.status})${json.ERROR ? `: ${json.ERROR}` : ""}` };
    }
    if (!credentials.checkout_endpoint) {
      return { ok: false, message: `${provider.name} needs the hosted checkout endpoint issued during merchant onboarding.` };
    }
    const response = await fetch(credentials.checkout_endpoint, { method: "GET" });
    if (response.status < 500) {
      return {
        ok: true,
        message: `${provider.name} endpoint reachable (HTTP ${response.status}). Final approval still depends on the bank enabling your merchant account.`,
      };
    }
    return { ok: false, message: `${provider.name} endpoint returned HTTP ${response.status}.` };
  } catch (error) {
    return { ok: false, message: String(error?.message || "Connection failed").slice(0, 300) };
  }
}