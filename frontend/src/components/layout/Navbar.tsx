"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Play } from "lucide-react";

const navLinks = [
  { href: "/matches", label: "Matches" },
  { href: "/channels", label: "Channels" },
  {
    label: "Sports",
    children: [
      { href: "/matches?sport=football", label: "Football" },
      { href: "/matches?sport=cricket", label: "Cricket" },
      { href: "/matches?sport=ufc", label: "UFC" },
      { href: "/matches?sport=basketball", label: "Basketball" },
      { href: "/matches?sport=tennis", label: "Tennis" },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-black/20"
            : "bg-transparent"
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
          </div>
        </div>
      </div>
    </>
  );
}
