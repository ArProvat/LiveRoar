"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage({ searchParams }: { searchParams?: { registered?: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams?.registered === "1") {
      setSuccess("Account created! Please log in.");
    }
  }, [searchParams]);

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-orange-600/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />

      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border-slate-700/60 shadow-2xl shadow-black/40 animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Login to LiveRoar</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-400 text-sm animate-fade-in-up-delay-1">{error}</p>}
            {success && <p className="text-green-400 text-sm animate-fade-in-up-delay-1">{success}</p>}
            <div className="space-y-2 animate-fade-in-up-delay-1">
              <Label htmlFor="email" className="text-slate-400">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                required
              />
            </div>
            <div className="space-y-2 animate-fade-in-up-delay-2">
              <Label htmlFor="password" className="text-slate-400">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 animate-fade-in-up-delay-3">
              Login
            </Button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-4 animate-fade-in-up-delay-4">
            Don&apos;t have an account?{" "}
            <Link href="/user/register" className="text-red-400 hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
