import { Suspense } from "react";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

interface Match {
  id: string;
  title: string;
  sport_category: string;
  status: string;
  team_a: string;
  team_b: string;
  league: string | null;
  start_time: string;
  end_time: string | null;
  thumbnail_url: string | null;
  viewers: number;
  channel: { id: string; slug: string; name: string } | null;
}

async function getMatches(sportCategory?: string, status?: string, page = 1) {
  try {
    const params = new URLSearchParams();
    if (sportCategory) params.set("sport_category", sportCategory);
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("per_page", "24");
    const { data } = await api.get(`/matches?${params}`);
    return data;
  } catch {
    return { data: [], total: 0, page: 1, per_page: 24, total_pages: 0 };
  }
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

const filterOptions = [
  { label: "ALL", sportCategory: undefined, status: undefined },
  { label: "LIVE", status: "LIVE" },
  { label: "UPCOMING", status: "UPCOMING" },
  { label: "FINISHED", status: "FINISHED" },
  { label: "Football", sportCategory: "football" },
  { label: "Cricket", sportCategory: "cricket" },
  { label: "UFC", sportCategory: "ufc" },
  { label: "Basketball", sportCategory: "basketball" },
  { label: "Tennis", sportCategory: "tennis" },
];

async function MatchesPageClient({
  sportCategory,
  status,
  page,
}: {
  sportCategory?: string;
  status?: string;
  page: number;
}) {
  const matchesData = await getMatches(sportCategory, status, page);
  const matches = matchesData.data || [];

  const buildHref = (sportCat?: string, stat?: string, p?: number) => {
    const params = new URLSearchParams();
    if (sportCat) params.set("sport_category", sportCat);
    if (stat) params.set("status", stat);
    if (p && p > 1) params.set("page", String(p));
    return `/matches${params.toString() ? `?${params}` : ""}`;
  };

  const currentFilter = filterOptions.find(
    (f) => f.sportCategory === sportCategory && f.status === status
  )?.label || "ALL";

  if (matches.length === 0 && page === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🏟️</div>
        <h2 className="text-xl font-semibold text-white mb-2">No matches found</h2>
        <p className="text-slate-400">Try a different filter or check back later</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {currentFilter === "ALL" ? "All Matches" : currentFilter}
        </h1>
        <p className="text-slate-400 text-sm">
          {matchesData.total} match{matchesData.total !== 1 ? "es" : ""} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterOptions.map((filter) => {
          const isActive =
            filter.label === currentFilter ||
            (filter.label === "ALL" &&
              !sportCategory &&
              !status);
          return (
            <Link
              key={filter.label}
              href={buildHref(filter.sportCategory, filter.status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-red-600 text-white"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Match Grid */}
      {matches.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {matches.map((match: Match) => (
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
                    {match.status === "LIVE" && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </div>
                    )}
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{match.team_a}</span>
                    <span className="text-xs text-slate-500 font-bold">vs</span>
                    <span className="text-slate-300">{match.team_b}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {new Date(match.start_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {match.channel && (
                      <>
                        <span>•</span>
                        <span className="truncate">{match.channel.name}</span>
                      </>
                    )}
                    {match.viewers > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                          {match.viewers.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {matchesData.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildHref(sportCategory, status, page - 1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-slate-400 px-4">
                Page {page} of {matchesData.total_pages}
              </span>
              {page < matchesData.total_pages && (
                <Link
                  href={buildHref(sportCategory, status, page + 1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📺</div>
          <p className="text-slate-400">No matches in this category</p>
          <Link href="/matches" className="text-red-400 hover:text-red-300 text-sm">
            View all matches →
          </Link>
        </div>
      )}
    </div>
  );
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: {
    sport_category?: string;
    status?: string;
    page?: string;
  };
}) {
  const sportCategory = searchParams.sport_category;
  const status = searchParams.status;
  const page = parseInt(searchParams.page || "1", 10);

  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-slate-800 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <MatchesPageClient sportCategory={sportCategory} status={status} page={page} />
    </Suspense>
  );
}
