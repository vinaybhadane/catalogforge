/**
 * Brevo (Sendinblue) Email & OTP Security Service
 * Handles transactional emails, 2FA OTP codes, signup verifications, and notifications.
 */

import { env } from '../config/env';

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
  replyTo?: {
    name: string;
    email: string;
  };
  subject: string;
  htmlContent: string;
  textContent?: string;
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
  private otpStore = new Map<string, OtpRecord>();

  /**
   * Retrieves the configured Brevo API key dynamically from environment
   */
  private getApiKey(): string {
    return (process.env.BREVO_API_KEY || (env as any).BREVO_API_KEY || '').trim();
  }

  /**
   * Retrieves the configured Brevo sender email
   */
  private getSenderEmail(): string {
    return (process.env.BREVO_SENDER_EMAIL || (env as any).BREVO_SENDER_EMAIL || 'vinaybhadane06@gmail.com').trim();
  }

  /**
   * Retrieves the configured Brevo sender name
   */
  private getSenderName(): string {
    return (process.env.BREVO_SENDER_NAME || (env as any).BREVO_SENDER_NAME || 'CatalogForge Security').trim();
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
   * Sends transactional email via Brevo API v3 using the single fixed API key
   */
  async sendEmail(
    toEmail: string,
    toName: string | undefined,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = this.getApiKey();
    const senderEmail = this.getSenderEmail();
    const senderName = this.getSenderName();

    if (!apiKey) {
      console.warn(
        `[Brevo Email Service] No BREVO_API_KEY configured in unihack-backend/.env. Email to ${toEmail} skipped. Please define BREVO_API_KEY to send live emails.`
      );
      return {
        success: false,
        error: 'BREVO_API_KEY is not configured in backend environment.',
      };
    }

    const payload: BrevoSendPayload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: toEmail.trim(),
          name: toName || toEmail.split('@')[0],
        },
      ],
      replyTo: {
        name: 'CatalogForge Support',
        email: senderEmail,
      },
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    };

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;

      if (!res.ok) {
        const errorMsg = data?.message || res.statusText || `HTTP ${res.status}`;
        console.warn(`[Brevo Email Service] API notice for ${toEmail} [HTTP ${res.status}]:`, errorMsg);

        // Help diagnose Brevo unauthorized IP or key issues
        if (res.status === 401 || String(errorMsg).toLowerCase().includes('unauthorized')) {
          console.warn(
            `[Brevo Email Service] Brevo reported unauthorized API key or IP restriction. Please verify your BREVO_API_KEY in .env and check "Authorized IPs" in Brevo Dashboard (SMTP & API > API Keys).`
          );
        }

        return {
          success: false,
          error: errorMsg,
        };
      }

      console.log(`[Brevo Email Service] Email successfully sent to ${toEmail} (MessageId: ${data?.messageId})`);
      return {
        success: true,
        messageId: data?.messageId,
      };
    } catch (err: any) {
      console.warn(`[Brevo Email Service] Network communication error:`, err?.message);
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
    appBaseUrl?: string,
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
      `,
      )
      .join('');

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
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0b0f17; padding: 24px 30px; text-align: center; border-bottom: 3px solid #2563eb;">
              <span style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                <span style="color: #38bdf8;">Catalog</span><span style="color: #ffffff;">Forge</span>
              </span>
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
                Live Product Intelligence Engine
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                ✓ Process Completed Successfully
              </div>
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                Your process has been done — you can now check your dataset!
              </h2>
              <p style="font-size: 13px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 22px;">
                Hello${recipientName ? ` <strong>${recipientName}</strong>` : ''}, your dataset processing job for <strong>"${fileName}"</strong> (${totalRows} total rows) has completed. All authentic OEM product photos, technical PDF datasheets, warranty terms, and complete 252-column schemas are processed and ready. You can now check and inspect your catalog.
              </p>

              <!-- Metrics Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; text-align: center;">
                <tr>
                  <td style="padding: 16px 10px; border-right: 1px solid #e2e8f0; width: 25%;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Enriched</div>
                    <div style="font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 2px;">${processedCount}</div>
                    <div style="font-size: 10px; color: #059669;">Products</div>
                  </td>
                  <td style="padding: 16px 10px; border-right: 1px solid #e2e8f0; width: 25%;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Photos</div>
                    <div style="font-size: 20px; font-weight: 900; color: #2563eb; margin-top: 2px;">${totalImages}</div>
                    <div style="font-size: 10px; color: #2563eb;">CDN Images</div>
                  </td>
                  <td style="padding: 16px 10px; border-right: 1px solid #e2e8f0; width: 25%;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">PDFs</div>
                    <div style="font-size: 20px; font-weight: 900; color: #7c3aed; margin-top: 2px;">${totalDocs}</div>
                    <div style="font-size: 10px; color: #7c3aed;">Datasheets</div>
                  </td>
                  <td style="padding: 16px 10px; width: 25%;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Schema</div>
                    <div style="font-size: 20px; font-weight: 900; color: #059669; margin-top: 2px;">252</div>
                    <div style="font-size: 10px; color: #059669;">Unihack Columns</div>
                  </td>
                </tr>
              </table>

              <!-- Processed Products Preview Table -->
              <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                Extracted Products Overview
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 8px; text-align: left;">Part Number</th>
                  <th style="padding: 8px; text-align: left;">Manufacturer</th>
                  <th style="padding: 8px; text-align: center;">Assets</th>
                  <th style="padding: 8px; text-align: right;">Columns</th>
                </tr>
                ${productRowsHtml}
              </table>

              <!-- Big Call to Action -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${reviewUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 800; display: inline-block; box-shadow: 0 4px 10px rgba(37,99,235,0.25);">
                  Check Your Processed Dataset Now →
                </a>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 11px; color: #64748b; word-break: break-all;">
                <strong>Direct Link:</strong> <a href="${reviewUrl}" style="color: #2563eb; text-decoration: underline;">${reviewUrl}</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              Sent by CatalogForge Automation Service • Brevo SMTP Engine<br>
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

    const sendRes = await this.sendEmail(toEmail, recipientName, subject, htmlContent);
    return {
      success: sendRes.success,
      error: sendRes.error,
    };
  }

  /**
   * Sends an attractive Team Invitation Email via Brevo with a direct acceptance link
   */
  async sendTeamInvitationEmail(options: {
    toEmail: string;
    recipientName?: string;
    inviterName?: string;
    inviterEmail?: string;
    role: string;
    department?: string;
    inviteToken: string;
    appBaseUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const {
      toEmail,
      recipientName,
      inviterName,
      inviterEmail,
      role,
      department,
      inviteToken,
      appBaseUrl,
    } = options;

    const baseUrl = (appBaseUrl || process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const acceptUrl = `${baseUrl}/invite/accept?token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(toEmail)}&role=${encodeURIComponent(role)}&name=${encodeURIComponent(recipientName || '')}&department=${encodeURIComponent(department || '')}`;

    const subject = `[CatalogForge] You have been invited to join the Workspace as ${role}`;

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
        <table width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0b0f17; padding: 24px 30px; text-align: center; border-bottom: 3px solid #2563eb;">
              <span style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                <span style="color: #38bdf8;">Catalog</span><span style="color: #ffffff;">Forge</span>
              </span>
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
                Enterprise Team Invitation
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                Team Member Invitation
              </div>
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                You're invited to join CatalogForge!
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 20px;">
                Hello${recipientName ? ` <strong>${recipientName}</strong>` : ''},<br>
                Administrator <strong>${inviterName || inviterEmail || 'Workspace Administrator'}</strong> has invited you to collaborate in their <strong>CatalogForge Enterprise Workspace</strong>.
              </p>

              <!-- Invitation Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Assigned Workspace Role</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 800;">
                    <span style="background-color: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">${role}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Department</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 700;">${department || 'Catalog Operations'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #64748b; font-weight: 600;">Invited Email</td>
                  <td style="padding: 12px 16px; color: #0f172a; font-weight: 700; font-family: monospace;">${toEmail}</td>
                </tr>
              </table>

              <!-- Big Call to Action -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${acceptUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 800; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                  Accept Invitation &amp; Access Workspace →
                </a>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 11px; color: #64748b; word-break: break-all;">
                <strong>Direct Invitation Link:</strong><br>
                <a href="${acceptUrl}" style="color: #2563eb; text-decoration: underline;">${acceptUrl}</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              Sent by CatalogForge Security • Brevo SMTP Engine<br>
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

    const textContent = `
Hello ${recipientName || 'there'},

You have been invited by ${inviterName || inviterEmail || 'Workspace Administrator'} to join the CatalogForge Enterprise Workspace.

Assigned Role: ${role}
Department: ${department || 'Catalog Operations'}
Invited Email: ${toEmail}

To accept this invitation and access the workspace, open the link below:
${acceptUrl}

If you have any questions, feel free to reply to this email.
`;

    const sendRes = await this.sendEmail(toEmail, recipientName, subject, htmlContent, textContent);
    return {
      success: sendRes.success,
      error: sendRes.error,
    };
  }
}

export const emailService = new EmailService();

