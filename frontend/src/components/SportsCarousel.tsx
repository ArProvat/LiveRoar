"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Sport {
  name: string;
  icon: string;
  gradient: string;
  glowColor: string;
  description: string;
  matchCount: string;
  liveMatches: number;
  href: string;
}

const sports: Sport[] = [
  {
    name: "Football",
    icon: "⚽",
    gradient: "from-green-500 to-emerald-600",
    glowColor: "rgba(34, 197, 94, 0.5)",
    description: "Premier League, La Liga, Champions League & more",
    matchCount: "120+",
    liveMatches: 3,
    href: "/matches?sport=football",
  },
  {
    name: "Cricket",
    icon: "🏏",
    gradient: "from-yellow-500 to-amber-600",
    glowColor: "rgba(234, 179, 8, 0.5)",
    description: "IPL, World Cup, Ashes & bilateral series",
    matchCount: "80+",
    liveMatches: 2,
    href: "/matches?sport=cricket",
  },
  {
    name: "UFC",
    icon: "🥊",
    gradient: "from-red-500 to-rose-600",
    glowColor: "rgba(239, 68, 68, 0.5)",
    description: "PPV events, Fight Nights & Contender Series",
    matchCount: "40+",
    liveMatches: 1,
    href: "/matches?sport=ufc",
  },
  {
    name: "Basketball",
    icon: "🏀",
    gradient: "from-orange-500 to-red-500",
    glowColor: "rgba(249, 115, 22, 0.5)",
    description: "NBA, EuroLeague, NCAA & international leagues",
    matchCount: "95+",
    liveMatches: 4,
    href: "/matches?sport=basketball",
  },
  {
    name: "Tennis",
    icon: "🎾",
    gradient: "from-lime-500 to-green-500",
    glowColor: "rgba(132, 204, 38, 0.5)",
    description: "Grand Slams, ATP & WTA Tour events",
    matchCount: "60+",
    liveMatches: 5,
    href: "/matches?sport=tennis",
  },
  {
    name: "Baseball",
    icon: "⚾",
    gradient: "from-blue-500 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.5)",
    description: "MLB, NPB & international baseball leagues",
    matchCount: "50+",
    liveMatches: 2,
    href: "/matches?sport=baseball",
  },
  {
    name: "Hockey",
    icon: "🏒",
    gradient: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.5)",
    description: "NHL, IIHF & international hockey tournaments",
    matchCount: "45+",
    liveMatches: 1,
    href: "/matches?sport=hockey",
  },
  {
    name: "Motorsport",
    icon: "🏎️",
    gradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.5)",
    description: "F1, MotoGP, NASCAR & rally championships",
    matchCount: "30+",
    liveMatches: 0,
    href: "/matches?sport=motorsport",
  },
];

const CARD_WIDTH = 280;
const CARD_GAP = 20;
const AUTO_SCROLL_SPEED = 1;
const AUTO_SCROLL_INTERVAL = 16;

export default function SportsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);
  const isHoveredRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  // Duplicate sports to create infinite loop
  const infiniteSports = [...sports, ...sports, ...sports];

  // Calculate how many cards fit in viewport
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

  // Reset position when sports data changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
    }
  }, [sports.length]);

  const handlePlayPause = () => {
    isPausedRef.current = !isPlaying;
    setIsPlaying(!isPlaying);
  };

  const handleHoverStart = () => {
    isPausedRef.current = true;
    isHoveredRef.current = true;
  };

  const handleHoverEnd = () => {
    isPausedRef.current = !isPlaying;
    isHoveredRef.current = false;
  };

  const scrollLeft = () => {
    positionRef.current -= CARD_WIDTH + CARD_GAP;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
      trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "none";
      }, 400);
    }
  };

  const scrollRight = () => {
    positionRef.current += CARD_WIDTH + CARD_GAP;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
      trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "none";
      }, 400);
    }
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-red-500/20 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-400 uppercase tracking-widest">Browse Sports</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Every Game.{" "}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Every League.
              </span>
            </h2>
            <p className="mt-3 text-slate-400 max-w-md text-base sm:text-lg">
              From the Premier League to the IPL, UFC Fight Night to the NBA — find it all here.
            </p>
          </div>

          {/* Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <div className="w-3 h-3 bg-current rounded-sm" />
              ) : (
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div className="relative group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />

          <div
            ref={trackRef}
            className="flex gap-5 will-change-transform"
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
                  {/* Glow background */}
                  <div
                    className="absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                    style={{ backgroundColor: sport.glowColor }}
                  />

                  {/* Card */}
                  <div className="relative h-full bg-slate-900/80 backdrop-blur-sm border border-slate-800/60 group-hover/card:border-transparent rounded-2xl p-6 flex flex-col transition-all duration-300 group-hover/card:shadow-[0_0_40px_-10px] overflow-hidden">
                    {/* Gradient top border */}
                    <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-${sport.gradient.split(" ")[1]} to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} />

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-0 group-hover/card:opacity-5 transition-opacity duration-500`} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon with bg circle */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${sport.gradient} flex items-center justify-center shadow-lg group-hover/card:scale-110 group-hover/card:rotate-[-5deg] transition-all duration-300`}>
                            <span className="text-2xl">{sport.icon}</span>
                          </div>
                          {/* Pulse ring */}
                          {sport.liveMatches > 0 && (
                            <div className="absolute -inset-1.5 rounded-xl border border-current opacity-40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ borderColor: sport.glowColor }} />
                          )}
                        </div>

                        {/* Live badge */}
                        {sport.liveMatches > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-red-400 uppercase">{sport.liveMatches} LIVE</span>
                          </div>
                        )}
                      </div>

                      {/* Sport info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-white group-hover/card:to-slate-300 transition-all duration-300">
                          {sport.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{sport.description}</p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50 group-hover/card:border-slate-700/50 transition-colors">
                        <span className="text-xs text-slate-500">
                          <span className="text-slate-300 font-semibold">{sport.matchCount}</span> matches
                        </span>
                        <div className="flex items-center gap-1 text-xs font-medium text-red-400 opacity-0 group-hover/card:opacity-100 translate-x-[-8px] group-hover/card:translate-x-0 transition-all duration-300">
                          Browse
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

        {/* Bottom indicators */}
        <div className="flex items-center justify-center gap-2 mt-10 sm:hidden">
          {sports.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? "w-6 bg-red-500" : "w-1.5 bg-slate-700"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
