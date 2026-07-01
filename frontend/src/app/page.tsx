import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  MessageCircle,
  Monitor,
  Play,
  Star,
  Sparkles,
  Trophy,
  Wifi,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const heroMetrics = [
  { value: "1.8s", label: "average live delay" },
  { value: "12K+", label: "fans chatting at peak" },
  { value: "500+", label: "matches each month" },
  { value: "99.9%", label: "stream uptime target" },
];

const watchLanes = [
  {
    title: "Football",
    description: "Premier League, Champions League, and every tension-soaked extra minute.",
    tag: "Main stage",
    border: "border-emerald-400/20",
    accent: "from-emerald-400/25 via-emerald-400/10 to-transparent",
  },
  {
    title: "Cricket",
    description: "Power plays, wickets, and all-day drama built for long-form viewing.",
    tag: "Always moving",
    border: "border-amber-400/20",
    accent: "from-amber-400/25 via-amber-400/10 to-transparent",
  },
  {
    title: "UFC",
    description: "Fight nights, PPV cards, and knockout moments with no spoiler lag.",
    tag: "High voltage",
    border: "border-red-400/20",
    accent: "from-red-400/25 via-red-400/10 to-transparent",
  },
  {
    title: "Basketball",
    description: "Fast breaks, last-second threes, and the kind of pace that never breathes.",
    tag: "Fast lane",
    border: "border-orange-400/20",
    accent: "from-orange-400/25 via-orange-400/10 to-transparent",
  },
  {
    title: "Tennis",
    description: "Grand slams, ATP, WTA, and the quiet pressure of every breakpoint.",
    tag: "Precision",
    border: "border-cyan-400/20",
    accent: "from-cyan-400/25 via-cyan-400/10 to-transparent",
  },
];

const experienceCards = [
  {
    icon: Zap,
    title: "Low-latency by design",
    description:
      "We keep the delay tight so reactions feel immediate, spoilers stay out, and live moments actually feel live.",
    stat: "Broadcast close to live",
  },
  {
    icon: MessageCircle,
    title: "Fan energy in real time",
    description:
      "Watch with a crowd, not alone. The live chat layer turns every goal, dunk, and takedown into a shared event.",
    stat: "Built for matchday noise",
  },
  {
    icon: Monitor,
    title: "Looks sharp everywhere",
    description:
      "The interface adapts from phone to ultrawide, keeping the stream, the context, and the controls easy to scan.",
    stat: "Desktop, tablet, mobile",
  },
  {
    icon: Bell,
    title: "Reminders that matter",
    description:
      "Mark what you care about and get back in before kickoff, tipoff, or the walkout.",
    stat: "Never miss the start",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Start in seconds, save your favorite sports, and set the tone for what you want to follow.",
  },
  {
    step: "02",
    title: "Choose the matchup",
    description:
      "Browse live and upcoming games, jump between leagues, and land on the action that matters right now.",
  },
  {
    step: "03",
    title: "Watch and react",
    description:
      "Open the stream, join the crowd, and follow every swing without leaving the page.",
  },
];

