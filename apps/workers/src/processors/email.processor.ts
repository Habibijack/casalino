import type { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { orgMembers, users } from '@casalino/db/schema';
import {
  sendApplicationReceivedEmail,
  sendRejectionEmail,
  sendViewingInvitationEmail,
  sendContractReadyEmail,
  sendMemberInvitationEmail,
  sendReferenceRequestEmail,
} from '@casalino/email';
import { getDb } from '../lib/db';
import { APP_URL } from '@casalino/shared';

interface BaseEmailJobData {
  type: string;
}

interface ApplicationReceivedData extends BaseEmailJobData {
  type: 'application-received';
  applicationId: string;
  applicantName: string;
  applicantEmail: string | null;
  listingAddress: string;
  listingCity: string;
  orgId: string;
}

interface RejectionData extends BaseEmailJobData {
  type: 'rejection';
  applicantEmail: string;
  applicantName: string;
  listingAddress: string;
  language: 'de' | 'fr' | 'it';
}

interface ViewingInvitationData extends BaseEmailJobData {
  type: 'viewing-invitation';
  applicantEmail: string;
  applicantName: string;
  listingAddress: string;
  date: string;
  time: string;
  viewingId: string;
  language?: 'de' | 'fr' | 'it';
}

interface ContractReadyData extends BaseEmailJobData {
  type: 'contract-ready';
  to: string;
  tenantName: string;
  listingAddress: string;
  signToken: string | null;
  language?: 'de' | 'fr' | 'it';
}

interface MemberInvitationData extends BaseEmailJobData {
  type: 'member-invitation';
  to: string;
  orgName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}

interface ReferenceRequestData extends BaseEmailJobData {
  type: 'reference-request';
  to: string;
  landlordName: string;
  applicantName: string;
  token: string;
}

type EmailJobData =
  | ApplicationReceivedData
  | RejectionData
  | ViewingInvitationData
  | ContractReadyData
  | MemberInvitationData
  | ReferenceRequestData;

export async function processEmailJob(job: Job<EmailJobData>) {
  const data = job.data;

  switch (data.type) {
    case 'application-received':
      await handleApplicationReceived(data);
      break;
    case 'rejection':
      await handleRejection(data);
      break;
    case 'viewing-invitation':
      await handleViewingInvitation(data);
      break;
    case 'contract-ready':
      await handleContractReady(data);
      break;
    case 'member-invitation':
      await handleMemberInvitation(data);
      break;
    case 'reference-request':
      await handleReferenceRequest(data);
      break;
    default:
      console.warn(`[email] Unknown email type: ${(data as BaseEmailJobData).type}`);
  }
}

// ---------------------
// Handlers
// ---------------------

async function handleApplicationReceived(
  data: ApplicationReceivedData,
) {
  const db = getDb();

  // Find org members to notify (join with users for email/name)
  const admins = await db
    .select({
      email: users.email,
      fullName: users.fullName,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, data.orgId));

  const applicationUrl = `${APP_URL}/applicants/${data.applicationId}`;

  for (const admin of admins) {
    if (!admin.email) continue;

    await sendApplicationReceivedEmail({
      to: admin.email,
      managerName: admin.fullName ?? 'Team',
      applicantName: data.applicantName,
      listingAddress: `${data.listingAddress}, ${data.listingCity}`,
      applicationUrl,
    });

    console.log(
      `[email] Application received notification sent to ${admin.email}`,
    );
  }
}

async function handleRejection(data: RejectionData) {
  if (!data.applicantEmail) {
    console.warn('[email] No applicant email for rejection, skipping');
    return;
  }

  await sendRejectionEmail({
    to: data.applicantEmail,
    applicantName: data.applicantName,
    listingAddress: data.listingAddress,
    language: data.language,
  });

  console.log(
    `[email] Rejection email sent to ${data.applicantEmail}`,
  );
}

async function handleViewingInvitation(data: ViewingInvitationData) {
  if (!data.applicantEmail) {
    console.warn('[email] No applicant email for viewing invitation, skipping');
    return;
  }

  const viewingUrl = `${APP_URL}/book/${data.viewingId}`;

  await sendViewingInvitationEmail({
    to: data.applicantEmail,
    applicantName: data.applicantName,
    listingAddress: data.listingAddress,
    date: data.date,
    time: data.time,
    viewingUrl,
    language: data.language ?? 'de',
  });

  console.log(
    `[email] Viewing invitation sent to ${data.applicantEmail}`,
  );
}

async function handleContractReady(data: ContractReadyData) {
  if (!data.to || !data.signToken) {
    console.warn('[email] Missing email or sign token for contract, skipping');
    return;
  }

  const contractUrl = `${APP_URL}/sign/${data.signToken}`;

  await sendContractReadyEmail({
    to: data.to,
    tenantName: data.tenantName,
    listingAddress: data.listingAddress,
    contractUrl,
    language: data.language ?? 'de',
  });

  console.log(`[email] Contract ready email sent to ${data.to}`);
}

async function handleMemberInvitation(data: MemberInvitationData) {
  await sendMemberInvitationEmail({
    to: data.to,
    inviterName: data.inviterName,
    orgName: data.orgName,
    inviteUrl: data.inviteUrl,
    role: data.role,
  });

  console.log(`[email] Member invitation sent to ${data.to}`);
}

async function handleReferenceRequest(data: ReferenceRequestData) {
  if (!data.to) {
    console.warn('[email] No landlord email for reference request, skipping');
    return;
  }

  const referenceUrl = `${APP_URL}/reference/${data.token}`;

  await sendReferenceRequestEmail({
    to: data.to,
    landlordName: data.landlordName,
    applicantName: data.applicantName,
    referenceUrl,
  });

  console.log(`[email] Reference request sent to ${data.to}`);
}
