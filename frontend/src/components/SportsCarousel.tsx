"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Sport {
  name: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  iconBgColor: string;
  glowColor: string;
  shadowColor: string;
  description: string;
  matchCount: string;
  liveMatches: number;
  href: string;
}

const sports: Sport[] = [
  {
    name: "Football",
    icon: "⚽",
    gradientFrom: "rgb(34, 197, 94)",
    gradientTo: "rgb(22, 163, 74)",
    iconBgColor: "rgb(22, 163, 74)",
    glowColor: "rgba(34, 197, 94, 0.5)",
    shadowColor: "rgba(34, 197, 94, 0.4)",
    description: "Premier League, La Liga, Champions League & more",
    matchCount: "120+",
    liveMatches: 3,
    href: "/matches?sport=football",
  },
  {
    name: "Cricket",
    icon: "🏏",
    gradientFrom: "rgb(234, 179, 8)",
    gradientTo: "rgb(217, 119, 6)",
    iconBgColor: "rgb(217, 119, 6)",
    glowColor: "rgba(234, 179, 8, 0.5)",
    shadowColor: "rgba(234, 179, 8, 0.4)",
    description: "IPL, World Cup, Ashes & bilateral series",
    matchCount: "80+",
    liveMatches: 2,
    href: "/matches?sport=cricket",
  },
  {
    name: "UFC",
    icon: "🥊",
    gradientFrom: "rgb(239, 68, 68)",
    gradientTo: "rgb(220, 38, 38)",
    iconBgColor: "rgb(220, 38, 38)",
    glowColor: "rgba(239, 68, 68, 0.5)",
    shadowColor: "rgba(239, 68, 68, 0.4)",
    description: "PPV events, Fight Nights & Contender Series",
    matchCount: "40+",
    liveMatches: 1,
    href: "/matches?sport=ufc",
  },
  {
    name: "Basketball",
    icon: "🏀",
    gradientFrom: "rgb(249, 115, 22)",
    gradientTo: "rgb(234, 88, 12)",
    iconBgColor: "rgb(234, 88, 12)",
    glowColor: "rgba(249, 115, 22, 0.5)",
    shadowColor: "rgba(249, 115, 22, 0.4)",
    description: "NBA, EuroLeague, NCAA & international leagues",
    matchCount: "95+",
    liveMatches: 4,
    href: "/matches?sport=basketball",
  },
  {
    name: "Tennis",
    icon: "🎾",
    gradientFrom: "rgb(132, 204, 38)",
    gradientTo: "rgb(101, 169, 35)",
    iconBgColor: "rgb(101, 169, 35)",
    glowColor: "rgba(132, 204, 38, 0.5)",
    shadowColor: "rgba(132, 204, 38, 0.4)",
    description: "Grand Slams, ATP & WTA Tour events",
    matchCount: "60+",
    liveMatches: 5,
    href: "/matches?sport=tennis",
  },
  {
    name: "Baseball",
    icon: "⚾",
    gradientFrom: "rgb(59, 130, 246)",
    gradientTo: "rgb(37, 99, 235)",
    iconBgColor: "rgb(37, 99, 235)",
    glowColor: "rgba(59, 130, 246, 0.5)",
    shadowColor: "rgba(59, 130, 246, 0.4)",
    description: "MLB, NPB & international baseball leagues",
    matchCount: "50+",
    liveMatches: 2,
    href: "/matches?sport=baseball",
  },
  {
    name: "Hockey",
    icon: "🏒",
    gradientFrom: "rgb(6, 182, 212)",
    gradientTo: "rgb(8, 145, 178)",
    iconBgColor: "rgb(8, 145, 178)",
    glowColor: "rgba(6, 182, 212, 0.5)",
    shadowColor: "rgba(6, 182, 212, 0.4)",
    description: "NHL, IIHF & international hockey tournaments",
    matchCount: "45+",
    liveMatches: 1,
    href: "/matches?sport=hockey",
  },
  {
    name: "Motorsport",
    icon: "🏎️",
    gradientFrom: "rgb(236, 72, 153)",
    gradientTo: "rgb(219, 39, 119)",
    iconBgColor: "rgb(219, 39, 119)",
    glowColor: "rgba(236, 72, 153, 0.5)",
    shadowColor: "rgba(236, 72, 153, 0.4)",
    description: "F1, MotoGP, NASCAR & rally championships",
    matchCount: "30+",
    liveMatches: 0,
    href: "/matches?sport=motorsport",
  },
];

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const AUTO_SCROLL_SPEED = 0.8;

