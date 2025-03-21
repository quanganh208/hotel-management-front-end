import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

// Sử dụng authOptions từ lib/auth.ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
