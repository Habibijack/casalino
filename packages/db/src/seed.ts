import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding Casalino database...\n');

  // Clean existing data (in correct order due to foreign keys)
  console.log('🧹 Cleaning existing data...');
  await db.delete(schema.messages);
  await db.delete(schema.conversations);
  await db.delete(schema.documents);
  await db.delete(schema.subscriptions);
  await db.delete(schema.searchProfiles);
  await db.delete(schema.listings);
  await db.delete(schema.users);

  // 1. Create test users
  console.log('👤 Creating test users...');
  const [userDE, userFR, userIT] = await db
    .insert(schema.users)
    .values([
      {
        supabaseAuthId: 'test-auth-de-001',
        email: 'maria@test.ch',
        fullName: 'Maria Müller',
        preferredLanguage: 'de',
      },
      {
        supabaseAuthId: 'test-auth-fr-001',
        email: 'jean@test.ch',
        fullName: 'Jean Dupont',
        preferredLanguage: 'fr',
      },
      {
        supabaseAuthId: 'test-auth-it-001',
        email: 'luca@test.ch',
        fullName: 'Luca Rossi',
        preferredLanguage: 'it',
      },
    ])
    .returning();

  console.log(`  ✅ Created ${userDE.fullName}, ${userFR.fullName}, ${userIT.fullName}`);

  // 2. Create search profiles
  console.log('🔍 Creating search profiles...');
  await db.insert(schema.searchProfiles).values([
    {
      userId: userDE.id,
      name: 'Zürich Zentrum',
      cities: ['Zürich'],
      minRooms: 2,
      maxRooms: 3,
      minPrice: 1500,
      maxPrice: 2500,
    },
    {
      userId: userFR.id,
      name: 'Genève Centre',
      cities: ['Genève', 'Lausanne'],
      minRooms: 3,
      maxRooms: 4,
      minPrice: 1800,
      maxPrice: 3000,
    },
  ]);
  console.log('  ✅ Search profiles created');

  // 3. Create sample listings
  console.log('🏠 Creating sample listings...');
  const [listing1, listing2, listing3] = await db
    .insert(schema.listings)
    .values([
      {
        externalId: 'flatfox-12345',
        source: 'flatfox',
        sourceUrl: 'https://flatfox.ch/de/12345',
        title: 'Moderne 3.5-Zimmer-Wohnung an zentraler Lage',
        description:
          'Schöne, helle Wohnung im Herzen von Zürich. Nahe Hauptbahnhof, ruhige Lage trotz Zentrum. Balkon mit Aussicht. Waschmaschine in der Wohnung.',
        listingLanguage: 'de',
        address: 'Bahnhofstrasse 42',
        city: 'Zürich',
        postalCode: '8001',
        canton: 'ZH',
        rooms: '3.5',
        area: 75,
        price: 2200,
        floor: 3,
        images: [
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Wohnzimmer',
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Küche',
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Schlafzimmer',
        ],
        features: ['Balkon', 'Lift', 'Waschmaschine', 'Geschirrspüler'],
      },
      {
        externalId: 'homegate-67890',
        source: 'homegate',
        sourceUrl: 'https://homegate.ch/mieten/67890',
        title: 'Charmante 2-Zimmer-Wohnung in Wiedikon',
        description:
          'Gemütliche Altbauwohnung mit Charme. Hohe Decken, Parkettboden. Nahe Tram und Einkaufsmöglichkeiten.',
        listingLanguage: 'de',
        address: 'Birmensdorferstrasse 108',
        city: 'Zürich',
        postalCode: '8003',
        canton: 'ZH',
        rooms: '2',
        area: 52,
        price: 1650,
        floor: 2,
        images: [
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Salon',
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Chambre',
        ],
        features: ['Parkett', 'Altbau', 'Tram-Nähe'],
      },
      {
        externalId: 'flatfox-11111',
        source: 'flatfox',
        sourceUrl: 'https://flatfox.ch/fr/11111',
        title: 'Bel appartement 4 pièces au bord du lac',
        description:
          'Magnifique appartement avec vue sur le lac Léman. Cuisine équipée, deux salles de bain. Parking inclus.',
        listingLanguage: 'fr',
        address: 'Quai du Mont-Blanc 15',
        city: 'Genève',
        postalCode: '1201',
        canton: 'GE',
        rooms: '4',
        area: 95,
        price: 3200,
        floor: 5,
        images: [
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Vue+Lac',
          'https://placehold.co/800x600/FAF7F2/1A1714?text=Cuisine',
        ],
        features: ['Vue lac', 'Parking', '2 SdB', 'Cuisine équipée'],
      },
    ])
    .returning();

  console.log(`  ✅ Created ${[listing1, listing2, listing3].length} listings`);

  // 4. Create sample conversations
  console.log('💬 Creating sample conversations...');
  const [conv1] = await db
    .insert(schema.conversations)
    .values([
      {
        userId: userDE.id,
        chatType: 'main',
        title: 'Wohnungssuche Zürich',
      },
      {
        userId: userDE.id,
        listingId: listing1.id,
        chatType: 'listing',
        title: 'Anfrage: Bahnhofstrasse 42',
      },
    ])
    .returning();

  // Add messages to first conversation
  await db.insert(schema.messages).values([
    {
      conversationId: conv1.id,
      role: 'user',
      content: 'Ich suche eine 3-Zimmer-Wohnung in Zürich für max. 2500 CHF.',
    },
    {
      conversationId: conv1.id,
      role: 'assistant',
      content:
        "Ich habe 2 passende Wohnungen in Zürich für dich gefunden! Eine moderne 3.5-Zimmer-Wohnung an der Bahnhofstrasse für CHF 2'200 und eine charmante 2-Zimmer-Wohnung in Wiedikon für CHF 1'650. Möchtest du mehr Details?",
    },
  ]);
  console.log('  ✅ Conversations and messages created');

  // 5. Create subscriptions
  console.log('💳 Creating subscriptions...');
  await db.insert(schema.subscriptions).values([
    {
      userId: userDE.id,
      tier: 'free',
      status: 'active',
    },
    {
      userId: userFR.id,
      tier: 'premium',
      status: 'active',
    },
    {
      userId: userIT.id,
      tier: 'free',
      status: 'active',
    },
  ]);
  console.log('  ✅ Subscriptions created');

  console.log('\n✅ Seeding complete! Summary:');
  console.log('  👤 3 Users (DE, FR, IT)');
  console.log('  🔍 2 Search Profiles');
  console.log('  🏠 3 Listings (2 DE, 1 FR)');
  console.log('  💬 2 Conversations + 2 Messages');
  console.log('  💳 3 Subscriptions');
  console.log('\n🎉 Database ready for development!');

  await client.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
