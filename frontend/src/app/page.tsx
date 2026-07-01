import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SportsCarousel from "@/components/SportsCarousel";
import {
  Play,
  Zap,
  Users,
  Globe,
  Trophy,
  Monitor,
  Bell,
  MessageCircle,
  Shield,
  ChevronRight,
  Star,
  TrendingUp,
  Wifi,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    description: "Watch every goal, wicket, and knockout as it happens. Our HLS player delivers streams with minimal delay so you never miss a moment.",
  },
  {
    icon: Monitor,
    title: "Crystal HD Quality",
    description: "Adaptive bitrate streaming ensures the best possible quality on any connection — from mobile data to gigabit fiber.",
  },
  {
    icon: Users,
    title: "Live Fan Chat",
    description: "Celebrate, debate, and cheer with fans who share your passion. Real-time chat powered by WebSockets brings the stadium energy home.",
  },
  {
    icon: Bell,
    title: "Never Miss a Match",
    description: "Set reminders for your favorite teams and tournaments. Get notified before kickoff so you're always first in the stands.",
  },
  {
    icon: Globe,
    title: "Watch Anywhere",
    description: "Seamless experience across desktop, tablet, and mobile. Your favorites and watch history sync across every device.",
  },
  {
    icon: Shield,
    title: "Safe & Reliable",
    description: "Secure authentication, encrypted streams, and a platform built to handle peak match-day traffic without breaking a sweat.",
  },
];

const stats = [
  { value: "10K+", label: "Active Fans" },
  { value: "500+", label: "Live Matches / Month" },
  { value: "24/7", label: "Coverage" },
  { value: "60fps", label: "Smooth Streams" },
];

const howItWorks = [
  { step: "1", title: "Sign Up Free", description: "Create your account in seconds. No credit card required to start watching." },
  { step: "2", title: "Pick Your Sport", description: "Browse live and upcoming matches across football, cricket, UFC, basketball, and more." },
  { step: "3", title: "Watch & Cheer", description: "Click any match to start streaming. Jump into live chat and feel the roar with thousands of fans." },
];

