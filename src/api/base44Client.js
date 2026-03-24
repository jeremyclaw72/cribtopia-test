// Mock Base44 client for local development
import { createClient } from '@/base44/sdk';

// Mock app params (would come from Base44 platform in production)
const appParams = {
  token: null,
  functionsVersion: 'v1',
  appBaseUrl: 'http://localhost:5173',
};

const { token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: "69b1a2ff64aa2c797de555bf",
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl
});