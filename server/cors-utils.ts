/**
 * CORS utility functions for open CORS configuration
 */

// Get CORS headers for responses - always open to all origins
export const getCorsHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
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
