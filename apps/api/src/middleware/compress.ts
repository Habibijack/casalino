import { compress } from 'hono/compress';

/**
 * Response compression middleware.
 * Compresses JSON responses with gzip for clients that support it.
 */
export const compressionMiddleware = compress();
