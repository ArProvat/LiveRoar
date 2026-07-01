"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { User, Mail, LogOut, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setName(res.data.name || "");
        setEmail(res.data.email);
      } catch {
        router.push("/user/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await api.put("/auth/me", { name });
      setUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-slate-900/80 border-slate-800/60 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-red-600/20 via-red-600/10 to-orange-600/20" />

          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-12">
              <Avatar className="w-20 h-20 border-4 border-slate-900 shadow-xl">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl text-white">{user?.name}</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Member since {new Date(user?.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white focus-visible:ring-red-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-slate-800/30 border-slate-700 text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-slate-300">Role</Label>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/30 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300 capitalize">{user?.role || "User"}</span>
                </div>
              </div>

              {/* Success/Error messages */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Profile updated successfully
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="border-slate-700 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
