// NOTE: @anthropic-ai/sdk is not yet installed in apps/api.
// Run: pnpm --filter @casalino/api add @anthropic-ai/sdk
// Until then, the ANTHROPIC_API_KEY guard below ensures graceful degradation.

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
// Public input / output types
// ---------------------

export interface GenerateListingTextInput {
  address: string;
  city: string;
  rooms: number;
  areaSqm: number | null;
  priceChf: number;
  nkChf: number | null;
  floor: number | null;
  features: string[];
}

export interface ListingDescriptions {
  descriptionDe: string;
  descriptionFr: string;
  descriptionIt: string;
}

// ---------------------
// Placeholder fallback
// ---------------------

function buildPlaceholderDescriptions(
  input: GenerateListingTextInput,
): ListingDescriptions {
  const areaLabel = input.areaSqm ? ` ${input.areaSqm} m²,` : '';
  const floorLabel = input.floor !== null ? ` ${input.floor}. OG,` : '';
  const price = `CHF ${input.priceChf.toLocaleString('de-CH')}`;

  return {
    descriptionDe: `[KI nicht konfiguriert] ${input.rooms}-Zimmer-Wohnung in ${input.city},${areaLabel}${floorLabel} ${price}/Monat. Adresse: ${input.address}.`,
    descriptionFr: `[IA non configurée] Appartement ${input.rooms} pièces à ${input.city},${areaLabel}${floorLabel} ${price}/mois. Adresse: ${input.address}.`,
    descriptionIt: `[IA non configurata] Appartamento di ${input.rooms} locali a ${input.city},${areaLabel}${floorLabel} ${price}/mese. Indirizzo: ${input.address}.`,
  };
}

// ---------------------
// Response parser
// ---------------------

interface SectionMap {
  de?: string;
  fr?: string;
  it?: string;
}

function parseDescriptions(raw: string): SectionMap {
  const result: SectionMap = {};

  const deMatch = /##\s*DE\s*\n([\s\S]*?)(?=##\s*FR|$)/i.exec(raw);
  const frMatch = /##\s*FR\s*\n([\s\S]*?)(?=##\s*IT|$)/i.exec(raw);
  const itMatch = /##\s*IT\s*\n([\s\S]*?)$/i.exec(raw);

  if (deMatch?.[1]) result.de = deMatch[1].trim();
  if (frMatch?.[1]) result.fr = frMatch[1].trim();
  if (itMatch?.[1]) result.it = itMatch[1].trim();

  return result;
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
// Price suggestion (heuristic-based, no AI needed)
// ---------------------

// Average CHF/m²/month by canton (Swiss rental market reference data)
const CANTON_PRICE_PER_SQM: Record<string, number> = {
  ZH: 25, GE: 28, BS: 22, VD: 24, ZG: 27, SZ: 22,
  LU: 19, BE: 18, AG: 18, SG: 17, TG: 16, BL: 19,
  SO: 16, FR: 17, NE: 16, TI: 18, VS: 16, GR: 17,
  AR: 15, AI: 15, GL: 14, JU: 14, NW: 19, OW: 18,
  SH: 16, UR: 15,
};

const DEFAULT_PRICE_PER_SQM = 18;

export interface PriceSuggestion {
  suggestedMin: number;
  suggestedMax: number;
  pricePerSqm: number;
  basis: string;
}

export function suggestPrice(input: {
  canton: string | null;
  areaSqm: number | null;
  rooms: number;
}): PriceSuggestion {
  const canton = input.canton ?? '';
  const basePricePerSqm = CANTON_PRICE_PER_SQM[canton] ?? DEFAULT_PRICE_PER_SQM;

  // Estimate area from rooms if not provided (Swiss average ~30m² per room)
  const estimatedArea = input.areaSqm ?? input.rooms * 30;

  const basePrice = Math.round(basePricePerSqm * estimatedArea);
  const suggestedMin = Math.round(basePrice * 0.9);
  const suggestedMax = Math.round(basePrice * 1.1);

  return {
    suggestedMin,
    suggestedMax,
    pricePerSqm: basePricePerSqm,
    basis: input.areaSqm
      ? `${basePricePerSqm} CHF/m² × ${estimatedArea} m² (Kanton ${canton || 'CH'})`
      : `${basePricePerSqm} CHF/m² × ~${estimatedArea} m² geschaetzt (Kanton ${canton || 'CH'})`,
  };
}

// ---------------------
// Main export
// ---------------------

export async function generateListingDescriptions(
  input: GenerateListingTextInput,
): Promise<ListingDescriptions> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];

  if (!apiKey) {
    console.warn('[ai.service] ANTHROPIC_API_KEY not set – returning placeholder text');
    return buildPlaceholderDescriptions(input);
  }

  const client = loadAnthropicClient(apiKey);

  const featureList =
    input.features.length > 0
      ? input.features.join(', ')
      : 'keine besonderen Ausstattungsmerkmale';

  const userPrompt = [
    'Erstelle professionelle Inserat-Beschreibungen für folgende Mietwohnung auf Deutsch, Französisch und Italienisch.',
    'Jede Beschreibung soll 100–200 Wörter lang, sachlich korrekt und ansprechend sein.',
    '',
    'Objekt-Details:',
    `- Adresse: ${input.address}, ${input.city}`,
    `- Zimmer: ${input.rooms}`,
    ...(input.areaSqm !== null ? [`- Fläche: ${input.areaSqm} m²`] : []),
    `- Miete: CHF ${input.priceChf.toLocaleString('de-CH')}/Monat`,
    ...(input.nkChf !== null
      ? [`- Nebenkosten: CHF ${input.nkChf.toLocaleString('de-CH')}/Monat`]
      : []),
    ...(input.floor !== null ? [`- Etage: ${input.floor}. Obergeschoss`] : []),
    `- Ausstattung: ${featureList}`,
    '',
    'Formatiere deine Antwort exakt so:',
    '## DE',
    '<deutschsprachige Beschreibung>',
    '## FR',
    '<französischsprachige Beschreibung>',
    '## IT',
    '<italienischsprachige Beschreibung>',
  ].join('\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system:
      'You are a professional Swiss real estate listing copywriter. Generate property descriptions that are factual, professional, and appealing. Use formal language (Sie-Form for German).',
    messages: [{ role: 'user', content: userPrompt }],
  });

  const firstBlock = message.content[0];
  const rawText =
    firstBlock !== undefined && firstBlock.type === 'text'
      ? (firstBlock as TextBlock).text
      : '';

  const sections = parseDescriptions(rawText);
  const placeholder = buildPlaceholderDescriptions(input);

  return {
    descriptionDe: sections.de ?? placeholder.descriptionDe,
    descriptionFr: sections.fr ?? placeholder.descriptionFr,
    descriptionIt: sections.it ?? placeholder.descriptionIt,
  };
}
