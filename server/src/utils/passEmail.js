// The confirmation email for a provisional pass: a plain-text version and an
// HTML version. The HTML uses tables and inline styles only, because email
// clients ignore most modern CSS.

const PLAN_LABELS = { daily: "Daily Pass", weekly: "Weekly Pass", monthly: "Monthly Pass" };

const GYM = {
  name: "Northumberland Fitness",
  address: "Northumberland Mall, 1111 Elgin Street West, Cobourg, ON K9A 5H7",
  phone: "289-629-8333",
  email: "contact@northumberlandfitness.com",
  site: "https://northumberlandfitness.com",
};

// Matches the website's palette.
const NAVY = "#1d4072";
const GREEN = "#60a527";
const INK = "#14283a";
const MUTED = "#5b6b7a";
const PAPER = "#f4f6f8";
const LINE = "#dde3e9";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function formatDate(value) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-CA", {
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function validity(m) {
  return m.startDate === m.endDate
    ? [["Valid on", formatDate(m.startDate)]]
    : [
        ["Starts", formatDate(m.startDate)],
        ["Last day", formatDate(m.endDate)],
      ];
}

export function renderPassEmail(m) {
  const plan = PLAN_LABELS[m.plan] || "Pass";
  const subject = `Your Northumberland Fitness sign-in code: ${m.key}`;
  const rows = [["Pass", plan], ...validity(m), ["Name", `${m.firstName} ${m.lastName}`]];

  const text = [
    `You're all set, ${m.firstName}.`,
    "",
    `Your ${plan} is confirmed.`,
    "",
    `YOUR SIGN-IN CODE: ${m.key}`,
    "",
    "At the front desk, give us this code or your name and we'll find your pass.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    GYM.name,
    GYM.address,
    `${GYM.phone} · ${GYM.email}`,
  ].join("\n");

  const detailRows = rows
    .map(
      ([label, value], i) => `
              <tr>
                <td style="padding:12px 0;${i > 0 ? `border-top:1px solid ${LINE};` : ""}font:700 12px ${SANS};letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};width:38%;">${escapeHtml(label)}</td>
                <td style="padding:12px 0;${i > 0 ? `border-top:1px solid ${LINE};` : ""}font:16px ${SANS};color:${INK};">${escapeHtml(value)}</td>
              </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAPER};">Your sign-in code is ${escapeHtml(m.key)}. Your ${escapeHtml(plan)} is confirmed.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;">
        <tr>
          <td style="background:${NAVY};padding:28px 32px;">
            <div style="font:700 13px ${SANS};letter-spacing:4px;text-transform:uppercase;color:#ffffff;">${escapeHtml(GYM.name)}</div>
          </td>
        </tr>
        <tr><td style="height:6px;line-height:6px;font-size:0;background:${GREEN};">&nbsp;</td></tr>
        <tr>
          <td style="padding:40px 32px 8px;">
            <h1 style="margin:0;font:700 30px/1.2 ${SERIF};color:${NAVY};">You're all set, ${escapeHtml(m.firstName)}.</h1>
            <p style="margin:12px 0 0;font:17px/1.55 ${SANS};color:${INK};">Your ${escapeHtml(plan)} is confirmed. Keep this email handy &mdash; you'll need the code below each time you visit.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};border-top:4px solid ${GREEN};">
              <tr>
                <td align="center" style="padding:24px 16px 28px;">
                  <div style="font:700 12px ${SANS};letter-spacing:3px;text-transform:uppercase;color:${MUTED};">Your sign-in code</div>
                  <div style="margin-top:8px;font:700 64px/1.1 ${SERIF};letter-spacing:14px;padding-left:14px;color:${NAVY};">${escapeHtml(m.key)}</div>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font:15px/1.55 ${SANS};color:${MUTED};text-align:center;">At the front desk, give us this code or just your name and we'll find your pass.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid ${NAVY};">${detailRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${NAVY};padding:24px 32px;">
            <div style="font:700 14px ${SANS};color:#ffffff;">${escapeHtml(GYM.name)}</div>
            <div style="margin-top:6px;font:13px/1.6 ${SANS};color:#c3d0e0;">${escapeHtml(GYM.address)}<br>${escapeHtml(GYM.phone)} &middot; <a href="mailto:${GYM.email}" style="color:#c3d0e0;">${escapeHtml(GYM.email)}</a></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
