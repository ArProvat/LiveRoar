import { redirect } from "next/navigation";
import api from "@/lib/api";

export async function getMe(): Promise<any> {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getMe();
  if (!user) {
    redirect("/user/login");
  }
  return user;
}
