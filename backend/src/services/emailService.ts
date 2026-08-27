import transporter from "../config/mailer";
import path from "path";
import fs from "fs";

const YEAR = new Date().getFullYear();

// ─── Inline Brand Logo Attachment Resolver ────────────────────────────────────

function getLogoAttachment(): Array<{ filename: string; path: string; cid: string }> {
  const possiblePaths = [
    path.join(__dirname, "../assets/shajsutro-logo.png"),
    path.join(process.cwd(), "src/assets/shajsutro-logo.png"),
    path.join(process.cwd(), "dist/assets/shajsutro-logo.png"),
    path.join(process.cwd(), "../public/images/shajsutro-logo.png"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return [
        {
          filename: "shajsutro-logo.png",
          path: p,
          cid: "shajsutro_logo",
        },
      ];
    }
  }
  return [];
}

// ─── Anti-Spam Plain Text Stripper ─────────────────────────────────────────────

function stripHtmlToText(html: string): string {
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

// ─── Central Anti-Spam Email Delivery Helper ───────────────────────────────────

async function sendMailWithAntiSpam(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
  isBroadcast?: boolean;
}): Promise<void> {
  const senderEmail = (process.env.EMAIL_USER || "shajsutro@gmail.com").trim();
  const senderName = process.env.EMAIL_FROM_NAME || "ShajSutro";
  const fromHeader = `"${senderName}" <${senderEmail}>`;

  const plainText = options.text || stripHtmlToText(options.html);

  const headers: Record<string, string> = {
    "X-Mailer": "ShajSutro Notification System",
    "X-Priority": "1",
    Importance: "High",
  };

  if (options.isBroadcast) {
    headers["List-Unsubscribe"] = `<mailto:${senderEmail}?subject=unsubscribe>`;
    headers["Precedence"] = "bulk";
  }

  const attachments = options.attachments || getLogoAttachment();

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      replyTo: senderEmail,
      to: options.to,
      subject: options.subject,
      text: plainText,
      html: options.html,
      attachments,
      headers,
    });
    console.log(
      `[Email Service Success] Successfully sent to: ${options.to} | Message ID: ${info?.messageId}`,
    );
  } catch (err: any) {
    console.error(
      `[Email Service Error] Failed to dispatch email to ${options.to}:`,
      err?.message || err,
    );
    console.log(
      `[Email Fallback Info] Email intended for ${options.to} | Subject: "${options.subject}"`,
    );
  }
}

// ─── Shared Modern ShajSutro Email Shell ───────────────────────────────────────

