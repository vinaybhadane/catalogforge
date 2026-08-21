/**
 * Resend Email & OTP Security Service
 * Handles transactional emails, 2FA OTP codes, signup verifications, and batch notifications.
 * Powered by Resend (https://resend.com)
 */

import { Resend } from 'resend';
import { env } from '../config/env';

export type OtpPurpose = 'signup_verification' | 'login_2fa' | 'password_reset';

interface OtpRecord {
  otp: string;
  purpose: OtpPurpose;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

class EmailService {
  private otpStore = new Map<string, OtpRecord>();

  /**
   * Retrieves the configured Resend API key dynamically from environment
   */
  private getApiKey(): string {
    return (
      process.env.RESEND_API_KEY ||
      (env as any).RESEND_API_KEY ||
      ''
    ).trim();
  }

  /**
   * Retrieves the configured Resend sender address
   */
  private getSender(): string {
    return (
      process.env.RESEND_SENDER_EMAIL ||
      (env as any).RESEND_SENDER_EMAIL ||
      'CatalogForge Security <onboarding@resend.dev>'
    ).trim();
  }

  /**
   * Generates a secure 6-digit numeric OTP code
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

    // Check OTP match (allow master test code 999888 in non-production if needed)
    const cleanInput = inputOtp.trim();
    if (record.otp === cleanInput || (process.env.NODE_ENV !== 'production' && cleanInput === '999888')) {
      record.verified = true;
      this.otpStore.delete(key);
      return { valid: true };
    }

    return { valid: false, reason: 'Invalid 6-digit verification code. Please check and try again.' };
  }

  /**
   * Sends transactional email via Resend API
   */
  async sendEmail(
    toEmail: string,
    toName: string | undefined,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = this.getApiKey();
    const sender = this.getSender();

    if (!apiKey) {
      console.warn(
        `[Resend Email Service] No RESEND_API_KEY configured. Email to ${toEmail} skipped.`
      );
      return {
        success: false,
        error: 'RESEND_API_KEY is not configured in backend environment.',
      };
    }

    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: sender,
        to: [toEmail.trim()],
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      });

      if (error) {
        console.warn(`[Resend Email Service] Error delivering to ${toEmail}:`, error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      console.log(`[Resend Email Service] Successfully delivered email to ${toEmail} (ID: ${data?.id})`);
      return {
        success: true,
        messageId: data?.id,
      };
    } catch (err: any) {
      console.error(`[Resend Email Service] Exception sending to ${toEmail}:`, err.message);
      return {
        success: false,
        error: err?.message || 'Failed to dispatch email via Resend API',
      };
    }
  }

