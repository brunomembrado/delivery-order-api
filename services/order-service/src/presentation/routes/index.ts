import { Router } from 'express';

import { v1Routes } from './v1';
import { v2Routes } from './v2';

const router = Router();

// API Versioning
// v1 - Stable version
router.use('/v1', v1Routes);

// v2 - Latest version with new features
router.use('/v2', v2Routes);

// Default to v1 for backwards compatibility
router.use('/', v1Routes);

export const apiRoutes = router;

// Re-export individual route modules for backwards compatibility
export * from './auth.routes';
export * from './order.routes';
export * from './retailer.routes';
export { v1Routes } from './v1';
export { v2Routes } from './v2';
