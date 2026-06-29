import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM

export const smtpEnabled = !!(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM)

const transporter = smtpEnabled
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    : null

if (smtpEnabled) {
    console.log("[Email] SMTP enabled:", SMTP_HOST, "port", SMTP_PORT)
} else {
    console.log("[Email] SMTP not configured – emails will be logged to console")
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string }) {
    if (!transporter) {
        console.log(`[Email] To: ${opts.to} | Subject: ${opts.subject}`)
        console.log(`[Email] ${opts.text}`)
        return
    }
    try {
        const info = await transporter.sendMail({ from: SMTP_FROM, ...opts })
        console.log(`[Email] Sent to ${opts.to} (messageId: ${info.messageId})`)
    } catch (err) {
        console.error(`[Email] Failed to send to ${opts.to}:`, err)
    }
}