function emailShell(bodyContent: string, previewText = ""): string {
  const frontendUrl = (process.env.FRONTEND_URL || "https://shajsutrov1.vercel.app").replace(/\/$/, "");
  const instagramUrl = "https://www.instagram.com/shaj.sitro?igsi=YTJsMXF6YTQzajl6";

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>ShajSutro — Happy Shopping</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader preview text -->
  ${
    previewText
      ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>`
      : ""
  }

  <!-- Canvas Container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">

          <!-- Top Brand Accent Bar (Emerald to Orange Gradient) -->
          <tr>
            <td style="background:linear-gradient(90deg, #00B14F 0%, #10B981 40%, #FF6200 100%);height:6px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── PROMINENT CENTERED LOGO HEADER (EMBEDDED CID ATTACHMENT) ── -->
          <tr>
            <td style="background:#ffffff;padding:40px 32px 30px;text-align:center;border-bottom:1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
                      <!-- Embedded CID Logo ensuring 100% visibility without external URL dependencies -->
                      <img 
                        src="cid:shajsutro_logo" 
                        alt="ShajSutro — Happy Shopping" 
                        width="340" 
                        style="display:block;margin:0 auto;max-width:340px;width:100%;height:auto;border:0;outline:none;" 
                      />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── MAIN CONTENT BODY ── -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 36px 28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- ── STORE VALUE PROPOSITIONS ── -->
          <tr>
            <td style="background-color:#f8fafc;padding:18px 32px;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width:33.33%;padding:4px;">
                    <p style="margin:0;font-size:16px;">🚚</p>
                    <p style="margin:2px 0 0;font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;">Fast Delivery</p>
                    <p style="margin:1px 0 0;font-size:10px;color:#64748b;">3-5 Days in BD</p>
                  </td>
                  <td align="center" style="width:33.33%;padding:4px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:16px;">✨</p>
                    <p style="margin:2px 0 0;font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;">100% Genuine</p>
                    <p style="margin:1px 0 0;font-size:10px;color:#64748b;">Quality Checked</p>
                  </td>
                  <td align="center" style="width:33.33%;padding:4px;">
                    <p style="margin:0;font-size:16px;">🔒</p>
                    <p style="margin:2px 0 0;font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;">Safe Payments</p>
                    <p style="margin:1px 0 0;font-size:10px;color:#64748b;">COD &amp; bKash/Nagad</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── NEED HELP BANNER ── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 20px;">
                <tr>
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:13px;font-weight:800;color:#166534;">💬 Need Any Assistance?</p>
                    <p style="margin:0;font-size:12px;color:#15803d;">We are here to support your shopping experience 7 days a week.</p>
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <a href="mailto:support@shajsutro.com" style="display:inline-block;background:#00B14F;color:#ffffff;font-size:11px;font-weight:900;letter-spacing:0.04em;text-decoration:none;padding:9px 18px;border-radius:100px;box-shadow:0 3px 8px rgba(0,177,79,0.25);">
                      Help Center
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding-bottom:14px;">
                    <a href="${frontendUrl}/shop" style="font-size:11px;color:#94a3b8;text-decoration:none;margin:0 8px;font-weight:700;">SHOP NOW</a>
                    <span style="color:#334155;font-size:11px;">•</span>
                    <a href="${frontendUrl}/track" style="font-size:11px;color:#94a3b8;text-decoration:none;margin:0 8px;font-weight:700;">TRACK ORDER</a>
                    <span style="color:#334155;font-size:11px;">•</span>
                    <a href="${instagramUrl}" target="_blank" style="font-size:11px;color:#f43f5e;text-decoration:none;margin:0 8px;font-weight:700;">INSTAGRAM</a>
                    <span style="color:#334155;font-size:11px;">•</span>
                    <a href="${frontendUrl}/privacy-policy" style="font-size:11px;color:#94a3b8;text-decoration:none;margin:0 8px;font-weight:700;">PRIVACY</a>
                    <span style="color:#334155;font-size:11px;">•</span>
                    <a href="${frontendUrl}/terms-of-service" style="font-size:11px;color:#94a3b8;text-decoration:none;margin:0 8px;font-weight:700;">TERMS</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0;font-size:11px;color:#64748b;line-height:1.6;">
                      &copy; ${YEAR} <strong style="color:#ffffff;">ShajSutro</strong> &bull; Happy Shopping.<br />
                      Dhaka, Bangladesh &bull; <a href="${frontendUrl}" style="color:#00B14F;text-decoration:none;font-weight:700;">shajsutrov1.vercel.app</a>
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

// ─── Ultra-Vibrant High-Contrast OTP Code Box ───────────────────────────────────

function otpBox(code: string, colorTheme: "green" | "orange" = "green"): string {
  const isGreen = colorTheme === "green";
  const primaryColor = isGreen ? "#00B14F" : "#FF6200";
  const bgLight = isGreen ? "#f0fdf4" : "#fff7ed";
  const borderTone = isGreen ? "#86efac" : "#fdba74";
  const badgeBg = isGreen ? "#dcfce7" : "#ffedd5";
  const badgeText = isGreen ? "#15803d" : "#c2410c";

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;">
  <tr>
    <td align="center">
      <div style="background:${bgLight};border:2.5px dashed ${primaryColor};border-radius:18px;padding:24px 32px;box-shadow:0 8px 24px rgba(0,0,0,0.04);text-align:center;max-width:360px;">
        <div style="display:inline-block;padding:4px 14px;background:${badgeBg};border:1px solid ${borderTone};border-radius:100px;margin-bottom:10px;">
          <span style="font-size:10px;font-weight:900;letter-spacing:0.15em;color:${badgeText};text-transform:uppercase;">⚡ 6-Digit Verification Code</span>
        </div>
        <p style="margin:0 0 10px;font-size:46px;font-weight:900;letter-spacing:14px;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${code}</p>
        <div style="display:inline-block;padding:3px 12px;background:#ffffff;border:1px solid #e2e8f0;border-radius:100px;">
          <span style="font-size:11px;color:#64748b;font-weight:700;">⏱️ Valid for 10 minutes</span>
        </div>
      </div>
    </td>
  </tr>
</table>
  `.trim();
}

// ─── Modern Step Card Row ───────────────────────────────────────────────────────

function stepCardRow(num: string, title: string, desc: string): string {
  return `
<tr>
  <td style="padding-bottom:8px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;">
      <tr>
        <td style="width:28px;vertical-align:middle;">
          <div style="width:26px;height:26px;border-radius:8px;background:#00B14F;color:#ffffff;font-size:12px;font-weight:900;line-height:26px;text-align:center;">
            ${num}
          </div>
        </td>
        <td style="padding-left:12px;vertical-align:middle;">
          <p style="margin:0;font-size:13px;font-weight:800;color:#0f172a;">${title}</p>
          <p style="margin:1px 0 0;font-size:12px;color:#64748b;line-height:1.4;">${desc}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
  `.trim();
}

// ─── Security Notice Box ────────────────────────────────────────────────────────

function securityNoticeBox(text: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
  <tr>
    <td style="background:#fffbeb;border-left:4px solid #FF6200;border-top:1px solid #fef3c7;border-right:1px solid #fef3c7;border-bottom:1px solid #fef3c7;border-radius:0 12px 12px 0;padding:12px 16px;">
      <p style="margin:0;font-size:12px;color:#9a3412;line-height:1.5;">
        <strong style="color:#c2410c;">🔒 Security Note:</strong> ${text}
      </p>
    </td>
  </tr>
</table>
  `.trim();
}

// ─── Send: Email Verification ─────────────────────────────────────────────────

export const sendVerificationEmail = async (
  email: string,
  code: string,
): Promise<void> => {
  const body = `
    <!-- Top Celebration Badge -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:5px 16px;background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:100px;margin-bottom:10px;">
        <span style="font-size:11px;font-weight:900;color:#047857;text-transform:uppercase;letter-spacing:0.1em;">✨ WELCOME TO SHAJSUTRO</span>
      </div>
      <h2 style="margin:4px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Verify Your Email Address</h2>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;max-width:440px;margin:0 auto;">
        Enter the passcode below to activate your account and start your happy shopping journey!
      </p>
    </div>

    <!-- Vibrant Code Box -->
    ${otpBox(code, "green")}

    <!-- 3 Quick Steps -->
    <p style="margin:0 0 10px;font-size:11px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">Quick Steps</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      ${stepCardRow("1", "Copy Code", "Copy the 6-digit code shown in the box above.")}
      ${stepCardRow("2", "Paste & Verify", "Paste it into the verification screen in your browser.")}
      ${stepCardRow("3", "Start Shopping", "Enjoy fast checkout and exclusive member deals.")}
    </table>

    <!-- Security Notice -->
    ${securityNoticeBox("Never share this code with anyone. If you didn't create a ShajSutro account, you can safely disregard this email.")}
  `;

  console.log(`[AUTH VERIFICATION OTP] Code for ${email}: ${code}`);

  await sendMailWithAntiSpam({
    to: email,
    subject: "Verify your ShajSutro account — Happy Shopping!",
    html: emailShell(
      body,
      "Your ShajSutro verification code is inside — valid for 10 minutes.",
    ),
  });
};

// ─── Send: Password Reset ─────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (
  email: string,
  code: string,
): Promise<void> => {
  console.log(`[AUTH RESET PASSWORD OTP] Code for ${email}: ${code}`);

  const body = `
    <!-- Top Badge & Title -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:5px 16px;background:#fff7ed;border:1.5px solid #fed7aa;border-radius:100px;margin-bottom:10px;">
        <span style="font-size:11px;font-weight:900;color:#c2410c;text-transform:uppercase;letter-spacing:0.1em;">🔒 PASSWORD RESET</span>
      </div>
      <h2 style="margin:4px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Reset Your Password</h2>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;max-width:440px;margin:0 auto;">
        We received a request to reset your password for <strong style="color:#0f172a;">${email}</strong>.
      </p>
    </div>

    <!-- Vibrant Code Box -->
    ${otpBox(code, "orange")}

    <!-- Reset Steps -->
    <p style="margin:0 0 10px;font-size:11px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">How to Complete</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      ${stepCardRow("1", "Copy Code", "Copy the 6-digit passcode shown above.")}
      ${stepCardRow("2", "Enter Code", "Paste the code in your password reset form.")}
      ${stepCardRow("3", "Set Password", "Choose a strong new password to protect your account.")}
    </table>

    <!-- Security Notice -->
    ${securityNoticeBox("If you didn't request a password reset, your account is completely safe and no action is required.")}
  `;

  await sendMailWithAntiSpam({
    to: email,
    subject: "Reset your ShajSutro password",
    html: emailShell(
      body,
      "Your ShajSutro password reset code is inside — valid for 10 minutes.",
    ),
  });
};

// ─── Send: Order Confirmation ──────────────────────────────────────────────────

export const sendOrderConfirmationEmail = async (
  recipientEmail: string,
  order: any,
): Promise<void> => {
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

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
    "Valued Customer";

  const paymentMethodLabel =
    order.paymentMethod === "bkash"
      ? "bKash"
      : order.paymentMethod === "nagad"
        ? "Nagad"
        : order.paymentMethod === "rocket"
          ? "Rocket"
          : "Cash on Delivery (COD)";

  const paymentStatusText =
    order.paymentStatus === "paid"
      ? `Paid ${order.txnId ? `(Txn: ${order.txnId})` : ""}`
      : order.paymentStatus === "refunded"
        ? "Refunded"
        : "Pending (COD / Verification)";

  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:14px;font-weight:800;color:#0f172a;">${item.name}</p>
              <p style="margin:3px 0 0;font-size:12px;color:#64748b;">
                ${item.size ? `Size: <strong style="color:#0f172a;">${item.size}</strong> &bull; ` : ""}
                ${item.color ? `Color: <strong style="color:#0f172a;">${item.color}</strong> &bull; ` : ""}
                Qty: <strong style="color:#00B14F;">${item.quantity}</strong>
              </p>
            </td>
            <td style="text-align:right;vertical-align:middle;font-size:15px;font-weight:900;color:#0f172a;">
              ৳${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `,
    )
    .join("");

  const frontendUrl = (process.env.FRONTEND_URL || "https://shajsutrov1.vercel.app").replace(/\/$/, "");

  const body = `
    <!-- Top Celebration Badge & Headline -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:6px 18px;background:linear-gradient(135deg, #00B14F 0%, #10B981 100%);border-radius:100px;margin-bottom:12px;box-shadow:0 4px 12px rgba(0,177,79,0.25);">
        <span style="font-size:11px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.12em;">🎉 ORDER CONFIRMED!</span>
      </div>
      <h2 style="margin:4px 0 6px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Thank You For Your Order!</h2>
      <p style="margin:0;font-size:14px;color:#64748b;">
        Order Ref: <strong style="color:#00B14F;font-family:monospace;font-size:15px;">#${orderId}</strong> &bull; ${dateStr}
      </p>
    </div>

    <!-- Visual Order Tracker -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;margin-bottom:24px;">
      <tr>
        <td align="center" style="width:33.33%;">
          <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#00B14F;color:#fff;font-size:11px;font-weight:900;line-height:24px;text-align:center;">✓</span>
          <p style="margin:4px 0 0;font-size:11px;font-weight:800;color:#00B14F;">Order Placed</p>
        </td>
        <td align="center" style="width:33.33%;border-left:2px solid #e2e8f0;border-right:2px solid #e2e8f0;">
          <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#FF6200;color:#fff;font-size:11px;font-weight:900;line-height:24px;text-align:center;">📦</span>
          <p style="margin:4px 0 0;font-size:11px;font-weight:800;color:#FF6200;">Processing</p>
        </td>
        <td align="center" style="width:33.33%;">
          <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#cbd5e1;color:#64748b;font-size:11px;font-weight:900;line-height:24px;text-align:center;">🚚</span>
          <p style="margin:4px 0 0;font-size:11px;font-weight:800;color:#64748b;">Delivery (3-5 Days)</p>
        </td>
      </tr>
    </table>

    <!-- Customer & Shipping Summary Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="vertical-align:top;width:50%;padding-right:10px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Customer Details</p>
          <p style="margin:0;font-size:14px;font-weight:800;color:#0f172a;">${customerName}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${recipientEmail}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">📞 ${order.shippingAddress?.phone || "N/A"}</p>
        </td>
        <td style="vertical-align:top;width:50%;padding-left:10px;border-left:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Shipping Address</p>
          <p style="margin:0;font-size:12px;color:#334155;line-height:1.4;">${order.shippingAddress?.address || ""}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">
            ${[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.zip].filter(Boolean).join(", ")}
          </p>
        </td>
      </tr>
    </table>

    <!-- Order Items List -->
    <p style="margin:0 0 8px;font-size:11px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.08em;">
      Ordered Items (${(order.items || []).length})
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${itemsHtml}
    </table>

    <!-- Financial Breakdown Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#64748b;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:700;color:#0f172a;">৳${(order.subtotal || 0).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#64748b;">Delivery Fee</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:800;color:#00B14F;">
          ${order.shippingCost === 0 ? "FREE" : `৳${(order.shippingCost || 0).toFixed(2)}`}
        </td>
      </tr>
      ${
        order.discount > 0
          ? `
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#FF6200;font-weight:700;">Promo Discount</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:800;color:#FF6200;">-৳${order.discount.toFixed(2)}</td>
      </tr>
      `
          : ""
      }
      <tr>
        <td style="padding:10px 0 0;border-top:1px solid #e2e8f0;font-size:16px;font-weight:900;color:#0f172a;">Total Payable</td>
        <td style="padding:10px 0 0;border-top:1px solid #e2e8f0;text-align:right;font-size:20px;font-weight:900;color:#00B14F;">
          ৳${(order.total || 0).toFixed(2)}
        </td>
      </tr>
    </table>

    <!-- Payment Badge -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:12px 16px;">
          <p style="margin:0 0 2px;font-size:10px;font-weight:900;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;">Payment Details</p>
          <p style="margin:0;font-size:12px;color:#166534;font-weight:600;">
            Method: <strong>${paymentMethodLabel}</strong> &bull; Status: <strong>${paymentStatusText}</strong>
          </p>
        </td>
      </tr>
    </table>

    <!-- Track Order Action Button -->
    <div style="text-align:center;margin-top:28px;">
      <a href="${frontendUrl}/track" style="display:inline-block;background:linear-gradient(135deg, #00B14F 0%, #059669 100%);color:#ffffff;font-size:13px;font-weight:900;letter-spacing:0.08em;text-decoration:none;padding:15px 36px;border-radius:100px;box-shadow:0 10px 24px rgba(0,177,79,0.35);text-transform:uppercase;">
        TRACK YOUR ORDER &rarr;
      </a>
    </div>
  `;

  try {
    await sendMailWithAntiSpam({
      to: recipientEmail,
      subject: `🎉 Order Confirmed #${orderId} — ShajSutro`,
      html: emailShell(
        body,
        `Your ShajSutro order #${orderId} for ৳${(order.total || 0).toFixed(2)} has been placed successfully!`,
      ),
    });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
};

// ─── Send: Newsletter Welcome Email ──────────────────────────────────────────

export const sendNewsletterWelcomeEmail = async (
  email: string,
): Promise<void> => {
  const frontendUrl = (process.env.FRONTEND_URL || "https://shajsutrov1.vercel.app").replace(/\/$/, "");

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:6px 18px;background:linear-gradient(135deg, #FF6200 0%, #EA580C 100%);border-radius:100px;margin-bottom:12px;box-shadow:0 4px 12px rgba(255,98,0,0.25);">
        <span style="font-size:11px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.12em;">🎉 WELCOME TO CLUB</span>
      </div>
      <h2 style="margin:4px 0 8px;font-size:26px;font-weight:900;color:#0f172a;">Welcome to ShajSutro!</h2>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;max-width:440px;margin:0 auto;">
        You're officially on our list for exclusive drops, early flash sale alerts, and private discounts!
      </p>
    </div>

    <!-- Exclusive VIP Voucher Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:2px dashed #FF6200;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
      <tr>
        <td align="center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:900;color:#c2410c;text-transform:uppercase;letter-spacing:0.1em;">Special Welcome Gift</p>
          <p style="margin:0 0 8px;font-size:20px;font-weight:900;color:#ea580c;">ENJOY 10% OFF YOUR FIRST ORDER</p>
          <div style="display:inline-block;padding:6px 20px;background:#ffffff;border:1.5px solid #fdba74;border-radius:8px;">
            <span style="font-family:monospace;font-size:16px;font-weight:900;color:#0f172a;letter-spacing:2px;">WELCOME10</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Call to action button -->
    <div style="text-align:center;margin-top:24px;">
      <a href="${frontendUrl}/shop" style="display:inline-block;background:linear-gradient(135deg, #00B14F 0%, #059669 100%);color:#ffffff;font-size:13px;font-weight:900;letter-spacing:0.08em;text-decoration:none;padding:15px 36px;border-radius:100px;box-shadow:0 10px 24px rgba(0,177,79,0.3);text-transform:uppercase;">
        START SHOPPING NOW &rarr;
      </a>
    </div>
  `;

  try {
    await sendMailWithAntiSpam({
      to: email,
      subject: "🎉 Welcome to ShajSutro — Here's 10% OFF!",
      html: emailShell(
        body,
        "Welcome to ShajSutro! You are now subscribed to VIP updates & offers.",
      ),
    });
  } catch (err) {
    console.error("Failed to send newsletter welcome email:", err);
  }
};

// ─── Send: Broadcast Promotional Email ───────────────────────────────────────

export interface IBroadcastMailPayload {
  recipientEmails: string[];
  subject: string;
  badgeText?: string;
  title: string;
  messageBody: string;
  bannerImageUrl?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
}

export const sendBroadcastEmail = async (
  payload: IBroadcastMailPayload,
): Promise<{ sentCount: number; failedCount: number }> => {
  const {
    recipientEmails,
    subject,
    badgeText = "SPECIAL OFFER",
    title,
    messageBody,
    bannerImageUrl,
    ctaButtonText = "SHOP THE SALE NOW",
    ctaButtonUrl = "https://shajsutrov1.vercel.app/shop",
  } = payload;

  const formattedMessage = messageBody
    .split("\n")
    .filter((p) => p.trim())
    .map(
      (p) =>
        `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.7;">${p.trim()}</p>`,
    )
    .join("");

  const body = `
    <!-- Header Badge & Title -->
    <div style="text-align:center;margin-bottom:24px;">
      ${
        badgeText
          ? `
      <div style="display:inline-block;padding:6px 18px;background:linear-gradient(135deg, #FF6200 0%, #EA580C 100%);border-radius:100px;margin-bottom:12px;box-shadow:0 4px 12px rgba(255,98,0,0.25);">
        <span style="font-size:11px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.15em;">🔥 ${badgeText}</span>
      </div>
      `
          : ""
      }
      <h2 style="margin:4px 0 8px;font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;line-height:1.25;">${title}</h2>
      <div style="width:56px;height:4px;background:linear-gradient(90deg, #00B14F, #FF6200);margin:0 auto;border-radius:100px;"></div>
    </div>

    <!-- Banner Image Poster (if provided) -->
    ${
      bannerImageUrl
        ? `
    <div style="margin-bottom:24px;border-radius:16px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
      <img src="${bannerImageUrl}" alt="${title}" style="width:100%;max-height:320px;object-fit:cover;display:block;border:0;" />
    </div>
    `
        : ""
    }

    <!-- Main Message Content Box with Emerald Accent -->
    <div style="background:#f8fafc;border-left:4px solid #00B14F;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 16px 16px 0;padding:22px 24px;margin-bottom:24px;">
      ${formattedMessage}
    </div>

    <!-- High-Converting Call-To-Action Button -->
    ${
      ctaButtonText && ctaButtonUrl
        ? `
    <div style="text-align:center;margin-top:28px;margin-bottom:8px;">
      <a href="${ctaButtonUrl}" style="display:inline-block;background:linear-gradient(135deg, #FF6200 0%, #EA580C 100%);color:#ffffff;font-size:14px;font-weight:900;letter-spacing:0.12em;text-decoration:none;padding:16px 40px;border-radius:100px;box-shadow:0 10px 24px rgba(255,98,0,0.35);text-transform:uppercase;">
        ${ctaButtonText} &rarr;
      </a>
    </div>
    `
        : ""
    }
  `;

  let sentCount = 0;
  let failedCount = 0;

  // Process in batches of 5 to avoid SMTP concurrency limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
    const batch = recipientEmails.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (email) => {
        try {
          await sendMailWithAntiSpam({
            to: email,
            subject: subject,
            html: emailShell(body, `${title} — ${badgeText}`),
            isBroadcast: true,
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send broadcast email to ${email}:`, err);
          failedCount++;
        }
      }),
    );
  }

  return { sentCount, failedCount };
};


