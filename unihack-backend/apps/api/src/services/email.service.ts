/**
 * Brevo (Sendinblue) Email & OTP Security Service
 * Handles transactional emails, 2FA OTP codes, signup verifications, and notifications.
 */

interface BrevoEmailRecipient {
  email: string;
  name?: string;
}

interface BrevoSendPayload {
  sender: {
    name: string;
    email: string;
  };
  to: BrevoEmailRecipient[];
  subject: string;
  htmlContent: string;
}

export type OtpPurpose = 'signup_verification' | 'login_2fa' | 'password_reset';

interface OtpRecord {
  otp: string;
  purpose: OtpPurpose;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

class EmailService {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private otpStore = new Map<string, OtpRecord>();

  constructor() {
    this.apiKey = (process.env.BREVO_API_KEY || '').trim();
    this.senderEmail = (process.env.BREVO_SENDER_EMAIL || 'vinaybhadane06@gmail.com').trim();
    this.senderName = (process.env.BREVO_SENDER_NAME || 'CatalogForge Security').trim();
  }

  /**
   * Generates a 6-digit numeric OTP code
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Stores an OTP record with 10-minute expiry
   */
  storeOtp(email: string, purpose: OtpPurpose, otp: string): void {
    const key = `${email.toLowerCase().trim()}:${purpose}`;
    this.otpStore.set(key, {
      otp,
      purpose,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      verified: false,
    });
  }

  /**
   * Validates an OTP code
   */
  verifyOtp(email: string, purpose: OtpPurpose, inputOtp: string): { valid: boolean; reason?: string } {
    const key = `${email.toLowerCase().trim()}:${purpose}`;
    const record = this.otpStore.get(key);

    if (!record) {
      return { valid: false, reason: 'No verification code found. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      return { valid: false, reason: 'Verification code has expired. Please request a new code.' };
    }

    if (record.attempts >= 5) {
      this.otpStore.delete(key);
      return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' };
    }

    record.attempts += 1;

    // Check OTP match (allow master test code 999888 in local development if needed)
    const cleanInput = inputOtp.trim();
    if (record.otp === cleanInput || (process.env.NODE_ENV !== 'production' && cleanInput === '999888')) {
      record.verified = true;
      this.otpStore.delete(key);
      return { valid: true };
    }

    return { valid: false, reason: 'Invalid 6-digit verification code. Please check and try again.' };
  }

  /**
   * Sends transactional email via Brevo API v3
   */
  async sendEmail(toEmail: string, toName: string | undefined, subject: string, htmlContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const payload: BrevoSendPayload = {
      sender: {
        name: this.senderName,
        email: this.senderEmail,
      },
      to: [
        {
          email: toEmail.trim(),
          name: toName || toEmail.split('@')[0],
        },
      ],
      subject,
      htmlContent,
    };

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;

      if (!res.ok) {
        console.warn(`[Brevo Email Service] API notice for ${toEmail}:`, data?.message || res.statusText);
        return {
          success: false,
          error: data?.message || `Brevo API HTTP ${res.status}`,
        };
      }

      return {
        success: true,
        messageId: data?.messageId,
      };
    } catch (err: any) {
      console.warn(`[Brevo Email Service] Network warning:`, err?.message);
      return {
        success: false,
        error: err?.message || 'Network error communicating with Brevo',
      };
    }
  }

  /**
   * Sends 6-digit OTP verification email for Sign Up or 2FA Login
   */
  async sendOtpEmail(
    email: string,
    purpose: OtpPurpose,
    recipientName?: string
  ): Promise<{ success: boolean; otp: string; emailSent: boolean; error?: string }> {
    const otp = this.generateOtp();
    this.storeOtp(email, purpose, otp);

    const titleMap: Record<OtpPurpose, string> = {
      signup_verification: 'Verify Your Email Address',
      login_2fa: 'Two-Factor Authentication Code',
      password_reset: 'Reset Your Account Password',
    };

    const subtitleMap: Record<OtpPurpose, string> = {
      signup_verification: 'Thank you for registering with CatalogForge. Please enter this verification code to activate your account and access your enterprise catalog workspace.',
      login_2fa: 'A sign-in attempt was initiated for your CatalogForge account. Enter the 6-digit security code below to complete authentication.',
      password_reset: 'A password change request was received for your CatalogForge account. Enter the code below to reset your password.',
    };

    const subject = `Your CatalogForge Verification Code: ${otp}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 15px; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0b0f17; padding: 24px 30px; text-align: center; border-bottom: 2px solid #2563eb;">
              <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                <span style="color: #38bdf8;">Catalog</span><span style="color: #ffffff;">Forge</span>
              </span>
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                Enterprise Security Verification
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                ${titleMap[purpose]}
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 24px;">
                ${subtitleMap[purpose]}
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                  Your 6-Digit One-Time Code
                </span>
                <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #0f172a; font-family: monospace; display: block;">
                  ${otp}
                </span>
              </div>

              <!-- Security Notice -->
              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
                ⏱️ <strong>This code is valid for 10 minutes.</strong><br>
                🛡️ For your security, never share this code with anyone. CatalogForge staff will never ask for your verification code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              Sent by CatalogForge Security Operations • Brevo SMTP Engine<br>
              Authorized Sender: vinaybhadane06@gmail.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sendRes = await this.sendEmail(email, recipientName, subject, htmlContent);

    return {
      success: true,
      otp,
      emailSent: sendRes.success,
      error: sendRes.error,
    };
  }
}

export const emailService = new EmailService();
