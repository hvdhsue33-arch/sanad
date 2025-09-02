/**
 * CORS utility functions for dynamic origin handling
 */

// Get CORS origin from environment variables
export const getCorsOrigin = (): string => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    return frontendUrl;
  }
  // Fallback to wildcard if no FRONTEND_URL is set
  return '*';
};

// Get CORS headers for responses
export const getCorsHeaders = () => {
  const origin = getCorsOrigin();
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie'
  };
};

// Middleware to add CORS headers to all responses
export const corsMiddleware = (req: any, res: any, next: any) => {
  const corsHeaders = getCorsHeaders();
  
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};