export default function SportsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);

  // Duplicate sports for infinite loop
  const infiniteSports = [...sports, ...sports, ...sports];

  // Auto-scroll animation loop
  const animate = useCallback(() => {
    if (!isPausedRef.current && trackRef.current) {
      positionRef.current -= AUTO_SCROLL_SPEED;
      const singleSetWidth = sports.length * (CARD_WIDTH + CARD_GAP);

      if (Math.abs(positionRef.current) >= singleSetWidth) {
        positionRef.current += singleSetWidth;
      }

      trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
    }
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, animate]);

  const handlePlayPause = () => {
    isPausedRef.current = !isPlaying;
    setIsPlaying(!isPlaying);
  };

  const handleHoverStart = () => {
    isPausedRef.current = true;
  };

  const handleHoverEnd = () => {
    isPausedRef.current = !isPlaying;
  };

  const scrollLeft = () => {
    positionRef.current -= CARD_WIDTH + CARD_GAP;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "none";
      }, 500);
    }
  };

  const scrollRight = () => {
    positionRef.current += CARD_WIDTH + CARD_GAP;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "none";
      }, 500);
    }
  };

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-[#050b18]">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/[0.03] to-transparent pointer-events-none" />

      {/* Bolt-style Multi-layer Glowing Orb */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center" style={{ zIndex: 0 }}>
        {/* Thin vertical line */}
        <div className="w-px h-[80px] bg-gradient-to-b from-transparent via-slate-400/20 to-red-400/30 mt-6" />

        {/* Glowing orb */}
        <div className="relative -mt-px mt-2">
          {/* Layer 1 — Outer glow: widest, most transparent ring */}
          <div className="w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/8 blur-[40px] absolute left-1/2 top-1/2" />

          {/* Layer 2 — Mid glow: medium ring, more opaque */}
          <div className="w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/15 blur-[25px] absolute left-1/2 top-1/2" />

          {/* Layer 3 — Inner glow: tight gradient sphere */}
          <div className="w-[55px] h-[55px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 blur-[3px] absolute left-1/2 top-1/2 shadow-[0_0_20px_5px_rgba(239,68,68,0.4),inset_0_-5px_10px_rgba(0,0,0,0.2),inset_0_5px_8px_rgba(255,255,255,0.12)]" />

          {/* Layer 4 — Core orb: bright white-hot center */}
          <div className="w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white via-red-100 to-red-300 absolute left-1/2 top-1/2 shadow-[0_0_12px_3px_rgba(255,255,255,0.6),0_0_30px_8px_rgba(239,68,68,0.45)]">
            {/* Specular highlight */}
            <div className="absolute top-[10%] left-[12%] w-[38%] h-[38%] rounded-full bg-white" />
          </div>
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">All Sports</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Every Game.{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Every League.
              </span>
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-400 leading-relaxed">
              From the Premier League to the IPL, UFC Fight Night to the NBA — find it all here.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all backdrop-blur-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all backdrop-blur-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all backdrop-blur-sm"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <div className="w-2.5 h-2.5 bg-current rounded-sm" />
              ) : (
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-current border-b-[5px] border-b-transparent ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div className="relative group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />

          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-5 will-change-transform"
            style={{ gap: `${CARD_GAP}px` }}
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
          >
            {infiniteSports.map((sport, index) => (
              <Link
                key={`${sport.name}-${index}`}
                href={sport.href}
                className="flex-shrink-0 group/card"
                style={{ width: `${CARD_WIDTH}px` }}
              >
                <div className="relative h-full">
                  {/* Outer glow on hover */}
                  <div
                    className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"
                    style={{ backgroundColor: sport.glowColor }}
                  />

                  {/* Card body */}
                  <div className="relative h-full bg-transparent border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-500 group-hover/card:border-white/[0.14] group-hover/card:-translate-y-1">
                    {/* Top gradient accent line */}
                    <div
                      className="h-0.5 w-0 group-hover/card:w-full transition-all duration-700 ease-out"
                      style={{
                        background: `linear-gradient(90deg, ${sport.gradientFrom}, ${sport.gradientTo})`,
                      }}
                    />

                    {/* Subtle gradient overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 0%, ${sport.glowColor.replace("0.5", "0.08")}, transparent 70%)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full px-5 pb-5 pt-4">
                      {/* Icon area */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          {/* Icon circle */}
                          <div
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover/card:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${sport.gradientFrom}, ${sport.gradientTo})`,
                              boxShadow: `0 4px 15px ${sport.shadowColor}`,
                            }}
                          >
                            <span className="text-xl sm:text-2xl filter drop-shadow-sm">{sport.icon}</span>
                          </div>
                          {/* Pulse ring for live */}
                          {sport.liveMatches > 0 && (
                            <div
                              className="absolute -inset-2 rounded-2xl opacity-30"
                              style={{
                                borderColor: sport.glowColor,
                                borderStyle: "solid",
                                borderWidth: "2px",
                                animation: "ping 3s cubic-bezier(0,0,0.2,1) infinite",
                              }}
                            />
                          )}
                        </div>

                        {/* Live badge */}
                        {sport.liveMatches > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">{sport.liveMatches} Live</span>
                          </div>
                        )}
                      </div>

                      {/* Sport name */}
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 transition-colors duration-300 group-hover/card:text-white">
                        {sport.name}
                      </h3>

                      {/* Description */}
                      <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-auto line-clamp-2">
                        {sport.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.08] group-hover/card:border-white/[0.14] transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold" style={{ color: sport.gradientFrom }}>
                            {sport.matchCount}
                          </span>
                          <span className="text-[10px] text-slate-400">matches</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold transition-all duration-300 opacity-0 -translate-x-2 group-hover/card:opacity-100 group-hover/card:translate-x-0" style={{ color: sport.gradientFrom }}>
                          Explore
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom dot indicators (mobile) */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:hidden">
          {sports.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === 0 ? "24px" : "6px",
                backgroundColor: i === 0 ? "rgb(239, 68, 68)" : "rgb(51, 65, 85)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
