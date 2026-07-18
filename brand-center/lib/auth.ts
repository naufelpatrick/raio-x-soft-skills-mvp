import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function getAdminSession() {
  const token = (await cookies()).get("raio_x_admin_token")?.value;
  if (!token || !url || !serviceKey) return null;
  const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  const adminResponse = await fetch(`${url}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=email,role`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, cache: "no-store" });
  if (!adminResponse.ok) return null;
  const admin = (await adminResponse.json())?.[0];
  return admin && ["owner", "admin", "viewer"].includes(admin.role) ? { email: user.email, role: admin.role } : null;
}
