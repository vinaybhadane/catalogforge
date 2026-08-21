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

        if (!result.emailSent) {
          return reply.status(500).send({
            success: false,
            error: result.error || 'Failed to dispatch verification email to your inbox. Please try again.',
          });
        }

        return reply.status(200).send({
          success: true,
          message: `6-digit verification code dispatched strictly to ${email}`,
          email,
          purpose: targetPurpose,
          emailSent: true,
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

  interface TeamMemberRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    status: 'Pending' | 'Accepted';
    inviteToken?: string;
    invitedAt: string;
    acceptedAt?: string;
  }

  const teamRegistry = new Map<string, TeamMemberRecord>();

  /**
   * GET /api/v1/auth/team-members
   * Returns all invited and active team members
   */
  fastify.get('/team-members', async (_request, reply) => {
    return reply.status(200).send({
      success: true,
      members: Array.from(teamRegistry.values()),
    });
  });

  /**
   * POST /api/v1/auth/invite
   * Dispatches an official team invitation email via Brevo and registers pending invite
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

      const normalizedEmail = email.trim().toLowerCase();
      const inviteToken = Buffer.from(`${normalizedEmail}:${Date.now()}:${Math.random().toString(36).substring(2, 8)}`).toString('base64url');
      const fallbackName = normalizedEmail.split('@')[0] || 'Team Member';

      const memberRecord: TeamMemberRecord = {
        id: Date.now().toString(),
        name: name || fallbackName,
        email: normalizedEmail,
        role: role || 'Catalog Manager',
        department: department || 'Catalog Operations',
        status: 'Pending',
        inviteToken,
        invitedAt: new Date().toISOString(),
      };

      teamRegistry.set(normalizedEmail, memberRecord);

      try {
        const sendResult = await emailService.sendTeamInvitationEmail({
          toEmail: normalizedEmail,
          recipientName: name,
          inviterName,
          inviterEmail,
          role: memberRecord.role,
          department: memberRecord.department,
          inviteToken,
          appBaseUrl,
        });

        return reply.status(200).send({
          success: sendResult.success,
          inviteToken,
          emailSent: sendResult.success,
          error: sendResult.error,
          message: sendResult.success
            ? `Invitation email successfully dispatched to ${normalizedEmail}`
            : `Failed to dispatch invitation email to ${normalizedEmail}`,
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
   * Confirms and marks an invitation as accepted by the invited user
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
      const { email, role, name } = request.body || {};

      if (!email) {
        return reply.status(400).send({
          success: false,
          error: 'Email is required to accept invitation.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const fallbackName = normalizedEmail.split('@')[0] || 'Team Member';
      let record = teamRegistry.get(normalizedEmail);

      if (record) {
        record.status = 'Accepted';
        record.acceptedAt = new Date().toISOString();
        if (role) record.role = role;
        if (name) record.name = name;
      } else {
        const newRecord: TeamMemberRecord = {
          id: Date.now().toString(),
          name: name || fallbackName,
          email: normalizedEmail,
          role: role || 'Catalog Manager',
          department: 'Catalog Operations',
          status: 'Accepted',
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        };
        teamRegistry.set(normalizedEmail, newRecord);
        record = newRecord;
      }

      return reply.status(200).send({
        success: true,
        message: `Invitation accepted for ${normalizedEmail}`,
        member: record,
      });
    },
  );

  /**
   * POST /api/v1/auth/team-members/remove
   * Revokes access for a team member
   */
  fastify.post<{
    Body: {
      id?: string;
      email?: string;
    };
  }>('/team-members/remove', async (request, reply) => {
    const { id, email } = request.body || {};
    if (email) {
      teamRegistry.delete(email.trim().toLowerCase());
    } else if (id) {
      for (const [key, val] of teamRegistry.entries()) {
        if (val.id === id) {
          teamRegistry.delete(key);
          break;
        }
      }
    }
    return reply.status(200).send({ success: true, message: 'Member access revoked.' });
  });

  /**
   * POST /api/v1/auth/team-members/update-role
   * Updates role for a team member
   */
  fastify.post<{
    Body: {
      id?: string;
      email?: string;
      role: string;
    };
  }>('/team-members/update-role', async (request, reply) => {
    const { id, email, role } = request.body || {};
    let targetKey: string | null = null;

    if (email) {
      targetKey = email.trim().toLowerCase();
    } else if (id) {
      for (const [key, val] of teamRegistry.entries()) {
        if (val.id === id) {
          targetKey = key;
          break;
        }
      }
    }

    if (targetKey && teamRegistry.has(targetKey)) {
      const rec = teamRegistry.get(targetKey)!;
      rec.role = role;
      return reply.status(200).send({ success: true, member: rec });
    }

    return reply.status(404).send({ success: false, error: 'Member not found' });
  });
};
