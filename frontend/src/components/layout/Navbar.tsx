"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Play, LogOut, User } from "lucide-react";
import api from "@/lib/api";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
}

const navLinks = [
  { href: "/matches", label: "Matches" },
  { href: "/channels", label: "Channels" },
  {
    label: "Sports",
    children: [
      { href: "/matches?sport_category=football", label: "Football" },
      { href: "/matches?sport_category=cricket", label: "Cricket" },
      { href: "/matches?sport_category=ufc", label: "UFC" },
      { href: "/matches?sport_category=basketball", label: "Basketball" },
      { href: "/matches?sport_category=tennis", label: "Tennis" },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setUser(null);
      setAuthChecked(true);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      // Cache user data locally to avoid refetching
      localStorage.setItem("user_data", JSON.stringify(data));
    } catch {
      // Token expired or invalid — clear it
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Fetch user on mount or if cached data exists
  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("user_data") : null;
    if (cached) {
      setUser(JSON.parse(cached));
      setAuthChecked(true);
    }
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setUser(null);
    window.location.href = "/";
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-black/20"
            : "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">
              <span className="text-white text-sm font-black">R</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              LiveRoar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <div key={link.href || link.label} className="relative">
                {link.children ? (
                  <>
                    <button
                      onMouseEnter={() => setOpenDropdown(i)}
                      onMouseLeave={() => setOpenDropdown(null)}
                      className="flex items-center gap-1 text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          openDropdown === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === i && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {authChecked && user ? (
              <>
                {/* User Avatar + Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 99 ? null : 99)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-red-500/40 transition-all">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name || "U"} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white max-w-[100px] truncate transition-colors">
                      {user.name || "User"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        openDropdown === 99 ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === 99 && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800/60">
                        <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/user/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => { setOpenDropdown(null); handleLogout(); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : authChecked ? (
              <>
                <Link href="/user/login">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/user/register">
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/20">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Sign Up Free
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 sm:w-80 bg-slate-950/98 backdrop-blur-xl border-l border-slate-800/60 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-8">
          {/* Mobile Nav Links */}
          <div className="flex-1 px-4 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                    {link.label}
                  </div>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile Auth */}
          <div className="px-4 space-y-3 border-t border-slate-800/60 pt-6">
            {authChecked && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name || "U"} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/user/profile"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </button>
              </>
            ) : (
              <>
                <Link href="/user/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/user/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
