// TYPE DE LA SESSION
import NextAuth from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: Role;
  }
  interface Session {
    user: User & { id: string; username: string; role: Role };
    token: {
      id: string;
      username: string;
      role: Role;
    };
  }
}
