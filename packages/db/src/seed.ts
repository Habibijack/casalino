import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding Casalino B2B database...\n');

  // Clean existing data (reverse FK order)
  console.log('Cleaning existing data...');
  await db.delete(schema.auditLog);
  await db.delete(schema.communications);
  await db.delete(schema.contracts);
  await db.delete(schema.viewings);
  await db.delete(schema.creditChecks);
  await db.delete(schema.documents);
  await db.delete(schema.applications);
  await db.delete(schema.listings);
  await db.delete(schema.orgMembers);
  await db.delete(schema.organizations);
  await db.delete(schema.users);

  // 1. Create test organization
  console.log('Creating test organization...');
  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: 'Muster Immobilien AG',
      slug: 'muster-immobilien',
      contactEmail: 'info@muster-immobilien.ch',
      contactPhone: '+41 44 123 45 67',
      address: 'Bahnhofstrasse 10',
      city: 'Zuerich',
      postalCode: '8001',
      canton: 'ZH',
    })
    .returning();

  console.log(`  Created org: ${org.name}`);

  // 2. Create test users
  console.log('Creating test users...');
  const [admin, editor, viewer] = await db
    .insert(schema.users)
    .values([
      {
        supabaseAuthId: 'test-auth-admin-001',
        email: 'admin@muster-immobilien.ch',
        fullName: 'Anna Muster',
      },
      {
        supabaseAuthId: 'test-auth-editor-001',
        email: 'peter@muster-immobilien.ch',
        fullName: 'Peter Keller',
      },
      {
        supabaseAuthId: 'test-auth-viewer-001',
        email: 'lisa@muster-immobilien.ch',
        fullName: 'Lisa Weber',
      },
    ])
    .returning();

  console.log(`  Created: ${admin.fullName}, ${editor.fullName}, ${viewer.fullName}`);

  // 3. Create org memberships
  console.log('Creating org memberships...');
  await db.insert(schema.orgMembers).values([
    { orgId: org.id, userId: admin.id, role: 'admin' },
    { orgId: org.id, userId: editor.id, role: 'editor', invitedBy: admin.id },
    { orgId: org.id, userId: viewer.id, role: 'viewer', invitedBy: admin.id },
  ]);
  console.log('  Memberships created (admin, editor, viewer)');

  // 4. Create sample listings
  console.log('Creating sample listings...');
  const [listing1, listing2] = await db
    .insert(schema.listings)
    .values([
      {
        orgId: org.id,
        referenceNumber: 'MI-2026-001',
        address: 'Seefeldstrasse 42',
        plz: '8008',
        city: 'Zuerich',
        canton: 'ZH',
        rooms: '3.5',
        areaSqm: 78,
        priceChf: 2400,
        nkChf: 180,
        floor: 3,
        status: 'draft',
        descriptionDe: 'Moderne 3.5-Zimmer-Wohnung im Seefeld mit Balkon und Seesicht.',
        features: ['Balkon', 'Lift', 'Waschmaschine', 'Geschirrspueler'],
      },
      {
        orgId: org.id,
        referenceNumber: 'MI-2026-002',
        address: 'Langstrasse 88',
        plz: '8004',
        city: 'Zuerich',
        canton: 'ZH',
        rooms: '2',
        areaSqm: 48,
        priceChf: 1450,
        nkChf: 120,
        floor: 1,
        status: 'draft',
        descriptionDe: 'Gemuetliche 2-Zimmer-Wohnung an zentraler Lage in Kreis 4.',
        features: ['Parkett', 'Altbau'],
      },
    ])
    .returning();

  console.log(`  Created ${2} listings`);

  // 5. Create sample applications
  console.log('Creating sample applications...');
  await db.insert(schema.applications).values([
    {
      listingId: listing1.id,
      applicantName: 'Max Schneider',
      applicantEmail: 'max.schneider@gmail.com',
      applicantPhone: '+41 79 111 22 33',
      applicantLanguage: 'de',
      householdSize: 2,
      incomeChf: 8500,
      employmentType: 'unbefristet',
      status: 'new',
    },
    {
      listingId: listing1.id,
      applicantName: 'Sophie Blanc',
      applicantEmail: 'sophie.blanc@outlook.com',
      applicantLanguage: 'fr',
      householdSize: 1,
      incomeChf: 6200,
      employmentType: 'unbefristet',
      status: 'new',
    },
    {
      listingId: listing2.id,
      applicantName: 'Marco Rossi',
      applicantEmail: 'marco.rossi@mail.ch',
      applicantLanguage: 'it',
      householdSize: 1,
      incomeChf: 5800,
      employmentType: 'befristet',
      status: 'new',
    },
  ]);
  console.log('  Created 3 applications');

  console.log('\nSeeding complete! Summary:');
  console.log('  1 Organization (Muster Immobilien AG)');
  console.log('  3 Users (admin, editor, viewer)');
  console.log('  3 Org Memberships');
  console.log('  2 Listings');
  console.log('  3 Applications');
  console.log('\nDatabase ready for development!');

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
