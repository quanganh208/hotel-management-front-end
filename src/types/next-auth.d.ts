import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
  }
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: string;
  _id: string;
  name: string;
  email: string;
  accountType: string;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}