const testimonials = [
  { name: "Alex M.", text: "Finally a platform that brings everything together. I canceled three separate services and just use LiveRoar now.", avatar: "AM" },
  { name: "Sarah K.", text: "The low-latency streaming is a game changer. I'm not on spoilers anymore — every match feels truly live.", avatar: "SK" },
  { name: "James R.", text: "The live chat makes watching even better. It's like having a stadium seat with the best fans in the world.", avatar: "JR" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-blue-600/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="flex justify-center mb-8">
            <Badge variant="live" className="text-sm px-4 py-1.5 gap-2 flex items-center">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE NOW — Premier League, IPL & UFC Pay-Per-View
            </Badge>
          </div>

          {/* Main heading */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Your Front Row
              <br />
              to Every{" "}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Live Moment
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Watch football, cricket, UFC, basketball, and more — all in one place.
              Real-time streams, live chat with fans, and never miss a match with instant reminders.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/user/register">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base gap-2 h-auto">
                  <Play className="w-5 h-5 fill-current" />
                  Start Watching Free
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/matches">
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-base h-auto">
                  Browse Matches
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>Trusted by 10,000+ sports fans</span>
            </div>
          </div>

          {/* Hero visual — floating match cards */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 shadow-2xl shadow-red-600/5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Match card 1 */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-red-500/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="live" className="text-[10px] px-2 py-0.5">LIVE</Badge>
                    <span className="text-xs text-slate-500">72'</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔵</div>
                      <p className="text-sm font-medium">Chelsea</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-2xl font-bold text-red-400">2 — 1</p>
                      <p className="text-[10px] text-slate-500">Premier League</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔴</div>
                      <p className="text-sm font-medium">Arsenal</p>
                    </div>
                  </div>
                </div>

                {/* Match card 2 */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-red-500/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="live" className="text-[10px] px-2 py-0.5">LIVE</Badge>
                    <span className="text-xs text-slate-500">Ovr 15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🇮🇳</div>
                      <p className="text-sm font-medium">India</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-2xl font-bold text-red-400">187/3</p>
                      <p className="text-[10px] text-slate-500">IPL</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🇦🇺</div>
                      <p className="text-sm font-medium">Aus</p>
                    </div>
                  </div>
                </div>

                {/* Match card 3 */}
                <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl p-4 border border-red-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-[10px] px-2 py-0.5 bg-orange-500 text-white">TONIGHT 9PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🇺🇸</div>
                      <p className="text-sm font-medium">Crawford</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-lg font-bold text-orange-400">VS</p>
                      <p className="text-[10px] text-slate-400">UFC PPV</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🇧🇷</div>
                      <p className="text-sm font-medium">Silva</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect under cards */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-red-600/20 blur-[60px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-slate-800/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Carousel */}
      <SportsCarousel />

      {/* Features */}
      <section className="py-20 sm:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-slate-400 border-slate-700">WHY LIVE ROAR</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Built for Fans Who Live the Game</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Every feature is designed to bring the stadium experience straight to your screen.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-slate-800/40 border-slate-700/50 hover:border-red-500/30 transition-colors group">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:bg-red-600/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/[0.02] to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/5 blur-[120px] rounded-full float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-600/5 blur-[100px] rounded-full float-medium" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {(() => {
            const delayClasses = [
              'particle-delay-1',
              'particle-delay-2',
              'particle-delay-3',
              'particle-delay-4',
              'particle-delay-5',
            ];
            return [...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1.5 h-1.5 bg-red-500/30 rounded-full particle ${delayClasses[(i % 5)]}`}
                style={{
                  top: `${15 + (i * 12) % 70}%`,
                  left: `${10 + (i * 17) % 80}%`,
                  animationDelay: `${i * 0.6}s`,
                }}
              />
            ));
          })()}
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-slate-400 border-slate-700">GET STARTED IN 30 SECONDS</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Watch in Three Simple Steps</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              From sign-up to your first goal — it takes less time than brewing coffee.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Animated SVG connector */}
            <svg
              className="hidden md:block absolute top-14 left-[16.66%] right-[16.66%] h-8 pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <defs>
                <linearGradient id="connectorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
                  <stop offset="20%" stopColor="#dc2626" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="80%" stopColor="#dc2626" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Base line */}
              <line
                x1="0"
                y1="16"
                x2="100%"
                y2="16"
                stroke="url(#connectorGrad)"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              {/* Animated flowing dash */}
              <line
                x1="0"
                y1="16"
                x2="100%"
                y2="16"
                stroke="url(#connectorGrad)"
                strokeWidth="2.5"
                strokeDasharray="8 12"
                className="connector-flow"
              />
            </svg>

            {/* Step 1 — Sign Up */}
            <div className="relative flex flex-col items-center step-card glow-sweep bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-8 group cursor-default z-10">
              {/* Sparkle dots */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full sparkle" />
              <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-orange-400/60 rounded-full sparkle" style={{ animationDelay: '1s' }} />

              {/* Step number with 3D flip + ripple rings */}
              <div className="relative mb-8">
                {/* Ripple rings */}
                <div className="absolute inset-0 -m-3 rounded-full border-2 border-red-500/30 animate-[ringRipple_2.5s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
                <div className="absolute inset-0 -m-3 rounded-full border border-red-500/20 animate-[ringRipple_2.5s_cubic-bezier(0.22,1,0.36,1)_infinite_0.8s]" />

                {/* Number circle */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center step-number-flip step-number-flip-delay-1 shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">
                  <span className="text-3xl font-black text-white">{howItWorks[0].step}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="mb-5 step-icon-hover">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-orange-600/10 border border-red-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m-6.75 4.5h3.75a2.25 2.25 0 012.25 2.25v4.5M19 10.5v6m-6.75-6H6a2.25 2.25 0 00-2.25 2.25v3.75A2.25 2.25 0 006 20.25h6.75M19 21v-1.5m-6.75 1.5H19M3.75 3.75h16.5" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3 text-white">{howItWorks[0].title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs text-center step-desc">
                {howItWorks[0].description}
              </p>
            </div>

            {/* Step 2 — Pick Your Sport */}
            <div className="relative flex flex-col items-center step-card glow-sweep bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-8 group cursor-default z-10">
              {/* Sparkle dots */}
              <div className="absolute -top-3 right-1/4 w-2 h-2 bg-yellow-400/60 rounded-full sparkle" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-2 left-1/3 w-2.5 h-2.5 bg-orange-400/40 rounded-full sparkle" style={{ animationDelay: '1.5s' }} />

              {/* Step number with 3D flip + ripple rings */}
              <div className="relative mb-8">
                <div className="absolute inset-0 -m-3 rounded-full border-2 border-red-500/30 animate-[ringRipple_2.5s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
                <div className="absolute inset-0 -m-3 rounded-full border border-red-500/20 animate-[ringRipple_2.5s_cubic-bezier(0.22,1,0.36,1)_infinite_0.8s]" />

                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center step-number-flip step-number-flip-delay-2 shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">
                  <span className="text-3xl font-black text-white">{howItWorks[1].step}</span>
                </div>
              </div>

              {/* Icon with sport emojis */}
              <div className="mb-5 step-icon-hover">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-orange-600/10 border border-red-500/20 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">⚽🏏🥊</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3 text-white">{howItWorks[1].title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs text-center step-desc">
                {howItWorks[1].description}
              </p>
            </div>

            {/* Step 3 — Watch & Cheer */}
            <div className="relative flex flex-col items-center step-card glow-sweep bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-8 group cursor-default z-10">
              {/* Sparkle dots */}
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-400/60 rounded-full sparkle" style={{ animationDelay: '0.8s' }} />
              <div className="absolute -bottom-1 right-2 w-2 h-2 bg-red-400/50 rounded-full sparkle" style={{ animationDelay: '1.8s' }} />

              {/* Step number with 3D flip + ripple rings */}
              <div className="relative mb-8">
                <div className="absolute inset-0 -m-3 rounded-full border-2 border-red-500/30 animate-[ringRipple_2.5s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
                <div className="absolute inset-0 -m-3 rounded-full border border-red-500/20 animate-[ringRipple_2.5s_cubic-bezier(0.22,1,0.36,1)_infinite_0.8s]" />

                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center step-number-flip step-number-flip-delay-3 shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">
                  <span className="text-3xl font-black text-white">{howItWorks[2].step}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="mb-5 step-icon-hover">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-orange-600/10 border border-red-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3 text-white">{howItWorks[2].title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs text-center step-desc">
                {howItWorks[2].description}
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 text-center">
            <Link href="/user/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 gap-2 h-auto shadow-lg shadow-red-600/20 group">
                <Play className="w-5 h-5 fill-current" />
                Start Your First Match
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-slate-400 border-slate-700">LOVED BY FANS</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">What Our Community Says</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-slate-800/40 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
                      {t.avatar}
                    </div>
                    <span className="font-medium text-sm">{t.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-8">
            <TrendingUp className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
            Ready to Feel the{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Roar</span>?
          </h2>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">
            Join thousands of sports fans who&apos;ve made LiveRoar their home for live sports. Free to start, impossible to leave.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/user/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-base gap-2 h-auto shadow-lg shadow-red-600/25">
                Create Free Account
                <Play className="w-5 h-5 fill-current" />
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-10 py-6 text-base h-auto">
                Explore Matches First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <p className="text-xl font-bold text-red-500 mb-3">🔴 LiveRoar</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Watch. Feel. Roar. Your front row to every live match.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Platform</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/matches" className="hover:text-white transition-colors">Live Matches</Link></li>
                <li><Link href="/channels" className="hover:text-white transition-colors">Channels</Link></li>
                <li><Link href="/matches" className="hover:text-white transition-colors">Upcoming</Link></li>
                <li><Link href="/user/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Sports */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Sports</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="/matches" className="hover:text-white transition-colors">Football</Link></li>
                <li><Link href="/matches" className="hover:text-white transition-colors">Cricket</Link></li>
                <li><Link href="/matches" className="hover:text-white transition-colors">UFC</Link></li>
                <li><Link href="/matches" className="hover:text-white transition-colors">Basketball</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} LiveRoar. Watch. Feel. Roar.</p>
            <p className="text-xs text-slate-700">Only stream content with proper broadcasting rights.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
