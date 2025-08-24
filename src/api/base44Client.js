import { createClient } from '@base44/sdk';

// Create a client that doesn't make automatic authentication calls
export const base44 = createClient({
  appId: "6899d409b92bf3bf423119f5", 
  requiresAuth: false,
  autoAuth: false // Disable automatic authentication checks
});