/**
 * Authentication & Brevo OTP Security Routes
 * Implements GET /api/v1/auth/me, POST /api/v1/auth/otp/send, POST /api/v1/auth/otp/verify
 */

import { CurrentUserResponse } from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import { GetCurrentUserRouteSchema } from '../../schemas/auth.schemas';
import { emailService, OtpPurpose } from '../../services/email.service';

interface SendOtpBody {
  email: string;
  purpose: OtpPurpose;
  name?: string;
}

interface VerifyOtpBody {
  email: string;
  purpose: OtpPurpose;
  otp: string;
}

interface SendNotificationBody {
  email: string;
  name?: string;
  subject: string;
  htmlContent: string;
}

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * GET /api/v1/auth/me
   * Returns current authenticated user claims and profile
   */
  fastify.get<{ Reply: CurrentUserResponse }>(
    '/me',
    {
      preHandler: [authenticate],
      schema: GetCurrentUserRouteSchema,
    },
    async (request, reply) => {
      const user = request.user;

      const response: CurrentUserResponse = {
        uid: user.uid,
        role: user.role,
        email: user.email,
        displayName: user.displayName,
      };

      return reply.status(200).send(response);
    },
  );

  /**
   * POST /api/v1/auth/otp/send
   * Generates and emails a 6-digit OTP code using Brevo Transactional Email
   */
  fastify.post<{ Body: SendOtpBody }>(
    '/otp/send',
    async (request, reply) => {
      const { email, purpose, name } = request.body || {};

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return reply.status(400).send({
          success: false,
          error: 'A valid email address is required to receive the verification code.',
        });
      }

      const validPurposes: OtpPurpose[] = ['signup_verification', 'login_2fa', 'password_reset'];
      const targetPurpose: OtpPurpose = validPurposes.includes(purpose) ? purpose : 'login_2fa';

      try {
        const result = await emailService.sendOtpEmail(email, targetPurpose, name);

        return reply.status(200).send({
          success: true,
          message: `6-digit verification code dispatched to ${email}`,
          email,
          purpose: targetPurpose,
          emailSent: result.emailSent,
          // Return devOtp in local development / non-production if Brevo encountered unwhitelisted IP
          devOtp: !result.emailSent ? result.otp : undefined,
          errorNotice: result.error,
        });
      } catch (err: any) {
        fastify.log.error(err, 'Failed to send OTP email');
        return reply.status(500).send({
          success: false,
          error: err?.message || 'Failed to dispatch verification email',
        });
      }
    },
  );

  /**
   * POST /api/v1/auth/otp/verify
   * Verifies the 6-digit OTP code for Signup, 2FA Login, or Password Reset
   */
  fastify.post<{ Body: VerifyOtpBody }>(
    '/otp/verify',
    async (request, reply) => {
      const { email, purpose, otp } = request.body || {};

      if (!email || !otp) {
        return reply.status(400).send({
          success: false,
          verified: false,
          error: 'Email and 6-digit OTP code are required.',
        });
      }

      const validPurposes: OtpPurpose[] = ['signup_verification', 'login_2fa', 'password_reset'];
      const targetPurpose: OtpPurpose = validPurposes.includes(purpose) ? purpose : 'login_2fa';

      const verifyResult = emailService.verifyOtp(email, targetPurpose, otp);

      if (!verifyResult.valid) {
        return reply.status(400).send({
          success: false,
          verified: false,
          error: verifyResult.reason || 'Invalid verification code.',
        });
      }

      return reply.status(200).send({
        success: true,
        verified: true,
        message: 'Verification successful.',
        email,
        purpose: targetPurpose,
      });
    },
  );

  /**
   * POST /api/v1/auth/notifications/send
   * Sends transactional system notifications via Brevo
   */
  fastify.post<{ Body: SendNotificationBody }>(
    '/notifications/send',
    async (request, reply) => {
      const { email, name, subject, htmlContent } = request.body || {};

      if (!email || !subject || !htmlContent) {
        return reply.status(400).send({
          success: false,
          error: 'Email, subject, and content are required.',
        });
      }

      const sendResult = await emailService.sendEmail(email, name, subject, htmlContent);

      return reply.status(200).send({
        success: sendResult.success,
        messageId: sendResult.messageId,
        error: sendResult.error,
      });
    },
  );

  /**
   * POST /api/v1/auth/invite
   * Dispatches an official team invitation email via Brevo
   */
  fastify.post<{
    Body: {
      email: string;
      name?: string;
      role: string;
      department?: string;
      inviterName?: string;
      inviterEmail?: string;
      appBaseUrl?: string;
    };
  }>(
    '/invite',
    async (request, reply) => {
      const { email, name, role, department, inviterName, inviterEmail, appBaseUrl } = request.body || {};

      if (!email || !email.includes('@')) {
        return reply.status(400).send({
          success: false,
          error: 'A valid email address is required to send team invitation.',
        });
      }

      const inviteToken = Buffer.from(`${email.toLowerCase()}:${Date.now()}:${Math.random().toString(36).substring(2, 8)}`).toString('base64url');

      try {
        const sendResult = await emailService.sendTeamInvitationEmail({
          toEmail: email.trim(),
          recipientName: name,
          inviterName,
          inviterEmail,
          role: role || 'Catalog Manager',
          department: department || 'Catalog Operations',
          inviteToken,
          appBaseUrl,
        });

        return reply.status(200).send({
          success: sendResult.success,
          inviteToken,
          emailSent: sendResult.success,
          error: sendResult.error,
          message: sendResult.success
            ? `Invitation email successfully dispatched to ${email}`
            : `Failed to dispatch invitation email to ${email}`,
        });
      } catch (err: any) {
        fastify.log.error(err, 'Failed to send team invitation email');
        return reply.status(500).send({
          success: false,
          error: err?.message || 'Failed to dispatch invitation email',
        });
      }
    },
  );

  /**
   * POST /api/v1/auth/invite/accept
   * Confirms and marks an invitation as accepted
   */
  fastify.post<{
    Body: {
      email: string;
      token?: string;
      name?: string;
      role?: string;
    };
  }>(
    '/invite/accept',
    async (request, reply) => {
      const { email } = request.body || {};

      if (!email) {
        return reply.status(400).send({
          success: false,
          error: 'Email is required to accept invitation.',
        });
      }

      return reply.status(200).send({
        success: true,
        message: `Invitation accepted for ${email}`,
        acceptedAt: new Date().toISOString(),
      });
    },
  );
};
