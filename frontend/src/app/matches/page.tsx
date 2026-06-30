import { redirect } from "next/navigation";
import api from "@/lib/api";
import { API_URL } from "@/lib/config";

async function getMatches(sport?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (sport) params.set("sport_category", sport);
    if (status) params.set("status", status);
    const { data } = await api.get(`/matches?${params}`);
    return data;
  } catch {
    return { data: [], total: 0, page: 1, per_page: 20, total_pages: 0 };
  }
}

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Live Matches</h1>

      <div className="flex gap-2 mb-6">
        {["ALL", "LIVE", "FOOTBALL", "CRICKET", "UFC"].map((filter) => (
          <a
            key={filter}
            href={`/matches${filter !== "ALL" ? `?filter=${filter}` : ""}`}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm"
          >
            {filter}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.data?.map((match: any) => (
          <a key={match.id} href={`/matches/${match.id}`} className="block">
            <div className="bg-slate-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition">
              {match.thumbnail_url && (
                <img src={match.thumbnail_url} alt={match.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  {match.status === "LIVE" && (
                    <span className="badge-live">● LIVE</span>
                  )}
                  <span className="text-xs text-slate-400">{match.sport_category}</span>
                </div>
                <h3 className="font-semibold text-lg">{match.title}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {match.team_a} vs {match.team_b}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {match.league} • {new Date(match.start_time).toLocaleString()}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