const testimonials = [
  {
    name: "Alex M.",
    role: "Weekend football addict",
    quote:
      "The layout feels like a broadcast control room instead of a basic streaming site. It has a real identity.",
  },
  {
    name: "Sarah K.",
    role: "Cricket regular",
    quote:
      "The live dashboard makes it easy to jump between matches. It is the first sports landing page that feels intentional.",
  },
  {
    name: "James R.",
    role: "Fight night viewer",
    quote:
      "Strong contrast, bold motion, and no clutter. It feels premium without becoming sterile.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#040816] text-white">
      <section className="relative isolate">
        <div
          className="pointer-events-none absolute inset-0 opacity-90 hero-noise"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 12% 18%, rgba(239, 68, 68, 0.24), transparent 0 22%)",
              "radial-gradient(circle at 88% 10%, rgba(59, 130, 246, 0.22), transparent 0 20%)",
              "radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.16), transparent 0 28%)",
              "linear-gradient(180deg, rgba(4, 8, 22, 0.7) 0%, rgba(4, 8, 22, 0.95) 58%, rgba(2, 4, 12, 1) 100%)",
            ].join(", "),
          }}
        />
        <div className="pointer-events-none absolute inset-0 hero-grid" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-[110px] hero-orb" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-2xl">
            <Badge className="border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-red-100">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Live sports, Roared up
            </Badge>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              A sharper way to
              <span className="mt-2 block bg-gradient-to-r from-white via-red-100 to-orange-300 bg-clip-text text-transparent">
                watch the match live.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              LiveRoar turns sports streaming into a cinematic, real-time experience.
              Track the action, feel the crowd, and move between football, cricket, UFC, basketball, and tennis without losing the moment.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/user/register">
                <Button
                  size="lg"
                  className="h-14 bg-white px-6 text-slate-950 shadow-[0_18px_48px_rgba(255,255,255,0.12)] hover:bg-white/90"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start watching
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/matches">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  Browse matches
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {["HD adaptive streams", "Live chat", "Instant reminders", "Multi-device"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-red-500/10 blur-[90px]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/65 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3">
                    <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-400/60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-400" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">On air now</p>
                    <p className="text-sm font-medium text-white">Featured live event</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Wifi className="h-4 w-4 text-slate-400" />
                  1.8s delay
                </div>
          </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.9))] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-red-100">
                        <Trophy className="mr-1.5 h-3.5 w-3.5" />
                        Main match
                      </Badge>
                      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                        Chelsea 2 - 1 Arsenal
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">Premier League, second half, 72 minutes.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Watch now</p>
                      <p className="mt-1 text-sm font-medium text-white">124k viewers</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Match rhythm</span>
                      <span className="text-white">72%</span>
                    </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-red-400 via-orange-400 to-amber-300" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                      {[
                        { label: "Chat", value: "12.4k" },
                        { label: "Latency", value: "1.8s" },
                        { label: "Quality", value: "4K HDR" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
                          <p className="text-slate-500">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Up next</p>
                    <div className="mt-4 space-y-3">
                      {[
                        ["India vs Australia", "Cricket", "Starts in 24 min"],
                        ["UFC Fight Night", "Main card", "Starts in 1h 10m"],
                      ].map(([title, type, time]) => (
                        <div
                          key={title}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-white">{title}</p>
                            <p className="text-sm text-slate-400">{type}</p>
                          </div>
                          <p className="text-right text-xs text-slate-400">{time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))] p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Fan pulse</p>
                    <div className="mt-4 space-y-3">
                      {[
                        "That finish was outrageous.",
                        "Stream is crisp even on mobile data.",
                        "Chat is moving faster than the clock.",
                      ].map((line, index) => (
                        <div
                          key={line}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-xs font-semibold text-white">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-6 text-slate-300">{line}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Adaptive bitrate", "Instant alerts", "Broad device support"].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-400"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["500+", "matches every month"],
              ["24/7", "coverage across time zones"],
              ["HD", "adaptive stream quality"],
              ["Live", "chat built into the watch flow"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Badge className="border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300">
              Built for matchday
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Every sport gets its own stage.
            </h2>
            <p className="mt-4 max-w-xl text-slate-400">
              The landing page should feel like the product: bold, high-energy, and structured around the live moment.
            </p>
          </div>
          <Link href="/matches" className="text-sm font-medium text-red-300 transition-colors hover:text-white">
            Explore the full schedule
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {watchLanes.map((lane) => (
            <Link key={lane.title} href={`/matches?sport=${lane.title.toLowerCase()}`}>
              <Card
                className={`group h-full overflow-hidden border ${lane.border} bg-white/5 py-0 shadow-lg shadow-black/20 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10`}
              >
                <div className={`h-1 bg-gradient-to-r ${lane.accent}`} />
                <CardContent className="relative flex h-full flex-col justify-between p-5">
                  <div className="flex items-center justify-between gap-4">
                    <Badge className="border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300">
                      {lane.tag}
                    </Badge>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                  </div>
                  <div className="mt-10">
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-white">{lane.title}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{lane.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[26rem] -translate-y-1/2 rounded-full bg-red-500/5 blur-[120px]" />
        <div className="relative">
          <div className="max-w-2xl">
            <Badge className="border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-red-100">
              Why it feels different
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              The interface is built like a live broadcast, not a brochure.
            </h2>
            <p className="mt-4 text-slate-400">
              We focused on signal, motion, and hierarchy. Every panel should make the next decision obvious.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {experienceCards.map((card) => (
              <Card
                key={card.title}
                className="group overflow-hidden border-white/10 bg-white/5 py-0 shadow-lg shadow-black/20 transition-transform duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70">
                      <card.icon className="h-5 w-5 text-red-300" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.stat}</p>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <Badge className="border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300">
            Three steps to live
          </Badge>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            From sign-up to stream in under a minute.
          </h2>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-red-400/60 to-transparent lg:block" />
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-5 w-5 -translate-x-1/2 rounded-full border border-red-300/70 bg-red-400 shadow-[0_0_0_14px_rgba(239,68,68,0.12)] lg:block timeline-orb" />
          <div className="grid gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <Card
                key={step.step}
                className={`timeline-step relative overflow-hidden border-white/10 bg-white/5 py-0 shadow-lg shadow-black/20 ${index % 2 === 0 ? "lg:-translate-x-6" : "lg:translate-x-6"}`}
              >
                <CardContent className="p-6 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex items-center gap-4 sm:w-72 sm:shrink-0">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-300 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(239,68,68,0.28)] timeline-badge">
                          {step.step}
                        </div>
                        <div className="absolute -inset-2 rounded-[1.25rem] border border-white/10 opacity-50 timeline-ring" />
                      </div>
                      <div>
                        <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                          Step {index + 1}
                        </div>
                        <p className="mt-3 text-sm uppercase tracking-[0.28em] text-slate-500">
                          {index === 0 ? "Start" : index === 1 ? "Pick" : "Go live"}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">{step.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Badge className="border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300">
              Loved by viewers
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              People notice the difference immediately.
            </h2>
          </div>
          <div className="hidden items-center gap-1 text-xs uppercase tracking-[0.24em] text-slate-500 sm:flex">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="overflow-hidden border-white/10 bg-white/5 py-0 shadow-lg shadow-black/20"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-6 text-lg leading-8 text-slate-200">
                  {`"${testimonial.quote}"`}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-sm font-semibold text-white">
                    {testimonial.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.34),rgba(2,6,23,0.92)_55%,rgba(14,165,233,0.12))] px-6 py-10 shadow-2xl shadow-black/30 sm:px-10 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_22%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Badge className="border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white">
                Final call
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Ready for a landing page that actually feels alive?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Join LiveRoar and turn matchday into a polished, high-energy experience from the first click.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/user/register">
                <Button size="lg" className="h-14 bg-white px-6 text-slate-950 hover:bg-white/90">
                  Create free account
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/matches">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/15 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore matches
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-sm font-semibold text-white">
                LR
              </div>
              <div>
                <p className="text-lg font-semibold text-white">LiveRoar</p>
                <p className="text-sm text-slate-400">Watch. Feel. Roar.</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              A modern sports platform built for live action, fan energy, and a cleaner viewing flow.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li><Link href="/matches" className="transition-colors hover:text-white">Matches</Link></li>
              <li><Link href="/channels" className="transition-colors hover:text-white">Channels</Link></li>
              <li><Link href="/user/register" className="transition-colors hover:text-white">Sign up</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Sports</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li><Link href="/matches?sport=football" className="transition-colors hover:text-white">Football</Link></li>
              <li><Link href="/matches?sport=cricket" className="transition-colors hover:text-white">Cricket</Link></li>
              <li><Link href="/matches?sport=ufc" className="transition-colors hover:text-white">UFC</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="transition-colors hover:text-white">About</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Contact</Link></li>
              <li><Link href="#" className="transition-colors hover:text-white">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>(c) {new Date().getFullYear()} LiveRoar. All rights reserved.</p>
            <p>Only stream content with proper broadcasting rights.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
