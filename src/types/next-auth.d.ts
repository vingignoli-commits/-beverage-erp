import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      username?: string | null;
      roles?: string[];
    };
  }

  interface User {
    id: string;
    username?: string;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    username?: string;
    roles?: string[];
  }
}