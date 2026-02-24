import { Hono } from 'hono';
import { createContractSchema, updateContractDataSchema, updateHandoverDataSchema } from '@casalino/shared';
import type { AppEnv } from '../types';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';
import {
  listContracts,
  getContractById,
  createContract,
  updateContractData,
  updateHandoverData,
  sendForSignature,
  signContract,
  getContractByToken,
} from '../services/contracts.service';

// Protected routes (require auth)
export const contractsRouter = new Hono<AppEnv>()

  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const items = await listContracts(orgId);
    return c.json({ success: true, data: { items } });
  })

  .get('/:id', async (c) => {
    const orgId = c.get('orgId');
    const id = c.req.param('id');
    const contract = await getContractById(orgId, id);
    return c.json({ success: true, data: contract });
  })

  .post('/', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const body = await c.req.json();
    const parsed = createContractSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.errors[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const contract = await createContract(orgId, userId, parsed.data);
    return c.json({ success: true, data: contract }, 201);
  })

  .patch('/:id/data', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateContractDataSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.errors[0]?.message ?? 'Ungueltige Vertragsdaten');
    }
    const contract = await updateContractData(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: contract });
  })

  .patch('/:id/handover', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateHandoverDataSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.errors[0]?.message ?? 'Ungueltige Uebergabedaten');
    }
    const contract = await updateHandoverData(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: contract });
  })

  .post('/:id/send', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const contract = await sendForSignature(orgId, userId, id);
    return c.json({ success: true, data: contract });
  });

// Public routes (no auth)
export const publicContractsRouter = new Hono()

  .get('/sign/:token', async (c) => {
    const token = c.req.param('token');
    const contract = await getContractByToken(token);
    return c.json({ success: true, data: contract });
  })

  .post('/sign/:token', async (c) => {
    const token = c.req.param('token');
    const contract = await signContract(token);
    return c.json({ success: true, data: contract });
  });
