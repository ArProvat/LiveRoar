import type { ComponentType } from "react";
import { ArrowUpRight, Clapperboard, Radar, Sparkles, Trophy } from "lucide-react";
import SportsCarousel from "@/components/SportsCarousel";
import { HeroSection } from "@/components/landing/AnimatedSportsBook";

interface BroadcastCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone: string;
}

const broadcastCards = [
  {
    icon: Trophy,
    title: "Prime-time hierarchy",
    description:
      "The headline, live cue, and main call to action now land first, with the rest of the page supporting the story instead of competing with it.",
    tone: "from-red-500/30 to-orange-500/10",
  },
  {
    icon: Clapperboard,
    title: "Broadcast framing",
    description:
      "Glass panels, dark stages, and bright feed accents create the feel of a polished studio package rather than a plain product grid.",
    tone: "from-sky-500/25 to-cyan-500/10",
  },
  {
    icon: Radar,
    title: "Multi-sport depth",
    description:
      "The page flows into live coverage, sport discovery, and rotating insights so the landing experience feels curated and active.",
    tone: "from-violet-500/25 to-fuchsia-500/10",
  },
] satisfies BroadcastCardProps[];

const signalPills = [
  "Live coverage",
  "HD feed cues",
  "AI match reads",
  "Studio polish",
];

function BroadcastCard({ icon: Icon, title, description, tone }: BroadcastCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)]">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Broadcast note</span>
        </div>
        <h3 className="mt-6 text-xl font-semibold tracking-[-0.04em] text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </article>
  );
}

function SignalPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300 backdrop-blur-xl">
      {label}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#040816] text-white">
      <HeroSection />

      <section className="relative border-t border-white/10 bg-[linear-gradient(180deg,#040816_0%,#050b18_52%,#070d1b_100%)] py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-red-400" />
                Studio highlights
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
                A landing page that feels like a live sports desk.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                The new layout gives the hero a stronger read, then moves into broadcast-style supporting content so the page
                feels premium, cinematic, and intentionally paced.
              </p>
            </div>

            <a
              href="/matches"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Browse matches
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {broadcastCards.map((card) => (
              <BroadcastCard key={card.title} {...card} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {signalPills.map((pill) => (
              <SignalPill key={pill} label={pill} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#050b18]">
        <SportsCarousel />
      </section>

      <section className="border-t border-white/10 bg-[linear-gradient(180deg,#050b18_0%,#040816_100%)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-red-400/90">LiveRoar editorial desk</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Fast-moving coverage, clear hierarchy, and a visual language that reads like a broadcast package on every screen.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SignalPill label="24/7 updates" />
            <SignalPill label="Multi-sport coverage" />
            <SignalPill label="Premium motion" />
          </div>
        </div>
      </section>
    </main>
  );
}
