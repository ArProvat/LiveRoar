import { notFound } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import HLSPlayer from "@/components/video/HLSPlayer";

interface Channel {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
}

interface Match {
  id: string;
  title: string;
  description: string | null;
  sport_category: string;
  status: string;
  team_a: string;
  team_b: string;
  league: string | null;
  start_time: string;
  end_time: string | null;
  thumbnail_url: string | null;
  hls_url: string | null;
  viewers: number;
  channel: Channel | null;
}

const sportIcons: Record<string, string> = {
  FOOTBALL: "⚽",
  CRICKET: "🏏",
  UFC: "🥊",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  BASEBALL: "⚾",
  HOCKEY: "🏒",
};

async function getMatch(id: string) {
  try {
    const { data } = await api.get(`/matches/${id}`);
    return data;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id);

  if (!match) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Matches
        </Link>
      </div>

      {/* Player */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50">
        <HLSPlayer src={match.hls_url || ""} />
      </div>

      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">{sportIcons[match.sport_category] || "🏟️"}</span>
          <span className="text-sm text-slate-400 font-medium">{match.sport_category}</span>
          {match.league && (
            <>
              <span className="text-slate-700">•</span>
              <span className="text-sm text-slate-400">{match.league}</span>
            </>
          )}
          {match.status === "LIVE" && (
            <>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            </>
          )}
          {match.status === "FINISHED" && (
            <span className="px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-medium">
              Finished
            </span>
          )}
          {match.status === "UPCOMING" && (
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium">
              Upcoming
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{match.title}</h1>
      </div>

      {/* Teams */}
      <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Team A */}
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-white truncate">{match.team_a}</p>
          </div>
          {/* VS */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700">
              <span className="text-sm font-bold text-slate-400">VS</span>
            </div>
          </div>
          {/* Team B */}
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-white truncate">{match.team_b}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Time & Schedule */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-slate-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-white">{formatDate(match.start_time)}</p>
            </div>
            {match.end_time && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-slate-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-white">Ended: {new Date(match.end_time).toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Viewers & Channel */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Broadcast</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <span className="text-sm text-white">
                {match.viewers > 0 ? `${match.viewers.toLocaleString()} watching` : "No viewers yet"}
              </span>
            </div>
            {match.channel && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center overflow-hidden">
                  {match.channel.logo_url ? (
                    <img src={match.channel.logo_url} alt={match.channel.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">📺</span>
                  )}
                </div>
                <Link
                  href={`/channels/${match.channel.slug}`}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  {match.channel.name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {match.description && (
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">About This Match</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{match.description}</p>
        </div>
      )}
    </div>
  );
}
