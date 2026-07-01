import { redirect } from "next/navigation";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getMe() {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch {
    return null;
  }
}

async function getLiveMatches() {
  try {
    const { data } = await api.get("/matches?status=LIVE");
    return data.data || [];
  } catch {
    return [];
  }
}

async function getFeaturedMatches() {
  try {
    const { data } = await api.get("/matches?status=UPCOMING");
    return (data.data || []).filter((m: any) => m.is_featured).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const user = await getMe();
  if (!user) {
    redirect("/user/login");
  }

  const liveMatches = await getLiveMatches();
  const featuredMatches = await getFeaturedMatches();

  const sportIcons: Record<string, string> = {
    FOOTBALL: "⚽",
    CRICKET: "🏏",
    UFC: "🥊",
    BASKETBALL: "🏀",
    TENNIS: "🎾",
    BASEBALL: "⚾",
    HOCKEY: "🏒",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-orange-600/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">{user.name || "Fan"}</span>!
              </h1>
              <p className="text-slate-400 mt-2">
                {liveMatches.length > 0
                  ? `${liveMatches.length} matches are live right now. Don't miss the action!`
                  : "No live matches right now. Check upcoming games below."}
              </p>
            </div>
            <Link href="/matches">
              <Button className="bg-red-600 hover:bg-red-700 gap-2">
                Browse All Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Matches */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-bold">Live Now</h2>
          <Badge variant="live" className="ml-2 text-xs px-2 py-0.5">
            {liveMatches.length} LIVE
          </Badge>
        </div>

        {liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveMatches.map((match: any) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="group block bg-slate-900/80 border border-slate-800/60 rounded-xl overflow-hidden hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10"
              >
                {match.thumbnail_url && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={match.thumbnail_url}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live
                    </div>
                  </div>
                )}
                <div className={`p-4 ${match.thumbnail_url ? "pt-12" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{sportIcons[match.sport_category] || "🏟️"}</span>
                    <span className="text-xs text-slate-400 font-medium">{match.sport_category}</span>
                    {match.league && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-500 truncate">{match.league}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2 truncate">{match.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-300">{match.team_a}</span>
                      <span className="text-xs text-slate-500 font-bold">vs</span>
                      <span className="text-slate-300">{match.team_b}</span>
                    </div>
                  </div>
                  {match.viewers > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      <span>{match.viewers.toLocaleString()} watching</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📺</div>
            <p className="text-slate-400">No live matches right now</p>
            <p className="text-slate-500 text-sm mt-1">Check back later or explore upcoming games</p>
          </div>
        )}
      </section>

      {/* Featured Upcoming */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <h2 className="text-xl sm:text-2xl font-bold">Featured Matches</h2>
        </div>

        {featuredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredMatches.map((match: any) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="group block bg-slate-900/80 border border-slate-800/60 rounded-xl overflow-hidden hover:border-yellow-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/10"
              >
                <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                  {match.thumbnail_url ? (
                    <>
                      <img
                        src={match.thumbnail_url}
                        alt={match.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                    </>
                  ) : (
                    <span className="text-5xl opacity-50">{sportIcons[match.sport_category] || "🏟️"}</span>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Featured
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium">
                    {new Date(match.start_time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{sportIcons[match.sport_category] || "🏟️"}</span>
                    <span className="text-xs text-slate-400 font-medium">{match.sport_category}</span>
                    {match.league && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-500 truncate">{match.league}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2 truncate">{match.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{match.team_a}</span>
                    <span className="text-xs text-slate-500 font-bold">vs</span>
                    <span className="text-slate-300">{match.team_b}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-slate-400">No featured matches scheduled</p>
            <Link href="/matches">
              <Button variant="link" className="text-red-400 hover:text-red-300 p-0 h-auto">
                Browse all matches →
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: "/matches?status=LIVE", label: "Live Matches", icon: "🔴", desc: "Watch now" },
            { href: "/matches?status=UPCOMING", label: "Upcoming", icon: "📅", desc: "Schedule" },
            { href: "/channels", label: "Channels", icon: "📺", desc: "Browse" },
            { href: "/user/profile", label: "Profile", icon: "👤", desc: "Edit" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700 transition-colors"
            >
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{link.label}</p>
                <p className="text-xs text-slate-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
