import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { requireCapability } from "@/lib/admin-guard";
import { writeAudit, notifyUser, money } from "@/lib/notify";
import { BRAND } from "@/lib/mailer";
import { PROVIDERS, providerByKey } from "@/lib/payments/providers";

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);
const first = (res) => list(res)[0] || null;
const lower = (value) => String(value ?? "").trim().toLowerCase();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Server-only helpers (credential vault, provider calls, settlement) are loaded
// inside the handlers so they never enter the browser bundle.
async function loadPayments() {
  const [vault, gateway, settle] = await Promise.all([
    import("@/lib/payments/vault.server"),
    import("@/lib/payments/gateway.server"),
    import("@/lib/payments/settle.server"),
  ]);
  return { ...vault, ...gateway, ...settle };
}

const paymentLabel = (donation) => {
  const provider = providerByKey(donation.gateway_provider);
  if (provider) return provider.name;
  return donation.payment_method === "bank_transfer" ? "Bank transfer" : "Card";
};

// Only a Super Admin, Administrator or Finance Manager may touch payment
// configuration, credentials or financial verification. Project managers cannot.
// The caller's current record is re-read on every request by the guard.
const assertPayments = (context) => requireCapability(context, "finance");

const reference = (prefix = "GPHF") =>
  `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

const webhookUrlFor = (providerKey) => `${BRAND.site}/api/webhooks/${providerKey.replace(/_/g, "-")}`;

async function ensureGateways(db) {
  const existing = list(await db.entities.PaymentGateway.filter({}, { limit: 50 }));
  const byProvider = new Map(existing.map((gateway) => [gateway.provider, gateway]));
  for (const [index, provider] of PROVIDERS.entries()) {
    if (byProvider.has(provider.key)) continue;
    const row = await db.entities.PaymentGateway.create({
      provider: provider.key,
      display_name: provider.name,
      environment: "sandbox",
      is_enabled: false,
      connection_status: "not_configured",
      supported_methods: provider.methods,
      currencies: provider.currencies,
      display_order: index + 1,
    });
    byProvider.set(provider.key, row);
  }
  return [...byProvider.values()].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

/* ------------------------------------------------------------------ admin */

export const listGateways = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const gateways = await ensureGateways(db);
    const credentials = list(await db.entities.GatewayCredential.filter({}, { limit: 50 }));
    const byGateway = new Map(credentials.map((credential) => [credential.gateway_id, credential]));

    return gateways.map((gateway) => {
      const provider = providerByKey(gateway.provider);
      const credential = byGateway.get(gateway.id);
      let hints = {};
      try {
        hints = credential?.hints ? JSON.parse(credential.hints) : {};
      } catch {
        hints = {};
      }
      return {
        id: gateway.id,
        provider: gateway.provider,
        name: provider?.name || gateway.display_name || gateway.provider,
        environment: gateway.environment || "sandbox",
        is_enabled: Boolean(gateway.is_enabled),
        connection_status: gateway.connection_status || "not_configured",
        last_tested_at: gateway.last_tested_at || "",
        last_test_message: gateway.last_test_message || "",
        activated_at: gateway.activated_at || "",
        configured: Boolean(credential),
        capabilities: {
          international: provider?.international || "",
          local: provider?.local || "",
          recurring: provider?.recurring || "",
        },
        supportsRecurring: Boolean(provider?.supportsRecurring),
        currencies: gateway.currencies?.length ? gateway.currencies : provider?.currencies || [],
        methods: gateway.supported_methods?.length ? gateway.supported_methods : provider?.methods || [],
        fields: (provider?.fields || []).map((field) => ({
          ...field,
          hint: hints[field.key] || "",
          saved: Boolean(hints[field.key]),
        })),
        note: provider?.note || "",
        webhook_url: webhookUrlFor(gateway.provider),
      };
    });
  });

export const saveGatewayCredentials = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const rt = await loadPayments();
    const db = context.getBase44().asServiceRole;
    const gateway = await db.entities.PaymentGateway.get(String(data?.id || ""));
    const provider = providerByKey(gateway.provider);
    if (!provider) throw Object.assign(new Error("Unknown payment provider"), { status: 400 });

    const environment = data?.environment === "live" ? "live" : "sandbox";
    const incoming = data?.values && typeof data.values === "object" ? data.values : {};

    const existing = first(await db.entities.GatewayCredential.filter({ gateway_id: gateway.id }, { limit: 1 }));
    const current = existing ? await rt.openCredentials(existing.cipher).catch(() => ({})) : {};
    const merged = { ...current };
    provider.fields.forEach((field) => {
      const value = String(incoming[field.key] ?? "").trim();
      if (value) merged[field.key] = value;
    });

    const missing = provider.fields.filter((field) => field.required && !merged[field.key]);
    if (missing.length) {
      throw Object.assign(
        new Error(`Add the required credentials: ${missing.map((field) => field.label).join(", ")}`),
        { status: 400 }
      );
    }

    const hints = provider.fields.reduce((acc, field) => {
      if (merged[field.key]) acc[field.key] = rt.maskValue(merged[field.key], field.secret);
      return acc;
    }, {});

    const cipher = await rt.sealCredentials(merged);
    if (existing) {
      await db.entities.GatewayCredential.update(existing.id, {
        environment,
        cipher,
        hints: JSON.stringify(hints),
        provider: gateway.provider,
        saved_by: context.user.email || "",
      });
    } else {
      await db.entities.GatewayCredential.create({
        gateway_id: gateway.id,
        provider: gateway.provider,
        environment,
        cipher,
        hints: JSON.stringify(hints),
        saved_by: context.user.email || "",
      });
    }

    await db.entities.PaymentGateway.update(gateway.id, {
      environment,
      connection_status: "configured",
      is_enabled: false,
      last_test_message: "Configuration saved. Run a connection test before activating this gateway.",
    });

    await rt.logPaymentEvent(db, {
      provider: gateway.provider,
      gatewayId: gateway.id,
      type: "config_updated",
      message: `Credentials updated for ${environment} environment`,
      actorEmail: context.user.email,
    });
    await writeAudit(db, {
      actor: context.user,
      action: "payment.gateway.configured",
      entity: "PaymentGateway",
      recordId: gateway.id,
      details: `${provider.name} · ${environment} · fields: ${provider.fields.filter((field) => merged[field.key]).map((field) => field.key).join(", ")}`,
    });

    return { ok: true };
  });

export const testGatewayConnection = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const rt = await loadPayments();
    const db = context.getBase44().asServiceRole;
    const gateway = await db.entities.PaymentGateway.get(String(data?.id || ""));
    const credential = first(await db.entities.GatewayCredential.filter({ gateway_id: gateway.id }, { limit: 1 }));
    if (!credential) {
      throw Object.assign(new Error("Save the API configuration before testing the connection"), { status: 400 });
    }
    const credentials = await rt.openCredentials(credential.cipher).catch(() => ({}));
    const result = await rt.testProviderConnection({
      providerKey: gateway.provider,
      environment: gateway.environment || "sandbox",
      credentials,
    });

    await db.entities.PaymentGateway.update(gateway.id, {
      connection_status: result.ok ? "connected" : "failed",
      last_tested_at: new Date().toISOString(),
      last_test_message: String(result.message || "").slice(0, 400),
    });
    await rt.logPaymentEvent(db, {
      provider: gateway.provider,
      gatewayId: gateway.id,
      type: "connection_tested",
      message: `${result.ok ? "Passed" : "Failed"} · ${String(result.message || "").slice(0, 300)}`,
      actorEmail: context.user.email,
    });
    await writeAudit(db, {
      actor: context.user,
      action: "payment.gateway.tested",
      entity: "PaymentGateway",
      recordId: gateway.id,
      details: `${gateway.provider} · ${result.ok ? "passed" : "failed"}`,
    });

    return result;
  });

export const setGatewayEnabled = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const rt = await loadPayments();
    const db = context.getBase44().asServiceRole;
    const gateway = await db.entities.PaymentGateway.get(String(data?.id || ""));
    const enable = Boolean(data?.enabled);

    if (enable && gateway.connection_status !== "connected") {
      throw Object.assign(new Error("Run a successful connection test before activating this gateway"), {
        status: 400,
      });
    }

    const updated = await db.entities.PaymentGateway.update(gateway.id, {
      is_enabled: enable,
      activated_at: enable ? new Date().toISOString() : gateway.activated_at || "",
      activated_by: enable ? context.user.email || "" : gateway.activated_by || "",
    });

    await rt.logPaymentEvent(db, {
      provider: gateway.provider,
      gatewayId: gateway.id,
      type: enable ? "gateway_activated" : "gateway_deactivated",
      message: enable ? "Gateway activated for checkout" : "Gateway deactivated and hidden from checkout",
      actorEmail: context.user.email,
    });
    await writeAudit(db, {
      actor: context.user,
      action: enable ? "payment.gateway.activated" : "payment.gateway.deactivated",
      entity: "PaymentGateway",
      recordId: gateway.id,
      details: gateway.provider,
    });

    return { ok: true, gateway: updated };
  });

export const listBankAccounts = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const accounts = list(await db.entities.BankAccount.filter({}, { limit: 50 }));
    return accounts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

export const saveBankAccount = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const payload = {
      bank_name: String(data?.bank_name || "").trim(),
      account_title: String(data?.account_title || "").trim(),
      account_number: String(data?.account_number || "").trim(),
      iban: String(data?.iban || "").trim(),
      swift_code: String(data?.swift_code || "").trim(),
      branch_name: String(data?.branch_name || "").trim(),
      branch_code: String(data?.branch_code || "").trim(),
      bank_address: String(data?.bank_address || "").trim(),
      currency: String(data?.currency || "PKR").trim().toUpperCase().slice(0, 8),
      instructions: String(data?.instructions || "").trim().slice(0, 2000),
      is_active: data?.is_active === undefined ? true : Boolean(data.is_active),
      display_order: Number(data?.display_order) || 0,
    };
    if (!payload.bank_name || !payload.account_title) {
      throw Object.assign(new Error("Bank name and account title are required"), { status: 400 });
    }

    const saved = data?.id
      ? await db.entities.BankAccount.update(String(data.id), payload)
      : await db.entities.BankAccount.create(payload);

    await writeAudit(db, {
      actor: context.user,
      action: data?.id ? "payment.bank_account.updated" : "payment.bank_account.created",
      entity: "BankAccount",
      recordId: saved.id,
      details: `${payload.bank_name} · ${payload.currency} · ${payload.is_active ? "active" : "inactive"}`,
    });
    return { ok: true, account: saved };
  });

export const deleteBankAccount = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const id = String(data?.id || "");
    const account = await db.entities.BankAccount.get(id);
    await db.entities.BankAccount.delete(id);
    await writeAudit(db, {
      actor: context.user,
      action: "payment.bank_account.deleted",
      entity: "BankAccount",
      recordId: id,
      details: account?.bank_name || "",
    });
    return { ok: true };
  });

export const getPaymentOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const [donationRes, gateways, banks, events] = await Promise.all([
      db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 }),
      ensureGateways(db),
      db.entities.BankAccount.filter({}, { limit: 50 }),
      db.entities.PaymentEvent.filter({}, { sort: "-created_date", limit: 8 }),
    ]);
    const donations = list(donationRes);
    const settled = donations.filter((donation) => donation.status === "completed");
    const totals = settled.reduce((acc, donation) => {
      const code = donation.currency || "USD";
      acc[code] = (acc[code] || 0) + (Number(donation.amount) || 0);
      return acc;
    }, {});

    return {
      totals,
      settledCount: settled.length,
      pendingCount: donations.filter((donation) => ["pending", "processing"].includes(donation.status)).length,
      bankPending: donations.filter(
        (donation) => donation.payment_method === "bank_transfer" && ["pending", "processing"].includes(donation.status)
      ).length,
      failedCount: donations.filter((donation) => ["failed", "cancelled"].includes(donation.status)).length,
      refundedCount: donations.filter((donation) => donation.status === "refunded").length,
      activeGateways: gateways.filter((gateway) => gateway.is_enabled).length,
      configuredGateways: gateways.filter((gateway) => gateway.connection_status === "connected").length,
      activeBanks: list(banks).filter((account) => account.is_active).length,
      gateways: gateways.map((gateway) => ({
        id: gateway.id,
        provider: gateway.provider,
        name: providerByKey(gateway.provider)?.name || gateway.provider,
        is_enabled: Boolean(gateway.is_enabled),
        connection_status: gateway.connection_status || "not_configured",
      })),
      events: list(events),
    };
  });

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const [donationRes, projectRes] = await Promise.all([
      db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 }),
      db.entities.Project.filter({}, { limit: 300 }),
    ]);
    const projects = list(projectRes).reduce((acc, project) => {
      acc[project.id] = project.title;
      return acc;
    }, {});

    const gateway = String(data?.gateway || "");
    const status = String(data?.status || "");
    const currency = String(data?.currency || "");
    const donorType = String(data?.donorType || "");
    const search = lower(data?.search);
    const from = data?.from ? new Date(data.from) : null;
    const to = data?.to ? new Date(data.to) : null;

    const all = list(donationRes);
    const rows = all
      .map((donation) => ({
        id: donation.id,
        reference: donation.reference,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        donor_type: donation.user_id ? "registered" : "guest",
        gateway_provider:
          donation.gateway_provider || (donation.payment_method === "bank_transfer" ? "bank_transfer" : ""),
        gateway_label: paymentLabel(donation),
        project_title: projects[donation.project_id] || "General foundation fund",
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        created_date: donation.created_date,
        payment_reference: donation.payment_reference || donation.transfer_reference || "",
        receipt_number: donation.receipt_number || "",
        frequency: donation.frequency,
      }))
      .filter((row) => (gateway ? row.gateway_provider === gateway : true))
      .filter((row) => (status ? row.status === status : true))
      .filter((row) => (currency ? row.currency === currency : true))
      .filter((row) => (donorType ? row.donor_type === donorType : true))
      .filter((row) => {
        if (!from && !to) return true;
        const date = new Date(row.created_date);
        if (Number.isNaN(date.getTime())) return false;
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      })
      .filter((row) => {
        if (!search) return true;
        return [row.reference, row.donor_name, row.donor_email, row.payment_reference, row.receipt_number].some(
          (value) => lower(value).includes(search)
        );
      });

    return {
      rows,
      totals: rows
        .filter((row) => row.status === "completed")
        .reduce((acc, row) => {
          acc[row.currency] = (acc[row.currency] || 0) + (Number(row.amount) || 0);
          return acc;
        }, {}),
      gateways: [...new Set(all.map((donation) => donation.gateway_provider || "bank_transfer"))]
        .filter(Boolean)
        .map((key) => ({ key, label: paymentLabel({ gateway_provider: key, payment_method: key }) })),
    };
  });

export const getPaymentReports = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const range = String(data?.range || "30d");
    const start = new Date();
    if (range === "today") start.setUTCHours(0, 0, 0, 0);
    else if (range === "7d") start.setUTCDate(start.getUTCDate() - 7);
    else if (range === "year") {
      start.setUTCMonth(0);
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
    } else if (range === "all") start.setTime(0);
    else start.setUTCDate(start.getUTCDate() - 30);

    const donations = list(await db.entities.Donation.filter({}, { sort: "-created_date", limit: 1000 })).filter(
      (donation) => new Date(donation.created_date) >= start
    );

    const settled = donations.filter((donation) => donation.status === "completed");
    const group = (rows, keyFn) => {
      const map = new Map();
      rows.forEach((row) => {
        const key = keyFn(row);
        const entry = map.get(key) || { key, count: 0, totals: {} };
        entry.count += 1;
        const code = row.currency || "USD";
        entry.totals[code] = (entry.totals[code] || 0) + (Number(row.amount) || 0);
        map.set(key, entry);
      });
      return [...map.values()].sort((a, b) => b.count - a.count);
    };

    return {
      range,
      settledCount: settled.length,
      totals: settled.reduce((acc, donation) => {
        const code = donation.currency || "USD";
        acc[code] = (acc[code] || 0) + (Number(donation.amount) || 0);
        return acc;
      }, {}),
      byGateway: group(donations, (donation) => paymentLabel(donation)),
      byStatus: group(donations, (donation) => donation.status || "pending"),
      byCurrency: group(donations, (donation) => donation.currency || "USD"),
      byDonorType: group(donations, (donation) => (donation.user_id ? "Registered donor" : "Guest donor")),
    };
  });

export const getPaymentEvents = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const events = list(await db.entities.PaymentEvent.filter({}, { sort: "-created_date", limit: 300 }));
    const search = lower(data?.search);
    const type = String(data?.type || "");
    return events
      .filter((event) => (type ? event.type === type : true))
      .filter((event) => {
        if (!search) return true;
        return [event.provider, event.message, event.actor_email, event.record_id, event.provider_event_id].some(
          (value) => lower(value).includes(search)
        );
      });
  });

export const getBankTransferQueue = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const [donationRes, projectRes, accounts] = await Promise.all([
      db.entities.Donation.filter({ payment_method: "bank_transfer" }, { sort: "-created_date", limit: 300 }),
      db.entities.Project.filter({}, { limit: 300 }),
      db.entities.BankAccount.filter({}, { limit: 50 }),
    ]);
    const projects = list(projectRes).reduce((acc, project) => {
      acc[project.id] = project.title;
      return acc;
    }, {});
    const banks = list(accounts).reduce((acc, account) => {
      acc[account.id] = `${account.bank_name} · ${account.currency}`;
      return acc;
    }, {});

    return list(donationRes).map((donation) => ({
      ...donation,
      project_title: projects[donation.project_id] || "General foundation fund",
      bank_label: banks[donation.bank_account_id] || "Bank transfer",
    }));
  });

export const getPaymentProofUrl = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const db = context.getBase44().asServiceRole;
    const donation = await db.entities.Donation.get(String(data?.id || ""));
    if (!donation.proof_file_uri) throw Object.assign(new Error("No payment proof uploaded"), { status: 404 });
    const { signed_url } = await db.integrations.Core.CreateFileSignedUrl({
      file_uri: donation.proof_file_uri,
      expires_in: 600,
    });
    return { url: signed_url };
  });

export const verifyBankTransfer = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .inputValidator((data) => data)
  .handler(async ({ data, context }) => {
    await assertPayments(context);
    const rt = await loadPayments();
    const db = context.getBase44().asServiceRole;
    const donation = await db.entities.Donation.get(String(data?.id || ""));
    const approve = Boolean(data?.approve);
    const notes = String(data?.notes || "").slice(0, 1000);

    if (approve) {
      const result = await rt.settlePayment(db, {
        donation: { ...donation, admin_notes: notes || donation.admin_notes || "" },
        provider: "bank_transfer",
        gatewayId: "",
        providerRef: donation.transfer_reference || "",
        actorEmail: context.user.email || "",
      });
      if (notes) await db.entities.Donation.update(donation.id, { admin_notes: notes });
      await rt.logPaymentEvent(db, {
        provider: "bank_transfer",
        type: "bank_transfer_verified",
        message: `${donation.reference} verified by ${context.user.email || "administrator"}`,
        actorEmail: context.user.email,
        recordId: donation.id,
        amount: donation.amount,
        currency: donation.currency,
      });
      await writeAudit(db, {
        actor: context.user,
        action: "payment.bank_transfer.verified",
        entity: "Donation",
        recordId: donation.id,
        details: `${donation.reference} · ${money(donation.amount, donation.currency)}`,
      });
      return { ok: true, donation: result.donation };
    }

    await rt.failPayment(db, {
      donation,
      provider: "bank_transfer",
      gatewayId: "",
      reason: "we could not match or verify the bank transfer you submitted",
      actorEmail: context.user.email,
    });
    if (notes) await db.entities.Donation.update(donation.id, { admin_notes: notes });
    await rt.logPaymentEvent(db, {
      provider: "bank_transfer",
      type: "bank_transfer_rejected",
      message: `${donation.reference} rejected · ${notes || "no reason recorded"}`,
      actorEmail: context.user.email,
      recordId: donation.id,
    });
    await writeAudit(db, {
      actor: context.user,
      action: "payment.bank_transfer.rejected",
      entity: "Donation",
      recordId: donation.id,
      details: notes || donation.reference,
    });
    return { ok: true };
  });

/* ----------------------------------------------------------------- public */

export const getCheckoutMethods = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const db = context.getBase44().asServiceRole;
  const [gatewayRes, bankRes] = await Promise.all([
    db.entities.PaymentGateway.filter({ is_enabled: true }, { limit: 20 }),
    db.entities.BankAccount.filter({ is_active: true }, { limit: 20 }),
  ]);

  const gateways = list(gatewayRes)
    .filter((gateway) => gateway.connection_status === "connected")
    .map((gateway) => {
      const provider = providerByKey(gateway.provider);
      return {
        id: gateway.id,
        kind: "gateway",
        provider: gateway.provider,
        name: provider?.name || gateway.display_name,
        methods: gateway.supported_methods?.length ? gateway.supported_methods : provider?.methods || [],
        currencies: gateway.currencies?.length ? gateway.currencies : provider?.currencies || [],
        supportsRecurring: Boolean(provider?.supportsRecurring),
        environment: gateway.environment || "sandbox",
      };
    });

  const banks = list(bankRes)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((account) => ({
      id: account.id,
      kind: "bank",
      currency: account.currency || "PKR",
      bank_name: account.bank_name,
      account_title: account.account_title,
      account_number: account.account_number || "",
      iban: account.iban || "",
      swift_code: account.swift_code || "",
      branch_name: account.branch_name || "",
      branch_code: account.branch_code || "",
      bank_address: account.bank_address || "",
      instructions: account.instructions || "",
    }));

  return { gateways, banks };
});

const donorFields = {
  donor_name: z.string().trim().min(2).max(120),
  donor_email: z.string().trim().regex(EMAIL).max(160),
  donor_phone: z.string().trim().max(40).optional(),
  country: z.string().trim().min(2).max(80),
  amount: z.coerce.number().min(1).max(5000000),
  currency: z.string().trim().min(3).max(4),
  frequency: z.enum(["one_time", "monthly"]),
  is_anonymous: z.boolean().optional(),
  dedication: z.string().trim().max(400).optional(),
  campaign_id: z.string().trim().max(80).optional(),
  project_id: z.string().trim().max(80).optional(),
  website: z.string().max(200).optional(),
};

export const startGatewayPayment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ...donorFields, gateway_id: z.string().trim().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    if (String(data.website || "").trim()) return { ok: false, spam: true };
    const rt = await loadPayments();
    const db = context.getBase44().asServiceRole;
    const gateway = await db.entities.PaymentGateway.get(data.gateway_id).catch(() => null);
    const provider = gateway ? providerByKey(gateway.provider) : null;

    if (!gateway || !provider || !gateway.is_enabled || gateway.connection_status !== "connected") {
      return { ok: false, error: "That payment method is not available right now. Please choose another option." };
    }
    if (!provider.currencies.includes(data.currency)) {
      return { ok: false, error: `${provider.name} does not accept ${data.currency} donations.` };
    }
    if (data.frequency === "monthly" && !provider.supportsRecurring) {
      return {
        ok: false,
        error: `${provider.name} recurring donations are not enabled for our merchant account. Please give once or choose another method.`,
      };
    }

    const donor = await context
      .getBase44()
      .auth.me()
      .catch(() => null);
    const linked = donor && lower(donor.email) === lower(data.donor_email) ? donor.id : "";

    const donation = await db.entities.Donation.create({
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
      payment_method: gateway.provider,
      gateway_provider: gateway.provider,
      gateway_id: gateway.id,
      status: "pending",
    });

    const credential = first(await db.entities.GatewayCredential.filter({ gateway_id: gateway.id }, { limit: 1 }));
    const credentials = credential ? await rt.openCredentials(credential.cipher).catch(() => ({})) : {};

    try {
      const action = await rt.initiatePayment({
        providerKey: gateway.provider,
        environment: gateway.environment || "sandbox",
        credentials,
        donation,
        returnUrl: `${BRAND.site}/donation-confirmation?ref=${encodeURIComponent(donation.reference)}`,
      });
      await rt.logPaymentEvent(db, {
        provider: gateway.provider,
        gatewayId: gateway.id,
        type: "checkout_initiated",
        message: `${donation.reference} · ${money(donation.amount, donation.currency)}`,
        recordId: donation.id,
        amount: donation.amount,
        currency: donation.currency,
      });
      return { ok: true, reference: donation.reference, action };
    } catch (error) {
      await rt.failPayment(db, {
        donation,
        provider: gateway.provider,
        gatewayId: gateway.id,
        reason: "the payment provider could not start the checkout",
      });
      return {
        ok: false,
        error: String(error?.message || "The payment provider could not start the checkout.").slice(0, 300),
      };
    }
  });

export const submitBankTransferDonation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ...donorFields,
      bank_account_id: z.string().trim().min(1).max(80),
      transfer_reference: z.string().trim().min(2).max(120),
      transfer_date: z.string().trim().max(40),
      proof_file_uri: z.string().trim().max(400).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    if (String(data.website || "").trim()) return { ok: false, spam: true };
    const rt = await loadPayments();
    const db = context.getBase44().asServiceRole;
    const account = await db.entities.BankAccount.get(data.bank_account_id).catch(() => null);
    if (!account || !account.is_active) {
      return { ok: false, error: "That bank account is no longer available. Please refresh the page." };
    }

    const donor = await context
      .getBase44()
      .auth.me()
      .catch(() => null);
    const linked = donor && lower(donor.email) === lower(data.donor_email) ? donor.id : "";

    const donation = await db.entities.Donation.create({
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
      payment_method: "bank_transfer",
      gateway_provider: "bank_transfer",
      bank_account_id: account.id,
      transfer_reference: data.transfer_reference,
      transfer_date: data.transfer_date || "",
      proof_file_uri: data.proof_file_uri || "",
      status: "pending",
    });

    const project = donation.project_id
      ? await db.entities.Project.get(donation.project_id).catch(() => null)
      : null;

    await notifyUser(db, {
      userId: linked,
      toEmail: donation.donor_email,
      title: "Bank transfer pending verification",
      message: `We received your transfer notice for ${money(donation.amount, donation.currency)}. Our finance team will verify it shortly.`,
      type: "donation",
      link: "/portal/donations",
      mail: {
        template: "bank_transfer_pending",
        subject: `We received your GPHF transfer notice · ${donation.reference}`,
        heading: "Your transfer is pending verification",
        intro: `Thank you, ${String(donation.donor_name || "friend").split(" ")[0]}. Our finance team will match your transfer against the details below and email your official receipt once it is verified.`,
        rows: [
          { label: "Reference", value: donation.reference },
          { label: "Amount", value: money(donation.amount, donation.currency) },
          { label: "Bank", value: `${account.bank_name} · ${account.account_title}` },
          { label: "Your transfer reference", value: donation.transfer_reference },
          { label: "Project", value: project?.title || "General foundation fund" },
        ],
        ctaLabel: "Track this donation",
        ctaUrl: `${BRAND.site}/donation-confirmation?ref=${encodeURIComponent(donation.reference)}`,
        note: `If anything looks wrong, write to ${BRAND.support} with your reference and we will correct it.`,
        relatedId: donation.id,
      },
    });

    await rt.logPaymentEvent(db, {
      provider: "bank_transfer",
      type: "checkout_initiated",
      message: `${donation.reference} transfer notice submitted · ${money(donation.amount, donation.currency)}`,
      recordId: donation.id,
      amount: donation.amount,
      currency: donation.currency,
    });

    return { ok: true, reference: donation.reference };
  });

export const getBankTransferInstructions = createServerFn({ method: "GET" })
  .inputValidator(z.object({ reference: z.string().trim().min(4).max(40) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const donation = first(await db.entities.Donation.filter({ reference: data.reference }, { limit: 1 }));
    if (!donation || donation.payment_method !== "bank_transfer" || !donation.bank_account_id) return null;
    const account = await db.entities.BankAccount.get(donation.bank_account_id).catch(() => null);
    if (!account) return null;
    return {
      bank_name: account.bank_name,
      account_title: account.account_title,
      account_number: account.account_number || "",
      iban: account.iban || "",
      swift_code: account.swift_code || "",
      branch_name: account.branch_name || "",
      bank_address: account.bank_address || "",
      currency: account.currency || "",
      instructions: account.instructions || "",
      transfer_reference: donation.transfer_reference || "",
      transfer_date: donation.transfer_date || "",
    };
  });