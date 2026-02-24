import type { Job } from 'bullmq';
import { eq, and } from 'drizzle-orm';
import { viewings, listings, applications } from '@casalino/db/schema';
import { sendViewingInvitationEmail } from '@casalino/email';
import { APP_URL } from '@casalino/shared';
import { getDb } from '../lib/db';

export interface ReminderJobData {
  viewingId: string;
}

export async function processReminderJob(job: Job<ReminderJobData>) {
  const { viewingId } = job.data;
  const db = getDb();

  const [row] = await db
    .select({
      id: viewings.id,
      status: viewings.status,
      reminderSent: viewings.reminderSent,
      slotStart: viewings.slotStart,
      slotEnd: viewings.slotEnd,
      listingAddress: listings.address,
      listingCity: listings.city,
      applicantName: applications.applicantName,
      applicantEmail: applications.applicantEmail,
      applicantLanguage: applications.applicantLanguage,
    })
    .from(viewings)
    .innerJoin(listings, eq(viewings.listingId, listings.id))
    .innerJoin(applications, eq(viewings.applicationId, applications.id))
    .where(eq(viewings.id, viewingId))
    .limit(1);

  if (!row) {
    console.warn(`[reminder] Viewing ${viewingId} not found, skipping`);
    return;
  }

  if (row.reminderSent) {
    console.log(`[reminder] Viewing ${viewingId} already reminded, skipping`);
    return;
  }

  if (row.status === 'noshow' || row.status === 'appeared') {
    console.log(`[reminder] Viewing ${viewingId} has status '${row.status}', skipping`);
    return;
  }

  if (row.status !== 'confirmed' && row.status !== 'invited') {
    console.log(`[reminder] Viewing ${viewingId} status '${row.status}' not eligible, skipping`);
    return;
  }

  if (!row.applicantEmail) {
    console.warn(`[reminder] Viewing ${viewingId} has no applicant email, skipping`);

    await db
      .update(viewings)
      .set({ reminderSent: true, updatedAt: new Date() })
      .where(and(eq(viewings.id, viewingId)));

    return;
  }

  const viewingUrl = `${APP_URL}/book/${viewingId}`;
  const date = row.slotStart.toLocaleDateString('de-CH');
  const time = row.slotStart.toLocaleTimeString('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const listingAddress = `${row.listingAddress}, ${row.listingCity}`;

  const supportedLanguages = ['de', 'fr', 'it'] as const;
  type SupportedLanguage = typeof supportedLanguages[number];

  function isSupportedLanguage(val: string): val is SupportedLanguage {
    return (supportedLanguages as readonly string[]).includes(val);
  }

  const language: SupportedLanguage = isSupportedLanguage(row.applicantLanguage)
    ? row.applicantLanguage
    : 'de';

  await sendViewingInvitationEmail({
    to: row.applicantEmail,
    applicantName: row.applicantName,
    listingAddress,
    date,
    time,
    viewingUrl,
    language,
  });

  await db
    .update(viewings)
    .set({ reminderSent: true, updatedAt: new Date() })
    .where(and(eq(viewings.id, viewingId)));

  console.log(
    `[reminder] Reminder sent to ${row.applicantEmail} for viewing ${viewingId} on ${date} ${time}`,
  );
}
