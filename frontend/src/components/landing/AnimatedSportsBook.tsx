"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Globe2,
  Play,
  Radar,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Waves,
  Zap,
} from "lucide-react";

interface FloatingOrbProps {
  className: string;
}

interface StatItemProps {
  value: string;
  label: string;
}

interface CTAButtonsProps {
  primaryHref: string;
  secondaryHref: string;
}

interface PageShellProps {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

interface MetricCardProps {
  label: string;
  value: string;
  accentClassName: string;
}

interface MapNodeProps {
  className: string;
  region: string;
}

const SPORTS_BOOK_PAGES = ["global", "football", "cricket", "mma"] as const;

type SportsBookPage = (typeof SPORTS_BOOK_PAGES)[number];

function FloatingOrb({ className }: FloatingOrbProps) {
  return <div aria-hidden="true" className={className} />;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="rounded-[24px] border border-white/50 bg-white/60 px-5 py-4 shadow-[0_18px_45px_rgba(17,24,39,0.08)] backdrop-blur-xl">
      <p className="text-2xl font-bold tracking-[-0.04em] text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function CTAButtons({ primaryHref, secondaryHref }: CTAButtonsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <a
        href={primaryHref}
        className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#dc2626,#f97316)] px-7 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(220,38,38,0.26)] transition-transform duration-300 hover:-translate-y-1"
      >
        Enter the Broadcast
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
      <a
        href={secondaryHref}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white/85 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 hover:bg-white/10"
      >
        <Play className="h-4 w-4 fill-current" />
        Explore Channels
      </a>
    </div>
  );
}

function MetricCard({ label, value, accentClassName }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className={`h-1.5 w-16 rounded-full ${accentClassName}`} />
      <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PageShell({ icon: Icon, eyebrow, title, description, children }: PageShellProps) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,248,255,0.82))] p-5 shadow-[0_30px_70px_rgba(30,64,175,0.12)] backdrop-blur-2xl sm:p-6">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-slate-500">
              <Icon className="h-3.5 w-3.5 text-sky-500" />
              {eyebrow}
            </div>
            <h3 className="mt-4 text-[1.65rem] font-bold tracking-[-0.04em] text-slate-900 sm:text-[1.85rem]">{title}</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">{description}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-right shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">AI feed</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Live update</p>
          </div>
        </div>
        <div className="relative mt-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

function MapNode({ className, region }: MapNodeProps) {
  return (
    <div className={`absolute ${className}`}>
      <div className="sports-book-dot relative h-3 w-3 rounded-full bg-[linear-gradient(135deg,#20A8F4,#B9A7FF)] shadow-[0_0_0_8px_rgba(32,168,244,0.12)]" />
      <span className="mt-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{region}</span>
    </div>
  );
}

