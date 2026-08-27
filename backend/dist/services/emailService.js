"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBroadcastEmail = exports.sendNewsletterWelcomeEmail = exports.sendOrderConfirmationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const mailer_1 = __importDefault(require("../config/mailer"));
const YEAR = new Date().getFullYear();
// ─── Anti-Spam Plain Text Stripper ─────────────────────────────────────────────
function stripHtmlToText(html) {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/tr>/gi, "\n")
        .replace(/<\/td>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();
}
// ─── Central Anti-Spam Email Delivery Helper ────────────────────────────────────
async function sendMailWithAntiSpam(options) {
    const senderEmail = process.env.EMAIL_USER || "info@shajsutro.com";
    const senderName = process.env.EMAIL_FROM_NAME || "ShajSutro";
    const fromHeader = `"${senderName}" <${senderEmail}>`;
    const plainText = options.text || stripHtmlToText(options.html);
    const headers = {
        "X-Mailer": "ShajSutro Transactional Mailer v1.0",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Importance": "Normal",
        "Auto-Submitted": "auto-generated",
    };
    if (options.isBroadcast) {
        headers["List-Unsubscribe"] = `<mailto:unsubscribe@shajsutro.com?subject=unsubscribe>, <https://shajsutro.com/unsubscribe>`;
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        headers["Precedence"] = "bulk";
    }
    await mailer_1.default.sendMail({
        from: fromHeader,
        replyTo: senderEmail,
        to: options.to,
        subject: options.subject,
        text: plainText,
        html: options.html,
        headers,
    });
}
// ─── Shared Ultra-Modern Luxury Layout Shell ───────────────────────────────────
function emailShell(bodyContent, previewText = "") {
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>ShajSutro</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader text for inbox preview without spam flags -->
  ${previewText ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ""}

  <!-- Outer Canvas Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.08);border-radius:24px;overflow:hidden;">

          <!-- ── LUXURY HEADER ── -->
          <tr>
            <td style="background:linear-gradient(135deg, #09090b 0%, #18181b 100%);padding:40px 48px 36px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:6px 18px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:100px;margin-bottom:12px;">
                      <span style="font-size:10px;font-weight:700;letter-spacing:0.25em;color:#f59e0b;text-transform:uppercase;">Official Verification</span>
                    </div>
                    <h1 style="margin:0;font-size:32px;font-weight:900;letter-spacing:4px;color:#ffffff;text-transform:uppercase;font-family:'Segoe UI',Roboto,sans-serif;">SHAJSUTRO</h1>
                    <p style="margin:8px 0 0;font-size:12px;color:#a1a1aa;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;">Fashion · Elegance · Modern Wardrobe</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── MAIN CONTENT BODY ── -->
          <tr>
            <td style="background-color:#ffffff;padding:48px 48px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- ── HELP & SUPPORT BANNER ── -->
          <tr>
            <td style="background-color:#ffffff;padding:0 48px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px 24px;">
                <tr>
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#0f172a;">Need Assistance?</p>
                    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Our support team is available Mon – Sat (10 AM – 6 PM)</p>
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <a href="mailto:support@shajsutro.com" style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-decoration:none;padding:10px 20px;border-radius:100px;box-shadow:0 4px 12px rgba(15,23,42,0.15);">
                      Get Support
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#09090b;padding:32px 48px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding-bottom:16px;">
                    <a href="https://shajsutro.com/privacy-policy" style="font-size:11px;color:#a1a1aa;text-decoration:none;margin:0 12px;font-weight:500;">Privacy Policy</a>
                    <span style="color:#3f3f46;font-size:11px;">•</span>
                    <a href="https://shajsutro.com/terms-of-service" style="font-size:11px;color:#a1a1aa;text-decoration:none;margin:0 12px;font-weight:500;">Terms of Service</a>
                    <span style="color:#3f3f46;font-size:11px;">•</span>
                    <a href="https://shajsutro.com/unsubscribe" style="font-size:11px;color:#a1a1aa;text-decoration:none;margin:0 12px;font-weight:500;">Unsubscribe</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0;font-size:11px;color:#71717a;line-height:1.8;">
                      &copy; ${YEAR} ShajSutro Ltd. All rights reserved.<br />
                      Dhaka, Bangladesh • <a href="https://shajsutro.com" style="color:#f59e0b;text-decoration:none;">shajsutro.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
