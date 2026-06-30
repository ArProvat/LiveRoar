"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { API_URL } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.push("/matches");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login to LiveRoar</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </div>
        <p className="text-center text-sm text-slate-400 mt-4">
          Don&apos;t have an account?{" "}
          <a href="/user/register" className="text-red-400 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