function GlobalCoveragePage() {
  return (
    <PageShell
      icon={Globe2}
      eyebrow="Global Coverage"
      title="Global Sports Coverage"
      description="Track worldwide sports events, leagues, and match updates in real time."
    >
      <div className="absolute inset-x-0 top-0 h-28 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(32,168,244,0.18),transparent_62%)]" />
      <div className="relative h-full rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(236,245,255,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="absolute inset-6 rounded-[24px] border border-sky-100/80" />
        <svg viewBox="0 0 520 280" className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-slate-300/85">
          <path d="M56 146c18-22 54-38 101-46 24-4 52-5 77 1 17 4 32 15 46 15 12 0 26-6 40-6 15 0 26 6 40 11 16 5 35 7 53 4 21-4 39-14 58-20v91H60l-4-50z" fill="url(#mapFill)" opacity="0.82" />
          <path d="M110 116c13-18 31-31 53-37 11-3 23-4 34-4 17 0 35 3 49 12 12 8 21 19 33 20 16 1 29-8 45-7 22 1 41 14 62 12 11-1 24-6 34-11" fill="none" stroke="rgba(148,163,184,0.44)" strokeWidth="7" strokeLinecap="round" />
          <path d="M92 165c32 10 69 10 105 3 29-6 57-18 86-17 23 1 42 11 64 16 25 5 52 4 80-1 18-3 35-9 50-16" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="6" strokeLinecap="round" />
          <path d="M130 112C176 82 233 79 273 97c23 10 36 27 61 31 26 4 46-10 70-12 26-2 52 11 78 10" fill="none" stroke="rgba(11,95,255,0.24)" strokeWidth="2.5" strokeDasharray="7 9" />
          <path d="M148 171C204 178 249 144 303 146c40 2 59 27 107 20 23-4 49-16 71-28" fill="none" stroke="rgba(32,168,244,0.24)" strokeWidth="2.5" strokeDasharray="9 11" />
          <defs>
            <linearGradient id="mapFill" x1="60" y1="80" x2="450" y2="226" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(255,255,255,0.94)" />
              <stop offset="0.52" stopColor="rgba(222,238,255,0.92)" />
              <stop offset="1" stopColor="rgba(216,227,255,0.9)" />
            </linearGradient>
          </defs>
        </svg>
        <MapNode className="left-[13%] top-[34%]" region="North America" />
        <MapNode className="left-[23%] top-[62%]" region="South America" />
        <MapNode className="left-[47%] top-[28%]" region="Europe" />
        <MapNode className="left-[54%] top-[58%]" region="Africa" />
        <MapNode className="left-[72%] top-[38%]" region="Asia" />
        <div className="absolute bottom-4 right-4 grid w-[46%] gap-3 sm:w-[42%]">
          <MetricCard label="Regions" value="45+ countries" accentClassName="bg-[linear-gradient(135deg,#20A8F4,#0B5FFF)]" />
          <MetricCard label="Matches" value="24/7 updates" accentClassName="bg-[linear-gradient(135deg,#B9A7FF,#20A8F4)]" />
        </div>
      </div>
    </PageShell>
  );
}

function FootballPage() {
  return (
    <PageShell
      icon={Trophy}
      eyebrow="Football"
      title="Football Match Intelligence"
      description="AI-powered previews, player movement, team form, and match momentum."
    >
      <div className="relative h-full overflow-hidden rounded-[26px] border border-emerald-100/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.85),rgba(248,250,252,0.94))] p-4">
        <div className="absolute inset-4 rounded-[24px] border border-emerald-200/80" />
        <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-emerald-200/80" />
        <div className="absolute left-1/2 top-10 bottom-10 w-px -translate-x-1/2 bg-emerald-200/70" />
        <div className="absolute left-8 right-8 top-10 h-[calc(100%-5rem)] rounded-[22px] border border-emerald-200/70" />
        <div className="sports-book-stadium absolute inset-x-10 bottom-8 h-16 rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),rgba(16,185,129,0.02))] blur-sm" />
        <div className="absolute left-[16%] bottom-[27%] sports-book-float-short">
          <div className="relative h-28 w-20">
            <div className="absolute left-6 top-0 h-10 w-8 rounded-full bg-[#FFD0B7]" />
            <div className="absolute left-5 top-9 h-12 w-10 rounded-[14px] bg-[linear-gradient(180deg,#0B5FFF,#20A8F4)]" />
            <div className="absolute left-1 top-12 h-8 w-5 rounded-full bg-[#20A8F4] rotate-[22deg]" />
            <div className="absolute right-0 top-14 h-8 w-5 rounded-full bg-[#0B5FFF] -rotate-[12deg]" />
            <div className="absolute left-6 bottom-0 h-11 w-4 rounded-full bg-slate-900 -rotate-[6deg]" />
            <div className="absolute left-11 bottom-0 h-12 w-4 rounded-full bg-white rotate-[18deg]" />
          </div>
        </div>
        <div className="absolute right-[16%] bottom-[27%] sports-book-float-medium">
          <div className="relative h-28 w-20">
            <div className="absolute left-6 top-0 h-10 w-8 rounded-full bg-[#FFDCCB]" />
            <div className="absolute left-5 top-9 h-12 w-10 rounded-[14px] bg-[linear-gradient(180deg,#B9A7FF,#6D7CFF)]" />
            <div className="absolute left-1 top-14 h-8 w-5 rounded-full bg-[#B9A7FF] rotate-[18deg]" />
            <div className="absolute right-1 top-11 h-8 w-5 rounded-full bg-[#6D7CFF] -rotate-[30deg]" />
            <div className="absolute left-5 bottom-0 h-12 w-4 rounded-full bg-slate-900 rotate-[8deg]" />
            <div className="absolute left-11 bottom-1 h-11 w-4 rounded-full bg-[#20A8F4] -rotate-[18deg]" />
          </div>
        </div>
        <div className="sports-book-ball absolute right-[36%] bottom-[28%] h-8 w-8 rounded-full border border-slate-300 bg-white shadow-[0_10px_18px_rgba(15,23,42,0.16)]" />
        <div className="absolute right-[30%] bottom-[39%] h-1 w-20 rounded-full bg-[linear-gradient(90deg,rgba(32,168,244,0),rgba(32,168,244,0.7),rgba(32,168,244,0))] blur-[1px]" />
        <div className="absolute bottom-4 left-4 grid w-[46%] gap-3 sm:w-[40%]">
          <MetricCard label="Possession" value="61% home" accentClassName="bg-[linear-gradient(135deg,#20A8F4,#0B5FFF)]" />
          <MetricCard label="Shots" value="17 total" accentClassName="bg-[linear-gradient(135deg,#34D399,#10B981)]" />
          <MetricCard label="Player Rating" value="8.9 striker" accentClassName="bg-[linear-gradient(135deg,#B9A7FF,#8B5CF6)]" />
        </div>
      </div>
    </PageShell>
  );
}

