import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role: Role;
      chamaId: string;
      memberId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    chamaId?: string;
    memberId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    chamaId?: string;
    memberId?: string;
  }
}

export {};
