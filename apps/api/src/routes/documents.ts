import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { uploadDocumentSchema } from '@casalino/shared';
import { getSupabaseAdmin } from '../lib/supabase';
import { createDocument } from '../services/documents.service';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

function getExtension(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  return 'bin';
}

// ---------------------
// POST / — Upload a document for an application
// ---------------------

export const documentsRouter = new Hono<AppEnv>()

  .post('/', async (c) => {
    const orgId = c.get('orgId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const formData = await c.req.formData();

    const applicationId = formData.get('applicationId');
    const type = formData.get('type');
    const fileEntry = formData.get('file');

    if (!(fileEntry instanceof File)) {
      throw AppError.validation('Feld "file" fehlt oder ist kein gültiges File-Objekt');
    }

    if (typeof applicationId !== 'string' || typeof type !== 'string') {
      throw AppError.validation('Felder "applicationId" und "type" sind erforderlich');
    }

    const parsed = uploadDocumentSchema.safeParse({
      applicationId,
      type,
      fileName: fileEntry.name,
      mimeType: fileEntry.type,
    });

    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Ungültige Eingabe');
    }

    if (!ALLOWED_MIME_TYPES.has(parsed.data.mimeType)) {
      throw AppError.validation(
        'Ungültiger Dateityp. Erlaubt: PDF, JPEG, PNG',
      );
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      throw AppError.validation('Datei darf maximal 20 MB gross sein');
    }

    const extension = getExtension(parsed.data.mimeType);
    const storagePath = `${orgId}/${parsed.data.applicationId}/${parsed.data.type}_${Date.now()}.${extension}`;

    const fileBuffer = await fileEntry.arrayBuffer();

    const supabase = getSupabaseAdmin();
    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: parsed.data.mimeType,
        upsert: false,
      });

    if (storageError) {
      throw new AppError(
        'STORAGE_ERROR',
        `Datei-Upload fehlgeschlagen: ${storageError.message}`,
        500,
      );
    }

    const document = await createDocument({
      applicationId: parsed.data.applicationId,
      type: parsed.data.type,
      fileName: parsed.data.fileName,
      storagePath,
      mimeType: parsed.data.mimeType,
    });

    return c.json({ success: true, data: document }, 201);
  });