function CricketPage() {
  return (
    <PageShell
      icon={Target}
      eyebrow="Cricket"
      title="Cricket Live Insights"
      description="Follow overs, wickets, strike rate, partnerships, and match predictions."
    >
      <div className="relative h-full overflow-hidden rounded-[26px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.92),rgba(248,250,252,0.94))] p-4">
        <div className="absolute inset-x-7 bottom-8 h-20 rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.18),rgba(217,119,6,0.04))] blur-sm" />
        <div className="absolute inset-x-8 top-[38%] h-px bg-amber-200/70" />
        <div className="absolute left-[22%] bottom-[21%] sports-book-float-medium">
          <div className="relative h-32 w-24">
            <div className="absolute left-8 top-0 h-10 w-8 rounded-full bg-[#FFD7BF]" />
            <div className="absolute left-7 top-9 h-14 w-10 rounded-[16px] bg-[linear-gradient(180deg,#20A8F4,#0B5FFF)]" />
            <div className="absolute left-2 top-13 h-8 w-5 rounded-full bg-[#20A8F4] -rotate-[20deg]" />
            <div className="absolute right-1 top-16 h-8 w-5 rounded-full bg-[#0B5FFF] rotate-[35deg]" />
            <div className="absolute left-8 bottom-0 h-14 w-4 rounded-full bg-slate-900 rotate-[6deg]" />
            <div className="absolute left-13 bottom-0 h-13 w-4 rounded-full bg-white -rotate-[14deg]" />
            <div className="absolute right-2 top-14 h-20 w-2 origin-bottom rounded-full bg-[#C97B2E] rotate-[28deg]" />
          </div>
        </div>
        <div className="absolute right-[18%] bottom-[21%] sports-book-float-short">
          <div className="relative h-30 w-20">
            <div className="absolute left-6 top-0 h-10 w-8 rounded-full bg-[#FFE2D4]" />
            <div className="absolute left-5 top-9 h-14 w-10 rounded-[16px] bg-[linear-gradient(180deg,#F6A6D7,#B9A7FF)]" />
            <div className="absolute left-1 top-14 h-8 w-5 rounded-full bg-[#F6A6D7] rotate-[10deg]" />
            <div className="absolute right-0 top-11 h-8 w-5 rounded-full bg-[#B9A7FF] -rotate-[32deg]" />
            <div className="absolute left-5 bottom-0 h-14 w-4 rounded-full bg-slate-900 rotate-[6deg]" />
            <div className="absolute left-11 bottom-0 h-13 w-4 rounded-full bg-[#F6A6D7] -rotate-[10deg]" />
          </div>
        </div>
        <div className="absolute left-[43%] top-[34%] h-4 w-4 rounded-full bg-[linear-gradient(135deg,#F97316,#DC2626)] shadow-[0_8px_18px_rgba(220,38,38,0.2)] sports-book-ball" />
        <svg viewBox="0 0 240 110" className="absolute left-[37%] top-[31%] h-28 w-56 text-orange-300/80">
          <path d="M10 82C54 13 106 3 226 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 10" />
        </svg>
        <div className="absolute bottom-4 right-4 grid w-[46%] gap-3 sm:w-[40%]">
          <MetricCard label="Run Rate" value="8.7 / over" accentClassName="bg-[linear-gradient(135deg,#F59E0B,#F97316)]" />
          <MetricCard label="Wickets" value="4 down" accentClassName="bg-[linear-gradient(135deg,#20A8F4,#0B5FFF)]" />
          <MetricCard label="Win Probability" value="67% chase" accentClassName="bg-[linear-gradient(135deg,#F6A6D7,#B9A7FF)]" />
        </div>
      </div>
    </PageShell>
  );
}

