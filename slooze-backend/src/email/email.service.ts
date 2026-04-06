import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as brevo from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {}

  async sendOtpEmail(to: string, displayName: string, otp: string): Promise<void> {
    // Always log OTP as a reliable server-side fallback
    this.logger.log('=============================================');
    this.logger.log(`OTP GENERATED FOR : ${to}`);
    this.logger.log(`OTP CODE          : ${otp}`);
    this.logger.log('=============================================');

    const apiKey = process.env.EMAIL_TOKEN || this.config.get<string>('EMAIL_TOKEN');
    const senderEmail = process.env.BREVO_USER || this.config.get<string>('BREVO_USER') || 'a741bc001@smtp-brevo.com';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Slooze OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background-color:#1a1d27;border-radius:16px;overflow:hidden;border:1px solid #2a2d3a;">
          <tr>
            <td style="background:linear-gradient(135deg,#ea580c,#f97316,#fb923c);padding:36px 40px 28px;">
              <p style="margin:0;color:#fff;font-weight:800;font-size:22px;">Slooze</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:24px;font-weight:700;">Your login code</p>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Use this OTP to complete sign-in</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;">Hi <strong style="color:#f3f4f6;">${displayName}</strong>,</p>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">
                Someone requested a sign-in to your Slooze account. Use the code below &mdash; it expires in <strong style="color:#f97316;">10 minutes</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#0f1117;border:2px dashed #ea580c;border-radius:12px;padding:28px 20px;">
                    <p style="margin:0 0 6px;color:#6b7280;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">One-Time Password</p>
                    <p style="margin:0;color:#f97316;font-size:48px;font-weight:800;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#4b5563;font-size:13px;line-height:1.8;">
                &bull; Valid for <strong style="color:#6b7280;">10 minutes</strong><br/>
                &bull; Never share this code with anyone<br/>
                &bull; If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2d3a;">
              <p style="margin:0;color:#374151;font-size:12px;text-align:center;">
                &copy; 2024 Slooze &middot; Role-based Food Ordering Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey || '');

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `${otp} is your Slooze login code`;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { name: "Slooze", email: senderEmail };
      sendSmtpEmail.to = [{ email: to, name: displayName }];

      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email delivered using SDK successfully!`);
    } catch (err: any) {
      this.logger.error(`Failed to call Brevo API. OTP is visible in logs above.`, err.response?.text || err);
    }
  }
}
