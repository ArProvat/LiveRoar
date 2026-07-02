"use client";

import Link from "next/link";
import {
  Clapperboard,
  Trophy,
  Radio,
  Shield,
  Mail,
  ArrowUpRight,
} from "lucide-react";

const footerNavs = [
  {
    heading: "Product",
    links: [
      { label: "Live Matches", href: "/matches" },
      { label: "Channels", href: "/channels" },
      { label: "Broadcast Studio", href: "#" },
      { label: "Mobile Apps", href: "#" },
    ],
  },
  {
    heading: "Sports",
    links: [
      { label: "Football", href: "/matches?sport_category=football" },
      { label: "Cricket", href: "/matches?sport_category=cricket" },
      { label: "UFC / MMA", href: "/matches?sport_category=ufc" },
      { label: "Basketball", href: "/matches?sport_category=basketball" },
      { label: "Tennis", href: "/matches?sport_category=tennis" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About LiveRoar", href: "#" },
      { label: "Broadcast Rights", href: "#" },
      { label: "Press Kit", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
] as const;

const bottomLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Licences", href: "#" },
];

function FooterSection({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
        {heading}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ArrowUpRight className="h-3 w-3 -translate-x-full translate-y-0.5 opacity-0 transition-all group-hover:-translate-x-1 group-hover:translate-y-0.5 group-hover:opacity-100" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#030712]">
      {/* Subtle gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.06),transparent_40%)]" />

      {/* CTA Banner */}
      <div className="relative border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-white">
                Ready to watch live sports in style?
              </p>
              <p className="text-xs text-slate-400">
                Join thousands of fans streaming premium content.
              </p>
            </div>
          </div>
          <Link
            href="/user/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 hover:shadow-red-600/40"
          >
            Start Free Trial
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Nav Grid */}
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.6fr_repeat(3,1fr)] lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 flex flex-col gap-5 sm:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-600/30">
                <Clapperboard className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                LiveRoar
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-slate-400">
              Live sports streaming with broadcast-quality production, real-time
              insights, and multi-sport coverage — all in one platform.
            </p>

            {/* Social / Contact Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.38 8.59 8.59 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.32 3.91A12.16 12.16 0 0 1 3 4.79a4.28 4.28 0 0 0 1.32 5.72 4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2 4.27 4.27 0 0 1-1.93.07 4.29 4.29 0 0 0 4 2.97A8.59 8.59 0 0 1 2 18.57a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.72 8.72 0 0 0 22.46 6z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.75 1.75 0 0 0 24 22.27V1.73A1.75 1.75 0 0 0 22.22 0z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.5 6.19a2.81 2.81 0 0 0-1.99-2A24.64 24.64 0 0 0 12 1a24.64 24.64 0 0 0-9.51 3.19 2.81 2.81 0 0 0-2 2C.38 8.62 0 12.07 0 12s.38 3.38 1.49 3.81a24.64 24.64 0 0 0 9.51 3.19 24.64 24.64 0 0 0 9.51-3.19A2.81 2.81 0 0 0 23.5 12c1.12-.44 1.49-3.38 1.49-3.81s-.38-3.38-1.49-3.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                </svg>
              </a>
              <a
                href="mailto:hello@liveroar.com"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          {footerNavs.map((section) => (
            <FooterSection
              key={section.heading}
              heading={section.heading}
              links={section.links}
            />
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} LiveRoar. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-5">
            {bottomLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-slate-600">
            Watch. Feel. Roar.
          </p>
        </div>
      </div>
    </footer>
  );
}