function MMAPage() {
  return (
    <PageShell
      icon={Shield}
      eyebrow="MMA / UFC"
      title="MMA Fight Analytics"
      description="Analyze fight momentum, striking accuracy, takedowns, and round-by-round performance."
    >
      <div className="relative h-full overflow-hidden rounded-[26px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(226,232,240,0.92),rgba(248,250,252,0.98))] p-4">
        <div className="absolute inset-6 rounded-[30px] border border-slate-300/80 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.16),transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-[65%] w-[65%] -translate-x-1/2 -translate-y-1/2 rotate-[8deg] rounded-[30%] border border-slate-300/80" />
        <div className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rotate-[8deg] rounded-[24%] border border-slate-300/60" />
        <div className="absolute inset-x-12 top-6 h-16 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(255,255,255,0))] blur-xl" />
        <div className="absolute left-[28%] bottom-[23%] sports-book-float-medium">
          <div className="relative h-32 w-24">
            <div className="absolute left-8 top-0 h-10 w-8 rounded-full bg-[#FFD7C0]" />
            <div className="absolute left-7 top-9 h-14 w-10 rounded-[16px] bg-[linear-gradient(180deg,#0F172A,#334155)]" />
            <div className="absolute left-2 top-14 h-8 w-5 rounded-full bg-[#334155] -rotate-[18deg]" />
            <div className="absolute right-0 top-12 h-8 w-5 rounded-full bg-[#0F172A] rotate-[26deg]" />
            <div className="absolute left-8 bottom-0 h-14 w-4 rounded-full bg-[#0F172A] rotate-[8deg]" />
            <div className="absolute left-13 bottom-0 h-13 w-4 rounded-full bg-[#334155] -rotate-[12deg]" />
          </div>
        </div>
        <div className="absolute right-[25%] bottom-[23%] sports-book-float-short">
          <div className="relative h-32 w-24">
            <div className="absolute left-8 top-0 h-10 w-8 rounded-full bg-[#FFE1D2]" />
            <div className="absolute left-7 top-9 h-14 w-10 rounded-[16px] bg-[linear-gradient(180deg,#20A8F4,#6D7CFF)]" />
            <div className="absolute left-2 top-12 h-8 w-5 rounded-full bg-[#20A8F4] rotate-[18deg]" />
            <div className="absolute right-0 top-13 h-8 w-5 rounded-full bg-[#6D7CFF] -rotate-[28deg]" />
            <div className="absolute left-8 bottom-0 h-14 w-4 rounded-full bg-[#0F172A] rotate-[8deg]" />
            <div className="absolute left-13 bottom-0 h-13 w-4 rounded-full bg-[#20A8F4] -rotate-[12deg]" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 grid w-[48%] gap-3 sm:w-[42%]">
          <MetricCard label="Strikes" value="74 landed" accentClassName="bg-[linear-gradient(135deg,#0F172A,#334155)]" />
          <MetricCard label="Takedowns" value="5 attempts" accentClassName="bg-[linear-gradient(135deg,#20A8F4,#0B5FFF)]" />
          <MetricCard label="Round Score" value="29-28 edge" accentClassName="bg-[linear-gradient(135deg,#B9A7FF,#6D7CFF)]" />
        </div>
      </div>
    </PageShell>
  );
}

