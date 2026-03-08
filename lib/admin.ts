import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function getAdminSession() {
  if (!ADMIN_EMAIL) return null;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  const email = (session.user as { email?: string | null }).email;
  if (email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;
  return session;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!ADMIN_EMAIL || !email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
