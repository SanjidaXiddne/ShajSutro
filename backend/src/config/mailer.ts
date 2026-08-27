import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export function getTransporter() {
  const isCustomSmtp = Boolean(process.env.EMAIL_HOST);
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  return nodemailer.createTransport(
    isCustomSmtp
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 465,
          secure: (process.env.EMAIL_PORT || "465") === "465",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {
          service: "gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        }
  );
}

const transporter = {
  sendMail: (options: any) => getTransporter().sendMail(options),
  verify: (callback?: any) => getTransporter().verify(callback),
};

export default transporter;