export function AnimatedSportsBook() {
  const [activePage, setActivePage] = useState<SportsBookPage>(SPORTS_BOOK_PAGES[0]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePage((currentPage) => {
        const currentIndex = SPORTS_BOOK_PAGES.indexOf(currentPage);
        return SPORTS_BOOK_PAGES[(currentIndex + 1) % SPORTS_BOOK_PAGES.length];
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const pages = useMemo(
    () => ({
      global: <GlobalCoveragePage />,
      football: <FootballPage />,
      cricket: <CricketPage />,
      mma: <MMAPage />,
    }),
    []
  );

  return (
    <section className="relative flex w-full justify-center lg:justify-end" aria-label="Animated sports insights book">
      <FloatingOrb className="sports-book-orb sports-book-orb-blue absolute -left-10 top-14 h-40 w-40 rounded-full blur-3xl" />
      <FloatingOrb className="sports-book-orb sports-book-orb-pink absolute right-8 top-0 h-24 w-24 rounded-full blur-2xl" />
      <FloatingOrb className="sports-book-orb sports-book-orb-purple absolute -right-4 bottom-10 h-32 w-32 rounded-full blur-3xl" />
      <div className="relative w-full max-w-[720px] perspective-[2200px]">
        <div className="sports-book-float relative mx-auto aspect-[1.12] w-full max-w-[690px]">
          <div className="absolute inset-0 translate-y-10 scale-[0.94] rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(11,95,255,0.14),rgba(11,95,255,0))] blur-3xl" />
          <div className="absolute inset-x-8 bottom-6 h-12 rounded-full bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.18),rgba(30,64,175,0))] blur-2xl" />
          <div className="absolute inset-0 rounded-[42px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.58),rgba(255,255,255,0.16))] shadow-[0_45px_110px_rgba(15,23,42,0.16)] backdrop-blur-2xl" />
          <div className="absolute left-[5%] top-[8%] bottom-[8%] w-[47%] rounded-[34px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(239,246,255,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          <div className="absolute right-[5%] top-[8%] bottom-[8%] w-[47%] rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,248,255,0.82))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          <div className="absolute left-1/2 top-[10%] bottom-[10%] w-[7%] -translate-x-1/2 rounded-[999px] bg-[linear-gradient(180deg,rgba(191,219,254,0.9),rgba(255,255,255,0.1),rgba(191,219,254,0.75))] opacity-90 blur-[1px]" />
          <div className="sports-book-page-turn absolute right-[4.2%] top-[7.5%] h-[85%] w-[46.5%] origin-left rounded-[34px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(239,246,255,0.68))] shadow-[0_28px_70px_rgba(15,23,42,0.18)]" />
          <div className="absolute left-[6.5%] top-[9.5%] right-[6.5%] bottom-[9.5%] overflow-hidden rounded-[30px]">
            <div className="absolute left-0 top-0 bottom-0 w-[48.7%] rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,245,255,0.7))] px-5 py-6">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/75 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                    LiveRoar Broadcast
                  </div>
                  <h2 className="mt-5 max-w-[12rem] text-2xl font-bold tracking-[-0.05em] text-slate-900 sm:text-[2rem]">
                    Sports coverage that feels like a live control room.
                  </h2>
                  <p className="mt-4 max-w-[15rem] text-sm leading-6 text-slate-500">
                    Automatically rotating match intelligence, regional coverage, and sport-specific insight cards in a
                    polished broadcast deck.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Live coverage</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">120+ events monitored</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                      <BarChart3 className="h-4 w-4 text-sky-500" />
                      <p className="mt-2 text-sm font-semibold text-slate-900">Analytics</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Momentum and form at a glance.</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                      <Radar className="h-4 w-4 text-violet-500" />
                      <p className="mt-2 text-sm font-semibold text-slate-900">Signals</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Live previews for every matchup.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[48.7%]">
              <div key={activePage} className="sports-book-page-content relative h-full w-full">
                {pages[activePage]}
              </div>
            </div>
          </div>
          <div className="absolute right-[10%] top-[5%] flex gap-2">
            {SPORTS_BOOK_PAGES.map((page) => (
              <span
                key={page}
                aria-hidden="true"
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  activePage === page ? "w-8 bg-[linear-gradient(135deg,#20A8F4,#0B5FFF)]" : "w-2.5 bg-slate-300/90"
                }`}
              />
            ))}
          </div>
          <div className="absolute right-[8%] bottom-[7%] inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
            Studio deck refresh every 5s
          </div>
          <div className="absolute left-[10%] bottom-[6%] inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <Waves className="h-3.5 w-3.5 text-violet-500" />
            Seamless broadcast loop
          </div>
          <div className="absolute left-[18%] top-[16%] rounded-full border border-white/70 bg-white/75 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-sky-500" />
              Live AI insights
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#040816] pb-20 pt-12 sm:pb-24 sm:pt-16 lg:min-h-screen lg:pb-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(220,38,38,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(185,167,255,0.12),transparent_24%),linear-gradient(135deg,#040816_0%,#08111f_46%,#050b18_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute right-[-12%] top-[-4%] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),rgba(59,130,246,0))] blur-3xl" />
      <div className="absolute right-[-8%] top-[18%] h-[34rem] w-[34rem] rounded-[44%] border border-white/10 bg-white/5 blur-[2px]" />
      <div className="absolute right-[6%] top-[12%] h-[28rem] w-[28rem] rounded-[36%] bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_20px_100px_rgba(0,0,0,0.2)]" />
      <FloatingOrb className="sports-book-orb sports-book-orb-blue absolute left-[8%] top-[22%] h-28 w-28 rounded-full blur-3xl" />
      <FloatingOrb className="sports-book-orb sports-book-orb-pink absolute left-[34%] top-[14%] h-16 w-16 rounded-full blur-2xl" />
      <FloatingOrb className="sports-book-orb sports-book-orb-purple absolute right-[18%] bottom-[18%] h-24 w-24 rounded-full blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:py-12">
        <div className="w-full lg:w-[45%]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-200 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dc2626,#f97316)] text-white shadow-[0_12px_26px_rgba(220,38,38,0.22)]">
              <Sparkles className="h-4 w-4" />
            </div>
            LiveRoar Broadcast
          </div>

          <div className="mt-8 max-w-2xl sports-hero-copy">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-red-400">Premium Sports Intelligence</p>
            <h1 className="mt-5 text-[34px] font-black leading-[1.02] tracking-[-0.06em] text-white sm:text-[44px] lg:text-[64px]">
              Experience the game like a prime-time broadcast.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Follow football, cricket, MMA, and global sports action with intelligent insights, animated match previews,
              live coverage, and AI-powered analysis presented with studio-grade polish.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Live feed</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">HD coverage</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Match desk</span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatItem value="120+" label="Sports Events Covered" />
            <StatItem value="45+" label="Countries" />
            <StatItem value="24/7" label="AI Match Insights" />
          </div>

          <div className="mt-10 sports-hero-cta">
            <CTAButtons primaryHref="/matches" secondaryHref="/channels" />
          </div>
        </div>

        <div className="w-full lg:w-[55%]">
          <div className="mx-auto max-w-[760px] rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-2 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300 backdrop-blur-xl">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_8px_rgba(220,38,38,0.14)]" />
                On Air
              </span>
              <span className="text-slate-400">Broadcast feed</span>
            </div>
            <AnimatedSportsBook />
          </div>
        </div>
      </div>
    </section>
  );
}
