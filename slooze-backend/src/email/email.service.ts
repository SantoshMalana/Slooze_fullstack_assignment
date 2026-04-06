import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // STARTTLS on port 587
      auth: {
        user: this.config.get<string>('BREVO_USER'),   // your Brevo login email
        pass: this.config.get<string>('BREVO_SMTP_KEY'), // SMTP key from Brevo dashboard
      },
    });
  }

  async sendOtpEmail(to: string, displayName: string, otp: string): Promise<void> {
    // Always log OTP to server console as a reliable dev fallback
    this.logger.log('=============================================');
    this.logger.log(`OTP GENERATED FOR : ${to}`);
    this.logger.log(`OTP CODE          : ${otp}`);
    this.logger.log('=============================================');

    const html = `
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

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ea580c,#f97316,#fb923c);padding:36px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.2);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                          <span style="color:#fff;font-weight:800;font-size:18px;line-height:40px;">S</span>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="color:#fff;font-weight:700;font-size:20px;letter-spacing:-0.5px;">Slooze</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0;color:rgba(255,255,255,0.9);font-size:28px;font-weight:700;line-height:1.2;">
                      Your login code
                    </p>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">
                      Use this OTP to complete sign-in
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;">Hi <strong style="color:#f3f4f6;">${displayName}</strong>,</p>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">
                Someone requested a sign-in to your Slooze account. Use the code below &mdash; it expires in <strong style="color:#f97316;">10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#0f1117;border:2px dashed #ea580c;border-radius:12px;padding:28px 20px;">
                    <p style="margin:0 0 6px;color:#6b7280;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">One-Time Password</p>
                    <p style="margin:0;color:#f97316;font-size:48px;font-weight:800;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background-color:#1c1400;border:1px solid #713f12;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0;color:#fbbf24;font-size:13px;line-height:1.5;">
                      If you did not request this, please ignore this email. Your account is safe.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tips -->
              <p style="margin:28px 0 0;color:#4b5563;font-size:13px;line-height:1.8;">
                &bull; This code is valid for <strong style="color:#6b7280;">10 minutes</strong><br/>
                &bull; Never share this code with anyone<br/>
                &bull; Slooze will never ask for your OTP via phone or chat
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2d3a;">
              <p style="margin:0;color:#374151;font-size:12px;text-align:center;">
                &copy; 2024 Slooze &middot; Role-based Food Ordering Platform<br/>
                <span style="color:#1f2937;">This is an automated message &mdash; please do not reply.</span>
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
      const info = await this.transporter.sendMail({
        from: `"Slooze" <${this.config.get('BREVO_USER')}>`,
        to,
        subject: `${otp} is your Slooze login code`,
        html,
      });
      this.logger.log(`Email delivered successfully. MessageId: ${info.messageId}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}. OTP is visible in logs above.`, err);
    }
  }
}
