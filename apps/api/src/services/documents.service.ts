import { eq } from 'drizzle-orm';
import { documents } from '@casalino/db/schema';
import { getDb } from '../lib/db';

// ---------------------
// List documents for an application
// ---------------------

export async function listDocuments(applicationId: string) {
  const db = getDb();
  return db
    .select()
    .from(documents)
    .where(eq(documents.applicationId, applicationId));
}

// ---------------------
// Create document record
// ---------------------

interface CreateDocumentInput {
  applicationId: string;
  type: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
}

export async function createDocument(input: CreateDocumentInput) {
  const db = getDb();

  const [doc] = await db
    .insert(documents)
    .values({
      applicationId: input.applicationId,
      type: input.type,
      fileName: input.fileName,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
    })
    .returning();

  return doc!;
}
