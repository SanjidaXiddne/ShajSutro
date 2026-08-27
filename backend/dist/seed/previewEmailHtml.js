"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Mock email generator for preview
const YEAR = new Date().getFullYear();
function generatePreviewHtml(code = "482910", email = "customer@shajsutro.com") {
    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ShajSutro Email Preview</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

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

              <!-- Step Timeline Instructions -->
              <p style="margin:0 0 16px;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.1em;">Simple Verification Steps</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 18px;">
                      <tr>
                        <td style="width:36px;vertical-align:middle;">
                          <div style="width:32px;height:32px;border-radius:10px;background:#0f172a;color:#f59e0b;font-size:13px;font-weight:800;line-height:32px;text-align:center;">01</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">Copy Passcode</p>
                          <p style="margin:2px 0 0;font-size:12px;color:#64748b;line-height:1.5;">Copy the 6-digit security code displayed above.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 18px;">
                      <tr>
                        <td style="width:36px;vertical-align:middle;">
                          <div style="width:32px;height:32px;border-radius:10px;background:#0f172a;color:#f59e0b;font-size:13px;font-weight:800;line-height:32px;text-align:center;">02</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">Return to Browser</p>
                          <p style="margin:2px 0 0;font-size:12px;color:#64748b;line-height:1.5;">Switch back to the ShajSutro sign-up page.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 18px;">
                      <tr>
                        <td style="width:36px;vertical-align:middle;">
                          <div style="width:32px;height:32px;border-radius:10px;background:#0f172a;color:#f59e0b;font-size:13px;font-weight:800;line-height:32px;text-align:center;">03</div>
                        </td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">Paste & Verify</p>
                          <p style="margin:2px 0 0;font-size:12px;color:#64748b;line-height:1.5;">Enter the code in the verification screen and submit.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="background:#fffbeb;border-left:4px solid #f59e0b;border-top:1px solid #fef3c7;border-right:1px solid #fef3c7;border-bottom:1px solid #fef3c7;border-radius:0 12px 12px 0;padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#92400e;line-height:1.6;">
                      <strong style="color:#b45309;">🔒 Security Notice:</strong> ShajSutro will never request your password or confidential details over email. If you did not sign up for an account, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
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
                    <a href="#" style="font-size:11px;color:#a1a1aa;text-decoration:none;margin:0 12px;font-weight:500;">Privacy Policy</a>
                    <span style="color:#3f3f46;font-size:11px;">•</span>
                    <a href="#" style="font-size:11px;color:#a1a1aa;text-decoration:none;margin:0 12px;font-weight:500;">Terms of Service</a>
                    <span style="color:#3f3f46;font-size:11px;">•</span>
                    <a href="#" style="font-size:11px;color:#a1a1aa;text-decoration:none;margin:0 12px;font-weight:500;">Unsubscribe</a>
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
const html = generatePreviewHtml();
const targetPath = path_1.default.join(process.cwd(), "src", "seed", "email_preview.html");
fs_1.default.writeFileSync(targetPath, html);
console.log("✓ Saved email preview to:", targetPath);
//# sourceMappingURL=previewEmailHtml.js.map