  /**
   * Generates and emails a 6-digit OTP code using Resend
   */
  async sendOtpEmail(
    email: string,
    purpose: OtpPurpose = 'login_2fa',
    recipientName?: string
  ): Promise<{ success: boolean; otp: string; emailSent: boolean; error?: string }> {
    const otp = this.generateOtp();
    this.storeOtp(email, purpose, otp);

    const subjectMap: Record<OtpPurpose, string> = {
      signup_verification: `[CatalogForge] Verify Your Account — Security Code: ${otp}`,
      login_2fa: `[CatalogForge] 2FA Login Security Code: ${otp}`,
      password_reset: `[CatalogForge] Password Reset Code: ${otp}`,
    };

    const titleMap: Record<OtpPurpose, string> = {
      signup_verification: 'Verify Your Email Address',
      login_2fa: 'Two-Factor Authentication Required',
      password_reset: 'Reset Your Password',
    };

    const subtitleMap: Record<OtpPurpose, string> = {
      signup_verification: `Hello ${recipientName || 'there'}, use the 6-digit security code below to activate your CatalogForge account.`,
      login_2fa: `A login request was initiated for your CatalogForge workspace account (${email}). Enter the code below to authorize access.`,
      password_reset: `We received a password reset request for your account (${email}). Use the code below to proceed.`,
    };

    const subject = subjectMap[purpose];

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
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
              Sent by CatalogForge Security Operations • Resend Cloud Infrastructure<br>
              Authorized Sender: onboarding@resend.dev
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

  /**
   * Sends rich completion notification email with interactive direct link to extracted batch dataset
   */
  async sendBatchExtractionCompleteEmail(
    toEmail: string,
    batchId: string,
    fileName: string,
    totalRows: number,
    processedCount: number,
    productsSummary: Array<{
      partNumber: string;
      mfg: string;
      brand?: string | null;
      title: string;
      imageCount: number;
      docCount: number;
      filledColumns: number;
    }>,
    recipientName?: string,
    appBaseUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    const baseUrl = (appBaseUrl || process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const reviewUrl = `${baseUrl}/upload?batchId=${batchId}`;

    const totalImages = productsSummary.reduce((acc, p) => acc + (p.imageCount || 0), 0);
    const totalDocs = productsSummary.reduce((acc, p) => acc + (p.docCount || 0), 0);

    const subject = `[CatalogForge] Your process has been done: ${fileName} (${processedCount} Products Ready)`;

    const productRowsHtml = productsSummary
      .slice(0, 6)
      .map(
        (p, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9; font-size: 12px;">
          <td style="padding: 10px 8px; font-weight: 700; color: #0f172a; font-family: monospace;">#${idx + 1} ${p.partNumber}</td>
          <td style="padding: 10px 8px; color: #475569;">${p.mfg || 'OEM'}${p.brand ? ` (${p.brand})` : ''}</td>
          <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: #2563eb;">${p.imageCount} imgs / ${p.docCount} pdfs</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #059669;">${p.filledColumns}/252 cols</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0b0f17; padding: 26px 32px; text-align: left; border-bottom: 2px solid #2563eb;">
              <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                <span style="color: #38bdf8;">Catalog</span><span style="color: #ffffff;">Forge</span>
              </span>
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                Catalog Intelligence Notification
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 4px 12px; font-size: 11px; font-weight: 800; color: #065f46; text-transform: uppercase; margin-bottom: 16px;">
                ✓ Batch Enrichment Complete
              </div>

              <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.5px;">
                Your process has been done!
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hello ${recipientName || 'there'}, your batch file <strong>${fileName}</strong> has completed 8-stage Tier-1 OEM intelligence extraction and 252-column schema compilation.
              </p>

              <!-- Metrics Summary Cards -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="32%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 12px; text-align: center;">
                    <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${processedCount}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">Enriched SKUs</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 12px; text-align: center;">
                    <div style="font-size: 22px; font-weight: 900; color: #2563eb;">${totalImages}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">OEM CDN Photos</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 12px; text-align: center;">
                    <div style="font-size: 22px; font-weight: 900; color: #059669;">${totalDocs}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px;">Verified PDFs</div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${reviewUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                      Inspect &amp; Export Batch Products →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Product Preview List -->
              <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin: 0 0 12px 0;">
                Extracted Products Sample
              </h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">
                  <th style="padding: 10px 8px; text-align: left;">Part Number</th>
                  <th style="padding: 10px 8px; text-align: left;">Brand / Mfg</th>
                  <th style="padding: 10px 8px; text-align: center;">Assets</th>
                  <th style="padding: 10px 8px; text-align: right;">Coverage</th>
                </tr>
                ${productRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              CatalogForge Enterprise Intelligence Platform • Powered by Resend<br>
              Direct Review URL: <a href="${reviewUrl}" style="color: #2563eb; text-decoration: none;">${reviewUrl}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail(toEmail, recipientName, subject, htmlContent);
  }

  /**
   * Sends rich invitation email for new team members joining an enterprise workspace
   */
  async sendTeamInvitationEmail(params: {
    toEmail: string;
    recipientName?: string;
    inviterName?: string;
    inviterEmail?: string;
    role: string;
    department?: string;
    inviteToken: string;
    appBaseUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const baseUrl = (params.appBaseUrl || process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const acceptUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(params.inviteToken)}&email=${encodeURIComponent(params.toEmail)}`;

    const subject = `[CatalogForge] Invitation to join enterprise workspace as ${params.role}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #0b0f17; padding: 26px 32px; text-align: left; border-bottom: 2px solid #2563eb;">
              <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                <span style="color: #38bdf8;">Catalog</span><span style="color: #ffffff;">Forge</span>
              </span>
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                Workspace Invitation
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0;">
                You're invited to join CatalogForge
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Hello ${params.recipientName || 'there'}, ${params.inviterName || 'An administrator'} (${params.inviterEmail || 'admin'}) has invited you to collaborate on the CatalogForge platform as <strong>${params.role}</strong>${params.department ? ` in the ${params.department} team` : ''}.
              </p>
              <table width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${acceptUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                      Accept Invitation &amp; Join Workspace →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #64748b;">
                Or copy and paste this direct link into your browser:<br>
                <a href="${acceptUrl}" style="color: #2563eb; word-break: break-all;">${acceptUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail(params.toEmail, params.recipientName, subject, htmlContent);
  }
}

export const emailService = new EmailService();
