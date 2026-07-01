"use client";

import { useState } from "react";
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
import { ArrowRight, Mail, Lock, UserPlus, ShieldCheck, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      router.push("/user/login?registered=1");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.18),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/5 to-transparent" />
      <div className="absolute right-1/2 top-24 h-64 w-64 translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <section className="max-w-xl space-y-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-orange-400" />
            Start in minutes
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Create your LiveRoar account.</h1>
            <p className="max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              Join live streams, follow your favorite clubs, and get alerts before kickoff.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Fast signup flow",
              "Match reminders",
              "Live sports access",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-xl">
                {item}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Your account is protected from the first step.
          </div>
        </section>

        <Card className="w-full max-w-md border-white/10 bg-slate-900/80 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Create Account</CardTitle>
              <CardDescription className="mt-2 text-slate-400">
                Join LiveRoar to watch live sports.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <div className="relative">
                  <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 border-white/10 bg-slate-950/60 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/40"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-white/10 bg-slate-950/60 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/40"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-white/10 bg-slate-950/60 pl-10 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/40"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <Button type="submit" className="h-12 w-full gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-600/20 transition-transform duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-red-500">
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/user/login" className="font-medium text-orange-400 transition-colors hover:text-orange-300 hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
