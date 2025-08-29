import "express-session";

declare module "express-session" {
  interface SessionData {
    user: {
      id: string;
      username: string;
      role: string;
      tenantId: string;
      firstName?: string;
      lastName?: string;
    };
  }
}

export interface AuthRequest extends Express.Request {
  session: any;
}