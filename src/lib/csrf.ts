// Server-only utilities for route handlers.
import type { NextRequest } from 'next/server';

export class CsrfError extends Error {
  status: number;
  constructor(message = 'CSRF token mismatch') {
    super(message);
    this.name = 'CsrfError';
    this.status = 403;
  }
}

/**
 * Validate CSRF by comparing the csrf_token cookie and x-csrf-token header.
 * Call this at the top of each POST route: assertCsrf(req)
 */
export function assertCsrf(req: NextRequest): void {
  const cookie = req.cookies.get('csrf_token')?.value ?? null;
  const header = req.headers.get('x-csrf-token');
  if (!cookie || !header || cookie !== header) {
    throw new CsrfError();
  }
}