// ─── Ultra-Modern High-Contrast OTP Code Box ────────────────────────────────────
function otpBox(code) {
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr>
    <td align="center">
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border:2px solid #f59e0b;border-radius:20px;padding:28px 40px;box-shadow:0 12px 24px rgba(245,158,11,0.15);text-align:center;max-width:380px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#f59e0b;text-transform:uppercase;">Your Verification Passcode</p>
        <p style="margin:0 0 10px;font-size:42px;font-weight:900;letter-spacing:14px;color:#ffffff;font-family:'Courier New',Consolas,monospace;text-shadow:0 2px 10px rgba(0,0,0,0.5);">${code}</p>
        <div style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,0.08);border-radius:100px;">
          <span style="font-size:11px;color:#cbd5e1;font-weight:600;">⏱️ Valid for 10 minutes</span>
        </div>
      </div>
    </td>
  </tr>
</table>
  `.trim();
}
// ─── Modern Step Card Row ───────────────────────────────────────────────────────
function stepCardRow(num, title, desc) {
    return `
<tr>
  <td style="padding-bottom:12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 18px;">
      <tr>
        <td style="width:36px;vertical-align:middle;">
          <div style="width:32px;height:32px;border-radius:10px;background:#0f172a;color:#f59e0b;font-size:13px;font-weight:800;line-height:32px;text-align:center;">
            ${num}
          </div>
        </td>
        <td style="padding-left:14px;vertical-align:middle;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">${title}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;line-height:1.5;">${desc}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
  `.trim();
}
// ─── Security Notice Box ────────────────────────────────────────────────────────
function securityNoticeBox(text) {
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
  <tr>
    <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-top:1px solid #fef3c7;border-right:1px solid #fef3c7;border-bottom:1px solid #fef3c7;border-radius:0 12px 12px 0;padding:16px 20px;">
      <p style="margin:0;font-size:12px;color:#92400e;line-height:1.6;">
        <strong style="color:#b45309;">🔒 Security Notice:</strong> ${text}
      </p>
    </td>
  </tr>
</table>
  `.trim();
}
// ─── Send: Email Verification ─────────────────────────────────────────────────
const sendVerificationEmail = async (email, code) => {
    const body = `
    <!-- Header Greeting -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:20px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);line-height:64px;font-size:28px;">
        ✉️
      </div>
      <h2 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Verify Your Email Address</h2>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;max-width:440px;margin:0 auto;">
        Welcome to <strong style="color:#0f172a;">ShajSutro</strong>! Please enter the passcode below to activate your account and start your fashion journey.
      </p>
    </div>

    <!-- Passcode Display Box -->
    ${otpBox(code)}

    <!-- Step Timeline Instructions -->
    <p style="margin:0 0 16px;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.1em;">Simple Verification Steps</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${stepCardRow("01", "Copy Passcode", "Copy the 6-digit security code displayed above.")}
      ${stepCardRow("02", "Return to Browser", "Switch back to the ShajSutro sign-up page.")}
      ${stepCardRow("03", "Paste & Verify", "Enter the code in the verification screen and submit.")}
    </table>

    <!-- Security Notice -->
    ${securityNoticeBox("ShajSutro will never request your password or confidential details over email. If you did not sign up for an account, please ignore this email.")}
  `;
    await sendMailWithAntiSpam({
        to: email,
        subject: "Verify your ShajSutro account",
        html: emailShell(body, "Your ShajSutro verification code is inside — valid for 10 minutes."),
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
// ─── Send: Password Reset ─────────────────────────────────────────────────────
const sendPasswordResetEmail = async (email, code) => {
    const body = `
    <!-- Header Greeting -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);line-height:64px;font-size:28px;">
        🔑
      </div>
      <h2 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Reset Your Password</h2>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;max-width:440px;margin:0 auto;">
        We received a request to reset the password for your ShajSutro account linked to <strong style="color:#0f172a;">${email}</strong>.
      </p>
    </div>

    <!-- Passcode Display Box -->
    ${otpBox(code)}

    <!-- Step Timeline Instructions -->
    <p style="margin:0 0 16px;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.1em;">How to Reset Password</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${stepCardRow("01", "Copy Code", "Copy the 6-digit passcode shown above.")}
      ${stepCardRow("02", "Enter Code", "Paste the code in the password reset form.")}
      ${stepCardRow("03", "Create New Password", "Set a strong new password to secure your account.")}
    </table>

    <!-- Security Notice -->
    ${securityNoticeBox("If you did not request a password reset, your account is safe. No changes will be made unless you confirm with this passcode.")}
  `;
    await sendMailWithAntiSpam({
        to: email,
        subject: "Reset your ShajSutro password",
        html: emailShell(body, "Your ShajSutro password reset code is inside — valid for 10 minutes."),
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// ─── Send: Order Confirmation ──────────────────────────────────────────────────
const sendOrderConfirmationEmail = async (recipientEmail, order) => {
    const orderId = order._id
        ? order._id.toString().slice(-8).toUpperCase()
        : "RECENT";
    const dateStr = order.createdAt
        ? new Date(order.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        : new Date().toLocaleDateString();
    const customerName = `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
        "Valued Customer";
    const paymentMethodLabel = order.paymentMethod === "bkash"
        ? "bKash"
        : order.paymentMethod === "nagad"
            ? "Nagad"
            : order.paymentMethod === "rocket"
                ? "Rocket"
                : "Cash on Delivery (COD)";
    const paymentStatusText = order.paymentStatus === "paid"
        ? `Paid ${order.txnId ? `(TxnID: ${order.txnId})` : ""}`
        : order.paymentStatus === "refunded"
            ? "Payment Returned"
            : "Cash on Delivery / Verification Pending";
    const itemsHtml = (order.items || [])
        .map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${item.name}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#64748b;">
                ${item.size ? `Size: <strong>${item.size}</strong> &nbsp;•&nbsp; ` : ""}
                ${item.color ? `Color: <strong>${item.color}</strong> &nbsp;•&nbsp; ` : ""}
                Qty: <strong>${item.quantity}</strong>
              </p>
            </td>
            <td style="text-align:right;vertical-align:middle;font-size:14px;font-weight:800;color:#0f172a;">
              ৳${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `)
        .join("");
    const body = `
    <!-- Header Badge & Title -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:20px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);line-height:64px;font-size:28px;">
        🛍️
      </div>
      <span style="display:inline-block;padding:4px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:100px;font-size:11px;font-weight:800;color:#047857;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
        Order Confirmed
      </span>
      <h2 style="margin:8px 0 6px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Thank You For Your Order!</h2>
      <p style="margin:0;font-size:14px;color:#64748b;">Order Reference: <strong style="color:#0f172a;font-family:monospace;">#${orderId}</strong> &bull; ${dateStr}</p>
    </div>

    <!-- Customer & Shipping Summary Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td style="vertical-align:top;width:50%;padding-right:12px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Customer Details</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${customerName}</p>
          <p style="margin:3px 0 0;font-size:12px;color:#64748b;">${recipientEmail}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">📞 ${order.shippingAddress?.phone || "N/A"}</p>
        </td>
        <td style="vertical-align:top;width:50%;padding-left:12px;border-left:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Shipping Address</p>
          <p style="margin:0;font-size:13px;color:#334155;line-height:1.5;">${order.shippingAddress?.address || ""}</p>
          <p style="margin:3px 0 0;font-size:12px;color:#64748b;">
            ${[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.zip].filter(Boolean).join(", ")}
          </p>
        </td>
      </tr>
    </table>

    <!-- Order Items List -->
    <p style="margin:0 0 12px;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.1em;">Order Items (${(order.items || []).length})</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemsHtml}
    </table>

    <!-- Financial Breakdown -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#64748b;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600;color:#0f172a;">৳${(order.subtotal || 0).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#64748b;">Delivery Fee</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600;color:#0f172a;">${order.shippingCost === 0 ? "FREE" : `৳${(order.shippingCost || 0).toFixed(2)}`}</td>
      </tr>
      ${order.discount > 0
        ? `
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#059669;font-weight:600;">Promo Discount</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:700;color:#059669;">-৳${order.discount.toFixed(2)}</td>
      </tr>
      `
        : ""}
      <tr>
        <td style="padding:12px 0 0;border-top:1px solid #e2e8f0;font-size:16px;font-weight:800;color:#0f172a;">Total Payable</td>
        <td style="padding:12px 0 0;border-top:1px solid #e2e8f0;text-align:right;font-size:18px;font-weight:900;color:#0f172a;">৳${(order.total || 0).toFixed(2)}</td>
      </tr>
    </table>

    <!-- Payment & Delivery Info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:800;color:#1e40af;text-transform:uppercase;letter-spacing:0.05em;">Payment Details</p>
          <p style="margin:0;font-size:13px;color:#1e3a8a;">
            Method: <strong>${paymentMethodLabel}</strong> &nbsp;•&nbsp; Status: <strong>${paymentStatusText}</strong>
          </p>
        </td>
      </tr>
    </table>

    <!-- Action Button -->
    <div style="text-align:center;margin-top:32px;">
      <a href="https://shajsutro.com/profile" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:800;letter-spacing:0.08em;text-decoration:none;padding:14px 32px;border-radius:100px;box-shadow:0 10px 20px rgba(15,23,42,0.2);">
        TRACK ORDER STATUS →
      </a>
    </div>
  `;
    try {
        await sendMailWithAntiSpam({
            to: recipientEmail,
            subject: `✨ Order Confirmation #${orderId} — ShajSutro`,
            html: emailShell(body, `Your ShajSutro order #${orderId} for ৳${(order.total || 0).toFixed(2)} has been placed successfully!`),
        });
    }
    catch (err) {
        console.error("Failed to send order confirmation email:", err);
    }
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
// ─── Send: Newsletter Welcome Email ──────────────────────────────────────────
const sendNewsletterWelcomeEmail = async (email) => {
    const body = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:20px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);line-height:64px;font-size:28px;">
        📩
      </div>
      <span style="display:inline-block;padding:4px 14px;background:#fef3c7;border:1px solid #fde047;border-radius:100px;font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">
        Welcome to VIP Circle
      </span>
      <h2 style="margin:8px 0 6px;font-size:26px;font-weight:800;color:#0f172a;">Welcome to ShajSutro!</h2>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:440px;margin:0 auto;">
        Thank you for subscribing to our newsletter. You&apos;re now on the VIP list for early drop alerts, private sales, and minimalist style guides.
      </p>
    </div>
  `;
    try {
        await sendMailWithAntiSpam({
            to: email,
            subject: "Welcome to ShajSutro Newsletter!",
            html: emailShell(body, "Welcome to ShajSutro! You are now subscribed to VIP updates."),
        });
    }
    catch (err) {
        console.error("Failed to send newsletter welcome email:", err);
    }
};
exports.sendNewsletterWelcomeEmail = sendNewsletterWelcomeEmail;
const sendBroadcastEmail = async (payload) => {
    const { recipientEmails, subject, badgeText = "SPECIAL OFFER", title, messageBody, bannerImageUrl, ctaButtonText = "SHOP NOW", ctaButtonUrl = "https://shajsutro.com/shop", } = payload;
    const formattedMessage = messageBody
        .split("\n")
        .filter((p) => p.trim())
        .map((p) => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.75;">${p.trim()}</p>`)
        .join("");
    const body = `
    <!-- Header Badge & Celebration Title -->
    <div style="text-align:center;margin-bottom:32px;">
      ${badgeText
        ? `
      <div style="display:inline-block;padding:6px 20px;background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);border:1px solid #fde047;border-radius:100px;margin-bottom:14px;box-shadow:0 4px 12px rgba(245,158,11,0.12);">
        <span style="font-size:11px;font-weight:900;color:#b45309;text-transform:uppercase;letter-spacing:0.2em;">✨ ${badgeText}</span>
      </div>
      `
        : ""}
      <h2 style="margin:6px 0 10px;font-size:30px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.2;">${title}</h2>
      <div style="width:40px;height:3px;background:linear-gradient(90deg, #f59e0b, #d97706);margin:0 auto;border-radius:100px;"></div>
    </div>

    <!-- Banner Image Poster (if provided) -->
    ${bannerImageUrl
        ? `
    <div style="margin-bottom:32px;border-radius:20px;overflow:hidden;box-shadow:0 16px 32px rgba(0,0,0,0.12);border:1px solid #e2e8f0;">
      <img src="${bannerImageUrl}" alt="${title}" style="width:100%;max-height:320px;object-fit:cover;display:block;border:0;" />
    </div>
    `
        : ""}

    <!-- Main Message Content Box with Amber Accent -->
    <div style="background:#f8fafc;border-left:4px solid #f59e0b;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 16px 16px 0;padding:26px 30px;margin-bottom:32px;box-shadow:0 4px 12px rgba(0,0,0,0.02);">
      ${formattedMessage}
    </div>

    <!-- Store Selling Points Grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background:#ffffff;border:1px solid #f1f5f9;border-radius:16px;padding:16px;">
      <tr>
        <td style="text-align:center;width:33.33%;padding:8px 4px;border-right:1px solid #f1f5f9;">
          <p style="margin:0 0 2px;font-size:16px;">🚚</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#0f172a;">Fast Delivery</p>
          <p style="margin:2px 0 0;font-size:10px;color:#64748b;">3-5 Days Nationwide</p>
        </td>
        <td style="text-align:center;width:33.33%;padding:8px 4px;border-right:1px solid #f1f5f9;">
          <p style="margin:0 0 2px;font-size:16px;">✨</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#0f172a;">Premium Quality</p>
          <p style="margin:2px 0 0;font-size:10px;color:#64748b;">100% Authentic</p>
        </td>
        <td style="text-align:center;width:33.33%;padding:8px 4px;">
          <p style="margin:0 0 2px;font-size:16px;">🔒</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#0f172a;">Secure Payment</p>
          <p style="margin:2px 0 0;font-size:10px;color:#64748b;">COD & Online</p>
        </td>
      </tr>
    </table>

    <!-- Call-To-Action Button -->
    ${ctaButtonText && ctaButtonUrl
        ? `
    <div style="text-align:center;margin-top:36px;margin-bottom:16px;">
      <a href="${ctaButtonUrl}" style="display:inline-block;background:linear-gradient(135deg, #09090b 0%, #1e293b 100%);color:#ffffff;font-size:13px;font-weight:900;letter-spacing:0.15em;text-decoration:none;padding:18px 44px;border-radius:100px;box-shadow:0 14px 28px rgba(15,23,42,0.3);text-transform:uppercase;">
        ${ctaButtonText} &rarr;
      </a>
    </div>
    `
        : ""}
  `;
    let sentCount = 0;
    let failedCount = 0;
    // Process in batches of 5 to avoid SMTP concurrency limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
        const batch = recipientEmails.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (email) => {
            try {
                await sendMailWithAntiSpam({
                    to: email,
                    subject: subject,
                    html: emailShell(body, `${title} — ${badgeText}`),
                    isBroadcast: true,
                });
                sentCount++;
            }
            catch (err) {
                console.error(`Failed to send broadcast email to ${email}:`, err);
                failedCount++;
            }
        }));
    }
    return { sentCount, failedCount };
};
exports.sendBroadcastEmail = sendBroadcastEmail;
//# sourceMappingURL=emailService.js.map