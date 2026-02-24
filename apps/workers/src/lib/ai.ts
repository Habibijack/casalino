// NOTE: @anthropic-ai/sdk is not yet installed in apps/workers.
// Run: pnpm --filter @casalino/workers add @anthropic-ai/sdk
// Until then, the ANTHROPIC_API_KEY guard below ensures graceful degradation.

import type { ScoreBreakdown } from '@casalino/shared';

// ---------------------
// Anthropic SDK shape (minimal, avoids importing the package at type-check time)
// ---------------------

interface TextBlock {
  type: 'text';
  text: string;
}

interface OtherBlock {
  type: Exclude<string, 'text'>;
}

type ContentBlock = TextBlock | OtherBlock;

interface MessageResponse {
  content: ContentBlock[];
}

interface MessagesResource {
  create(params: {
    model: string;
    max_tokens: number;
    system: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<MessageResponse>;
}

interface AnthropicClient {
  messages: MessagesResource;
}

interface AnthropicConstructor {
  new(opts: { apiKey: string }): AnthropicClient;
}

// ---------------------
// SDK loader (bypasses tsc module resolution for the optional package)
// ---------------------

function loadAnthropicClient(apiKey: string): AnthropicClient {
  // Using Function constructor so tsc never tries to resolve '@anthropic-ai/sdk'.
  // At runtime this is equivalent to: const { default: Anthropic } = require('@anthropic-ai/sdk')
  const requireFn = new Function('moduleName', 'return require(moduleName)') as (
    m: string,
  ) => { default: AnthropicConstructor };
  const { default: Anthropic } = requireFn('@anthropic-ai/sdk');
  return new Anthropic({ apiKey });
}

// ---------------------
// Input / Output types
// ---------------------

export interface ApplicantSummaryInput {
  applicantName: string;
  listingAddress: string;
  listingCity: string;
  rooms: number;
  priceChf: number;
  incomeChf: number | null;
  scoreBreakdown: ScoreBreakdown;
  documentTypes: string[];
}

// ---------------------
// Template fallback (no AI)
// ---------------------

function buildTemplateLabel(total: number): string {
  if (total >= 80) return 'Top-Kandidat';
  if (total >= 60) return 'Gut';
  if (total >= 40) return 'Durchschnitt';
  return 'Unter Schwelle';
}

function buildTemplateSummary(input: ApplicantSummaryInput): string {
  const { applicantName, scoreBreakdown, incomeChf, priceChf, rooms, listingCity, documentTypes } =
    input;

  const label = buildTemplateLabel(scoreBreakdown.total);

  const ratio =
    incomeChf !== null && priceChf > 0
      ? `Einkommens-Miet-Verhältnis von ${(incomeChf / priceChf).toFixed(1)}x`
      : 'Einkommensdaten nicht angegeben';

  const docLine =
    documentTypes.length >= 4
      ? 'Vollständiges Dossier mit allen Dokumenten.'
      : `Dossier mit ${documentTypes.length} Dokument(en) eingereicht.`;

  return (
    `${applicantName} (Score ${scoreBreakdown.total}/100, ${label}) – ${ratio}. ` +
    `${docLine} ` +
    `Bewerbung für die ${rooms}-Zimmer-Wohnung in ${listingCity}.`
  );
}

// ---------------------
// Main export
// ---------------------

export async function generateApplicantSummary(
  input: ApplicantSummaryInput,
): Promise<string> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];

  if (!apiKey) {
    console.warn('[ai] ANTHROPIC_API_KEY not set – returning template summary');
    return buildTemplateSummary(input);
  }

  const client = loadAnthropicClient(apiKey);

  const {
    applicantName,
    scoreBreakdown,
    incomeChf,
    priceChf,
    rooms,
    listingAddress,
    listingCity,
    documentTypes,
  } = input;

  const ratioText =
    incomeChf !== null && priceChf > 0
      ? `${(incomeChf / priceChf).toFixed(1)}x`
      : 'unbekannt';

  const userPrompt = [
    'Erstelle eine kurze, professionelle Bewerberzusammenfassung auf Deutsch (2–3 Sätze) für den Immobilienverwalter.',
    '',
    `Bewerber: ${applicantName}`,
    `Gesamtscore: ${scoreBreakdown.total}/100`,
    `  - Finanzen: ${scoreBreakdown.financial}/35`,
    `  - Dossier: ${scoreBreakdown.dossier}/25`,
    `  - Matching: ${scoreBreakdown.matching}/20`,
    `  - Kommunikation: ${scoreBreakdown.communication}/10`,
    `  - Bonitätsprüfung: ${scoreBreakdown.credit}/10`,
    `Einkommens-Miet-Verhältnis: ${ratioText}`,
    `Eingereichte Dokumente: ${documentTypes.length > 0 ? documentTypes.join(', ') : 'keine'}`,
    `Objekt: ${rooms}-Zimmer-Wohnung, ${listingAddress}, ${listingCity}`,
    '',
    'Halte die Zusammenfassung sachlich, prägnant und professionell. Keine Einleitung, keine Begrüssung.',
  ].join('\n');

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system:
        'Du bist ein sachlicher Assistent für Schweizer Immobilienverwaltungen. Erstelle kurze, professionelle Bewerberzusammenfassungen auf Deutsch.',
      messages: [{ role: 'user', content: userPrompt }],
    });

    const firstBlock = message.content[0];
    const text =
      firstBlock !== undefined && firstBlock.type === 'text'
        ? (firstBlock as TextBlock).text.trim()
        : '';

    return text.length > 0 ? text : buildTemplateSummary(input);
  } catch (err) {
    console.error('[ai] generateApplicantSummary failed, falling back to template:', err);
    return buildTemplateSummary(input);
  }
}
