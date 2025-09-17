// minimal nodemailer wrapper (works if SMTP env provided)
import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.mail.smtpHost,
  port: config.mail.smtpPort,
  secure: false,
  auth: {
    user: config.mail.smtpUser, 
    pass: config.mail.smtpPass
  }
});

async function sendMail(to, subject, text, html) {
  if (!transporter) return;
  await transporter.sendMail({
    from: config.mail.smtpFrom,
    to,
    subject,
    text,
    html
  });
}

export default sendMail;
