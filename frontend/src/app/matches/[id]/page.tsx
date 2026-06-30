import { notFound } from "next/navigation";
import api from "@/lib/api";
import HLSPlayer from "@/components/video/HLSPlayer";

interface MatchPageProps {
  params: { id: string };
}

async function getMatch(id: string) {
  try {
    const { data } = await api.get(`/matches/${id}`);
    return data;
  } catch {
    return null;
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const match = await getMatch(params.id);

  if (!match) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Player */}
      <div className="mb-6">
        <HLSPlayer src={match.hls_url || ""} />
      </div>

      {/* Match Info */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          {match.status === "LIVE" && (
            <span className="badge-live">● LIVE</span>
          )}
          <span className="text-sm text-slate-400">{match.sport_category}</span>
          {match.league && (
            <span className="text-sm text-slate-400">• {match.league}</span>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{match.title}</h1>

        <div className="grid grid-cols-3 text-center gap-4 py-6">
          <div>
            <p className="text-slate-400 text-sm">Team A</p>
            <p className="text-xl font-semibold">{match.team_a}</p>
          </div>
          <div className="text-2xl font-bold text-slate-600">VS</div>
          <div>
            <p className="text-slate-400 text-sm">Team B</p>
            <p className="text-xl font-semibold">{match.team_b}</p>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          Starts: {new Date(match.start_time).toLocaleString()}
          {match.end_time && ` • Ends: ${new Date(match.end_time).toLocaleString()}`}
        </div>
      </div>
    </div>
  );
}
