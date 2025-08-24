import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client without requiring authentication upfront
export const base44 = createClient({
  appId: "6899d409b92bf3bf423119f5", 
  requiresAuth: false // Allow requests without authentication, handle auth per-page
});
