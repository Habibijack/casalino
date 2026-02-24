import PDFDocument from 'pdfkit';
import type { ContractData } from '@casalino/db/schema';
import { getSupabaseAdmin } from '../lib/supabase';

interface PdfInput {
  contractId: string;
  orgId: string;
  contractData: ContractData;
  listingAddress: string;
  listingCity: string;
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatChf(amount: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function generateContractPdf(
  input: PdfInput,
): Promise<string> {
  const { contractId, orgId, contractData, listingAddress, listingCity } = input;

  const buffer = await buildPdfBuffer(contractData, listingAddress, listingCity);

  // Upload to Supabase Storage
  const storagePath = `${orgId}/contracts/${contractId}.pdf`;
  const supabase = getSupabaseAdmin();

  await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  return storagePath;
}

function buildPdfBuffer(
  data: ContractData,
  listingAddress: string,
  listingCity: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(10)
      .fillColor('#737373')
      .text('Casalino – Mietvertrag', { align: 'right' });

    doc.moveDown(2);

    // Title
    doc
      .fontSize(22)
      .fillColor('#1A1714')
      .text('Mietvertrag', { align: 'center' });

    doc.moveDown(1.5);

    // Parties
    doc.fontSize(12).fillColor('#1A1714').text('1. Parteien', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#3D3832');
    doc.text(`Mieter/in: ${data.tenantName}`);
    if (data.tenantAddress) {
      doc.text(`Adresse: ${data.tenantAddress}`);
    }
    doc.text(`E-Mail: ${data.tenantEmail}`);

    doc.moveDown(1);

    // Object
    doc.fontSize(12).fillColor('#1A1714').text('2. Mietobjekt', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#3D3832');
    doc.text(`Adresse: ${listingAddress}, ${listingCity}`);

    doc.moveDown(1);

    // Financial
    doc.fontSize(12).fillColor('#1A1714').text('3. Mietzins', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#3D3832');
    doc.text(`Nettomiete: ${formatChf(data.rentAmount)} / Monat`);
    if (data.nkAmount) {
      doc.text(`Nebenkosten: ${formatChf(data.nkAmount)} / Monat`);
      doc.text(`Total: ${formatChf(data.rentAmount + data.nkAmount)} / Monat`);
    }
    if (data.depositAmount) {
      doc.text(`Kaution: ${formatChf(data.depositAmount)}`);
    }

    doc.moveDown(1);

    // Duration
    doc.fontSize(12).fillColor('#1A1714').text('4. Mietdauer', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#3D3832');
    doc.text(`Mietbeginn: ${formatDate(data.startDate)}`);
    if (data.endDate) {
      doc.text(`Mietende: ${formatDate(data.endDate)}`);
    } else {
      doc.text('Mietdauer: Unbefristet');
    }

    // Special clauses
    if (data.specialClauses && data.specialClauses.length > 0) {
      doc.moveDown(1);
      doc.fontSize(12).fillColor('#1A1714').text('5. Besondere Vereinbarungen', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#3D3832');
      for (const clause of data.specialClauses) {
        doc.text(`• ${clause}`);
      }
    }

    // Signature lines
    doc.moveDown(3);
    doc.fontSize(12).fillColor('#1A1714').text('Unterschriften', { underline: true });
    doc.moveDown(1.5);

    const leftX = 60;
    const rightX = 310;
    const lineY = doc.y;

    doc.moveTo(leftX, lineY).lineTo(leftX + 200, lineY).stroke('#1A1714');
    doc.moveTo(rightX, lineY).lineTo(rightX + 200, lineY).stroke('#1A1714');

    doc.fontSize(9).fillColor('#737373');
    doc.text('Vermietung', leftX, lineY + 5, { width: 200 });
    doc.text('Mieter/in', rightX, lineY + 5, { width: 200 });

    // Footer
    doc.moveDown(4);
    doc.fontSize(8).fillColor('#999999').text(
      `Erstellt mit Casalino am ${formatDate(new Date().toISOString())}`,
      { align: 'center' },
    );

    doc.end();
  });
}
