// minimal nodemailer wrapper (works if SMTP env provided)
import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail(to, subject, text, html) {
  if (!transporter) return;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@crs.local",
    to,
    subject,
    text,
    html
  });
}

export default sendMail;
