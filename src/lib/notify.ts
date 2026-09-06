import "server-only"
import nodemailer from "nodemailer"

/**
 * Notifications à la réception d'un message (formulaire de contact).
 *
 * Email : par défaut via le SMTP local de l'hébergeur (127.0.0.1:25, sans
 * authentification, comme les autres applications du serveur). Surcharge
 * possible par SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD.
 * Destinataire : NOTIFY_EMAIL_TO, sinon l'email du propriétaire du profil.
 *
 * Telegram (optionnel) : TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://linkfree.tmktools.com"

function appHost(): string {
  try {
    return new URL(APP_URL).hostname
  } catch {
    return "localhost"
  }
}

function mailFrom(): string {
  return process.env.MAIL_FROM || `Linkfree <noreply@${appHost()}>`
}

function transporter() {
  const host = process.env.SMTP_HOST || "127.0.0.1"
  const port = Number(process.env.SMTP_PORT) || (process.env.SMTP_HOST ? 587 : 25)
  const user = process.env.SMTP_USER
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass: process.env.SMTP_PASSWORD } : undefined,
    tls: host === "127.0.0.1" || host === "localhost" ? { rejectUnauthorized: false } : undefined,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  })
}

export type LeadNotification = {
  lead: { id: string; name: string | null; email: string; message: string | null; createdAt: Date }
  profile: { id: string; slug: string; title: string | null }
  ownerEmail: string
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string)
}

export async function sendLeadEmail({ lead, profile, ownerEmail }: LeadNotification): Promise<void> {
  if (process.env.NOTIFY_EMAIL === "false") return
  const to = process.env.NOTIFY_EMAIL_TO || ownerEmail
  if (!to) return

  const page = profile.title || profile.slug
  const messagesUrl = `${APP_URL}/dashboard/messages?profile=${profile.id}`
  const date = lead.createdAt.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
  const from = lead.name ? `${lead.name} <${lead.email}>` : lead.email

  const text = [
    `Nouveau message reçu sur votre page ${page} (${APP_URL}/p/${profile.slug})`,
    ``,
    `De : ${from}`,
    `Le : ${date}`,
    ``,
    lead.message || "(sans message)",
    ``,
    `Répondre : ${lead.email}`,
    `Voir dans le dashboard : ${messagesUrl}`,
  ].join("\n")

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="font-size:18px;margin:0 0 16px">Nouveau message sur <a href="${APP_URL}/p/${profile.slug}" style="color:#0284c7">${escapeHtml(page)}</a></h2>
      <table style="font-size:14px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">De</td><td style="padding:4px 0"><strong>${escapeHtml(lead.name || "")}</strong> &lt;<a href="mailto:${escapeHtml(lead.email)}" style="color:#0284c7">${escapeHtml(lead.email)}</a>&gt;</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Le</td><td style="padding:4px 0">${escapeHtml(date)}</td></tr>
      </table>
      <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;white-space:pre-wrap;font-size:15px;line-height:1.5">${escapeHtml(lead.message || "(sans message)")}</div>
      <p style="font-size:14px">
        <a href="mailto:${escapeHtml(lead.email)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:999px;text-decoration:none">Répondre</a>
        &nbsp;
        <a href="${messagesUrl}" style="display:inline-block;padding:10px 16px;border:1px solid #ddd;color:#111;border-radius:999px;text-decoration:none">Voir dans le dashboard</a>
      </p>
      <p style="font-size:12px;color:#888;margin-top:24px">Envoyé par Linkfree · ${escapeHtml(appHost())}</p>
    </div>`

  await transporter().sendMail({
    from: mailFrom(),
    to,
    replyTo: lead.name ? { name: lead.name, address: lead.email } : lead.email,
    subject: `[Linkfree] Nouveau message de ${lead.name || lead.email} — ${page}`,
    text,
    html,
  })
}

export async function sendLeadTelegram({ lead, profile }: LeadNotification): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const page = profile.title || profile.slug
  const text = [
    `📬 <b>Nouveau message</b> sur <a href="${APP_URL}/p/${profile.slug}">${escapeHtml(page)}</a>`,
    `<b>De :</b> ${escapeHtml(lead.name || "")} &lt;${escapeHtml(lead.email)}&gt;`,
    ``,
    escapeHtml(lead.message || "(sans message)"),
    ``,
    `<a href="${APP_URL}/dashboard/messages?profile=${profile.id}">Voir dans le dashboard</a>`,
  ].join("\n")

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`)
}

/** Envoie toutes les notifications configurées ; les erreurs sont journalisées, jamais propagées. */
export async function notifyNewLead(n: LeadNotification): Promise<{ email: boolean; telegram: boolean }> {
  const [email, telegram] = await Promise.allSettled([sendLeadEmail(n), sendLeadTelegram(n)])
  if (email.status === "rejected") console.error("[notify] email:", email.reason instanceof Error ? email.reason.message : email.reason)
  if (telegram.status === "rejected") console.error("[notify] telegram:", telegram.reason instanceof Error ? telegram.reason.message : telegram.reason)
  return { email: email.status === "fulfilled", telegram: telegram.status === "fulfilled" }
}
