import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  secure: process.env.EMAIL_SECURE==="true",
  tls: {
    rejectUnauthorized: false, // allows self-signed cert
  },
});
