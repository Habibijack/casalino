import { eq, and, desc } from 'drizzle-orm';
import { contracts, listings, applications } from '@casalino/db/schema';
import type { ContractData, HandoverData } from '@casalino/db/schema';
import type { CreateContractInput, UpdateContractStatusInput } from '@casalino/shared';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import { requireRole, writeAuditLog } from '../lib/query-helpers';
import { emailQueue } from '../lib/queues';
import { randomBytes } from 'crypto';
import { generateContractPdf } from './pdf.service';
import { notifyAllOrgMembers } from './notification-triggers';

// ---------------------
// List contracts for org
// ---------------------

export async function listContracts(orgId: string) {
  const db = getDb();

  const rows = await db
    .select({
      id: contracts.id,
      listingId: contracts.listingId,
      applicationId: contracts.applicationId,
      status: contracts.status,
      contractData: contracts.contractData,
      sentAt: contracts.sentAt,
      signedAt: contracts.signedAt,
      createdAt: contracts.createdAt,
      listingAddress: listings.address,
      listingCity: listings.city,
      applicantName: applications.applicantName,
    })
    .from(contracts)
    .innerJoin(listings, eq(contracts.listingId, listings.id))
    .innerJoin(applications, eq(contracts.applicationId, applications.id))
    .where(eq(listings.orgId, orgId))
    .orderBy(desc(contracts.createdAt));

  return rows;
}

// ---------------------
// Get contract by ID
// ---------------------

export async function getContractById(orgId: string, contractId: string) {
  const db = getDb();

  const [row] = await db
    .select({
      id: contracts.id,
      listingId: contracts.listingId,
      applicationId: contracts.applicationId,
      status: contracts.status,
      contractData: contracts.contractData,
      handoverData: contracts.handoverData,
      pdfStoragePath: contracts.pdfStoragePath,
      signToken: contracts.signToken,
      sentAt: contracts.sentAt,
      signedAt: contracts.signedAt,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
      listingAddress: listings.address,
      listingCity: listings.city,
      listingPriceChf: listings.priceChf,
      listingNkChf: listings.nkChf,
      applicantName: applications.applicantName,
      applicantEmail: applications.applicantEmail,
      applicantLanguage: applications.applicantLanguage,
    })
    .from(contracts)
    .innerJoin(listings, eq(contracts.listingId, listings.id))
    .innerJoin(applications, eq(contracts.applicationId, applications.id))
    .where(and(eq(contracts.id, contractId), eq(listings.orgId, orgId)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Vertrag');
  }

  return row;
}

// ---------------------
// Create contract (select tenant)
// ---------------------

export async function createContract(
  orgId: string,
  userId: string,
  input: CreateContractInput,
) {
  const db = getDb();

  // Verify listing belongs to org
  const [listing] = await db
    .select({
      id: listings.id,
      address: listings.address,
      priceChf: listings.priceChf,
      nkChf: listings.nkChf,
    })
    .from(listings)
    .where(and(eq(listings.id, input.listingId), eq(listings.orgId, orgId)))
    .limit(1);

  if (!listing) {
    throw AppError.notFound('Inserat');
  }

  // Verify application
  const [app] = await db
    .select({
      id: applications.id,
      applicantName: applications.applicantName,
      applicantEmail: applications.applicantEmail,
    })
    .from(applications)
    .where(
      and(
        eq(applications.id, input.applicationId),
        eq(applications.listingId, input.listingId),
      ),
    )
    .limit(1);

  if (!app) {
    throw AppError.notFound('Bewerbung');
  }

  // Generate sign token
  const signToken = randomBytes(32).toString('hex');

  const [contract] = await db
    .insert(contracts)
    .values({
      listingId: input.listingId,
      applicationId: input.applicationId,
      status: 'draft',
      signToken,
      contractData: {
        tenantName: app.applicantName,
        tenantEmail: app.applicantEmail ?? '',
        tenantAddress: '',
        rentAmount: listing.priceChf,
        nkAmount: listing.nkChf ?? undefined,
        startDate: new Date().toISOString().split('T')[0] ?? '',
      },
    })
    .returning();

  // Mark application as confirmed
  await db
    .update(applications)
    .set({ status: 'confirmed', updatedAt: new Date() })
    .where(eq(applications.id, input.applicationId));

  await writeAuditLog({
    orgId,
    userId,
    action: 'contract.created',
    entityType: 'contract',
    entityId: contract!.id,
    details: { listingId: input.listingId, applicationId: input.applicationId },
  });

  return contract!;
}

// ---------------------
// Update contract data
// ---------------------

export async function updateContractData(
  orgId: string,
  userId: string,
  contractId: string,
  contractData: ContractData,
) {
  await getContractById(orgId, contractId);

  const db = getDb();

  const [updated] = await db
    .update(contracts)
    .set({
      contractData: contractData,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, contractId))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'contract.updated',
    entityType: 'contract',
    entityId: contractId,
  });

  return updated!;
}

// ---------------------
// Send for signature
// ---------------------

