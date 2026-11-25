// Branded GPHF email rendering + delivery. Server-only.
export const BRAND = {
  forest: "#174D38",
  navy: "#173451",
  gold: "#D4AF37",
  page: "#F6F8F6",
  border: "#E5E7EB",
  muted: "#4E5C6A",
  logo: "https://media.base44.com/images/public/user_6aeda2ecb9f864218d6cd8a6/32dc3e87a05943671603e36a4f455eb3_GlobalPeaceandHumanityEmblem.png",
  site: "https://dark-global-peace-path.base44.app",
  support: "support@gphf.pk",
};

const escape = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function detailRows(rows = []) {
  if (!rows.length) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};margin:24px 0;">
      ${rows
        .map(
          (row, index) => `
      <tr style="background:${index % 2 ? "#FFFFFF" : "#FAFBFA"};">
        <td style="padding:12px 16px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-family:'Plus Jakarta Sans',Arial,sans-serif;width:45%;">${escape(row.label)}</td>
        <td style="padding:12px 16px;font-size:14px;color:${BRAND.navy};font-family:'Plus Jakarta Sans',Arial,sans-serif;font-weight:600;text-align:right;">${escape(row.value)}</td>
      </tr>`
        )
        .join("")}
    </table>`;
}

export function renderEmail({ heading, intro, rows, ctaLabel, ctaUrl, note }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(heading)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.page};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.page};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid ${BRAND.border};">
        <tr>
          <td style="background:${BRAND.forest};padding:22px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:14px;"><img src="${BRAND.logo}" width="48" height="48" alt="Global Peace &amp; Humanity Foundation" style="display:block;border:0;"></td>
              <td style="font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#FFFFFF;">
                <div style="font-size:15px;font-weight:700;letter-spacing:0.02em;">Global Peace &amp; Humanity Foundation</div>
                <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#C9DCD1;margin-top:4px;">Together for Peace. Together for Humanity.</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:27px;line-height:1.2;color:${BRAND.navy};font-weight:400;">${escape(heading)}</h1>
          <p style="margin:14px 0 0;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:14px;line-height:1.7;color:${BRAND.muted};">${escape(intro)}</p>
          ${detailRows(rows)}
          ${
            ctaLabel && ctaUrl
              ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${BRAND.forest};">
                   <a href="${escape(ctaUrl)}" style="display:inline-block;padding:14px 26px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${escape(ctaLabel)}</a>
                 </td></tr></table>`
              : ""
          }
          ${note ? `<p style="margin:20px 0 0;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:12px;line-height:1.7;color:${BRAND.muted};">${escape(note)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:28px 32px 34px;"></td></tr>
        <tr>
          <td style="background:${BRAND.navy};padding:24px 32px;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#D7DEE6;font-size:11px;line-height:1.8;">
            <div style="color:#FFFFFF;font-size:12px;font-weight:600;">Global Peace &amp; Humanity Foundation</div>
            <div>Registered humanitarian organization · Pakistan</div>
            <div style="margin-top:6px;">Support: <a href="mailto:${BRAND.support}" style="color:${BRAND.gold};text-decoration:none;">${BRAND.support}</a> · <a href="${BRAND.site}" style="color:${BRAND.gold};text-decoration:none;">gphf.pk</a></div>
            <div style="margin-top:10px;color:#93A2B1;">You are receiving this email because you have an account or made a donation with GPHF.</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Sends a branded email and records the real outcome in EmailLog.
 * Never reports success unless the provider accepted the message.
 */
export async function sendBrandedEmail(db, { to, template, subject, heading, intro, rows, ctaLabel, ctaUrl, note, relatedId }) {
  const html = renderEmail({ heading, intro, rows, ctaLabel, ctaUrl, note });
  let status = "sent";
  let error = "";
  try {
    await db.integrations.Core.SendEmail({
      to,
      subject,
      html,
      from_name: "Global Peace & Humanity Foundation",
      category: "transactional",
    });
  } catch (err) {
    status = "failed";
    error = String(err?.message || "Email delivery failed").slice(0, 400);
  }
  try {
    await db.entities.EmailLog.create({
      to_email: to,
      template,
      subject,
      status,
      error,
      related_id: relatedId || "",
    });
  } catch {
    // The log is secondary; the send outcome is still returned to the caller.
  }
  return { ok: status === "sent", error };
}