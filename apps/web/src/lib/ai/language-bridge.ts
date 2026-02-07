import { generateText } from 'ai';
import { getQualityModel } from './providers';

type MotivationLetterInput = {
  userName: string;
  userLanguage: string;
  userMessage: string;
  listing: {
    title: string;
    city: string | null;
    rooms: string | null;
    price: number | null;
    listingLanguage: string;
    description: string | null;
  };
};

export async function generateMotivationLetter(
  input: MotivationLetterInput
): Promise<string> {
  const { userName, userLanguage, userMessage, listing } = input;

  const targetLanguage = listing.listingLanguage || 'de';

  const languageName =
    targetLanguage === 'de'
      ? 'German'
      : targetLanguage === 'fr'
        ? 'French'
        : 'Italian';

  const prompt = `You are an expert at writing Swiss apartment application letters (Motivationsschreiben / Lettre de motivation / Lettera di motivazione).

TASK: Generate a professional, warm apartment application letter.

CRITICAL: The letter MUST be written in ${targetLanguage.toUpperCase()} (${languageName}) regardless of the user's input language.

USER INFO (provided in ${userLanguage}):
${userMessage}

APARTMENT:
- Title: ${listing.title}
- City: ${listing.city ?? 'Unknown'}
- Rooms: ${listing.rooms ?? 'Unknown'}
- Price: ${listing.price ? `CHF ${listing.price}` : 'Not specified'}
- Description: ${listing.description ?? 'None'}

LETTER REQUIREMENTS:
1. Write in ${targetLanguage.toUpperCase()} (${languageName})
2. Professional but warm tone, suitable for Swiss rental market
3. Include: personal introduction, why this apartment, reliable tenant qualities
4. Mention specific details from the listing to show genuine interest
5. Keep it concise (max 200 words)
6. Use proper Swiss business letter format
7. Sign with the user's name: ${userName}

Generate the letter now:`;

  const result = await generateText({
    model: getQualityModel(),
    prompt,
    temperature: 0.6,
  });

  return result.text;
}