export async function sendForSignature(
  orgId: string,
  userId: string,
  contractId: string,
) {
  const contract = await getContractById(orgId, contractId);

  if (contract.status !== 'draft') {
    throw AppError.validation('Vertrag wurde bereits gesendet');
  }

  if (!contract.applicantEmail) {
    throw AppError.validation('Bewerber hat keine E-Mail-Adresse');
  }

  if (!contract.contractData) {
    throw AppError.validation('Vertragsdaten fehlen');
  }

  // Generate PDF
  let pdfPath: string | null = null;
  try {
    pdfPath = await generateContractPdf({
      contractId,
      orgId,
      contractData: contract.contractData,
      listingAddress: contract.listingAddress ?? '',
      listingCity: contract.listingCity ?? '',
    });
  } catch (err) {
    console.error('[contract] PDF generation failed, continuing without PDF:', err);
  }

  const db = getDb();

  const [updated] = await db
    .update(contracts)
    .set({
      status: 'sent',
      sentAt: new Date(),
      signTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      updatedAt: new Date(),
      ...(pdfPath ? { pdfStoragePath: pdfPath } : {}),
    })
    .where(eq(contracts.id, contractId))
    .returning();

  // Send contract email
  const supportedLanguages = ['de', 'fr', 'it'];
  const applicantLanguage = supportedLanguages.includes(contract.applicantLanguage)
    ? contract.applicantLanguage
    : 'de';

  await emailQueue.add('contract-ready', {
    type: 'contract-ready',
    to: contract.applicantEmail,
    tenantName: contract.applicantName,
    listingAddress: `${contract.listingAddress}, ${contract.listingCity}`,
    signToken: contract.signToken,
    language: applicantLanguage,
  });

  await writeAuditLog({
    orgId,
    userId,
    action: 'contract.sent',
    entityType: 'contract',
    entityId: contractId,
  });

  return updated!;
}

// ---------------------
// Sign contract (public)
// ---------------------

export async function signContract(signToken: string) {
  const db = getDb();

  const [contract] = await db
    .select({
      id: contracts.id,
      status: contracts.status,
      signTokenExpiresAt: contracts.signTokenExpiresAt,
      listingId: contracts.listingId,
    })
    .from(contracts)
    .where(eq(contracts.signToken, signToken))
    .limit(1);

  if (!contract) {
    throw AppError.notFound('Vertrag');
  }

  if (contract.status === 'signed') {
    throw AppError.validation('Vertrag wurde bereits unterschrieben');
  }

  if (contract.status !== 'sent') {
    throw AppError.validation('Vertrag kann noch nicht unterschrieben werden');
  }

  if (contract.signTokenExpiresAt && new Date() > new Date(contract.signTokenExpiresAt)) {
    throw AppError.validation('Link ist abgelaufen. Bitte kontaktieren Sie die Verwaltung.');
  }

  const [updated] = await db
    .update(contracts)
    .set({
      status: 'signed',
      signedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, contract.id))
    .returning();

  // Look up listing org for notification
  const [listing] = await db
    .select({
      orgId: listings.orgId,
      address: listings.address,
      city: listings.city,
    })
    .from(listings)
    .where(eq(listings.id, contract.listingId))
    .limit(1);

  if (listing) {
    await notifyAllOrgMembers({
      orgId: listing.orgId,
      type: 'contract_signed',
      title: 'Vertrag unterschrieben',
      message: `Vertrag fuer ${listing.address}, ${listing.city} wurde unterschrieben`,
      entityType: 'contract',
      entityId: contract.id,
    });
  }

  return updated!;
}

// ---------------------
// Get contract by sign token (public)
// ---------------------

// ---------------------
// Update handover protocol
// ---------------------

export async function updateHandoverData(
  orgId: string,
  userId: string,
  contractId: string,
  handoverData: HandoverData,
) {
  const contract = await getContractById(orgId, contractId);

  if (contract.status !== 'signed') {
    throw AppError.validation(
      'Uebergabeprotokoll kann nur bei unterschriebenen Vertraegen erstellt werden',
    );
  }

  const db = getDb();

  const [updated] = await db
    .update(contracts)
    .set({
      handoverData,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, contractId))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'contract.handover_updated',
    entityType: 'contract',
    entityId: contractId,
  });

  return updated!;
}

// ---------------------
// Get contract by sign token (public)
// ---------------------

export async function getContractByToken(signToken: string) {
  const db = getDb();

  const [row] = await db
    .select({
      id: contracts.id,
      status: contracts.status,
      contractData: contracts.contractData,
      signedAt: contracts.signedAt,
      signTokenExpiresAt: contracts.signTokenExpiresAt,
      listingAddress: listings.address,
      listingCity: listings.city,
      applicantName: applications.applicantName,
    })
    .from(contracts)
    .innerJoin(listings, eq(contracts.listingId, listings.id))
    .innerJoin(applications, eq(contracts.applicationId, applications.id))
    .where(eq(contracts.signToken, signToken))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Vertrag');
  }

  if (row.signTokenExpiresAt && new Date() > new Date(row.signTokenExpiresAt)) {
    throw AppError.validation('Link ist abgelaufen. Bitte kontaktieren Sie die Verwaltung.');
  }

  return row;
}
