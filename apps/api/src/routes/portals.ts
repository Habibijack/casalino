import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';
import { publishToFlatfox, unpublishFromFlatfox } from '../services/portals/flatfox.service';
import { generateIdxExport } from '../services/portals/idx-export.service';

export const portalsRouter = new Hono<AppEnv>()

  // Publish to Flatfox
  .post('/flatfox/:listingId', async (c) => {
    const orgId = c.get('orgId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const listingId = c.req.param('listingId');
    const body = await c.req.json();
    const apiKey = typeof body === 'object' && body !== null && 'apiKey' in body
      ? String(body.apiKey)
      : '';

    if (!apiKey) {
      throw AppError.validation('Flatfox API Key erforderlich');
    }

    const result = await publishToFlatfox(orgId, listingId, apiKey);
    return c.json({ success: true, data: result });
  })

  // Unpublish from Flatfox
  .delete('/flatfox/:listingId', async (c) => {
    const orgId = c.get('orgId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const listingId = c.req.param('listingId');
    await unpublishFromFlatfox(orgId, listingId);
    return c.json({ success: true, data: { removed: true } });
  })

  // IDX 3.0 XML Export
  .get('/idx-export', async (c) => {
    const orgId = c.get('orgId');
    const xml = await generateIdxExport(orgId);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="idx-export.xml"',
      },
    });
  });
