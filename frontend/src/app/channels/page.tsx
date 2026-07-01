import { Suspense } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Channel {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  category: string;
  is_live: boolean;
}

async function getChannels(category?: string, page = 1) {
  try {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("page", String(page));
    params.set("per_page", "24");
    const { data } = await api.get(`/channels?${params}`);
    return data;
  } catch {
    return { data: [], total: 0, page: 1, per_page: 24, total_pages: 0 };
  }
}

const categoryIcons: Record<string, string> = {
  FOOTBALL: "⚽",
  CRICKET: "🏏",
  UFC: "🥊",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  OTHER: "📺",
};

async function ChannelsPageClient({
  category,
  page,
}: {
  category?: string;
  page: number;
}) {
  const channelsData = await getChannels(category, page);
  const channels: Channel[] = (channelsData.data || []) as Channel[];

  // Collect unique categories from results
  const categories: string[] = [...new Set(channels.map((c) => c.category))].sort();

  const buildHref = (cat?: string, p?: number) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (p && p > 1) params.set("page", String(p));
    return `/channels${params.toString() ? `?${params}` : ""}`;
  };

  const currentFilter = category ? category.toUpperCase() : "ALL";

  const allCategoryFilters: string[] = ["ALL", ...categories];

  if (channels.length === 0 && page === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📺</div>
        <h2 className="text-xl font-semibold text-white mb-2">No channels found</h2>
        <p className="text-slate-400">Try a different category or check back later</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Channels</h1>
        <p className="text-slate-400 text-sm">
          {channelsData.total} channel{channelsData.total !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allCategoryFilters.map((cat) => {
          const isActive = cat === "ALL" ? !category : cat === currentFilter;
          const activeCat = cat === "ALL" ? undefined : cat.toLowerCase();
          return (
            <Link
              key={cat}
              href={buildHref(activeCat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-red-600 text-white"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {cat === "ALL" ? "ALL" : cat}
            </Link>
          );
        })}
      </div>

      {/* Channel Grid */}
      {channels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {channels.map((channel: Channel) => (
              <Link
                key={channel.id}
                href={`/channels/${channel.slug}`}
                className="group block bg-slate-900/80 border border-slate-800/60 rounded-xl overflow-hidden hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10"
              >
                <div className="p-6 flex flex-col items-center text-center">
                  {/* Logo */}
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700/60 group-hover:border-red-500/40 flex items-center justify-center overflow-hidden mb-4 transition-colors">
                    {channel.logo_url ? (
                      <img
                        src={channel.logo_url}
                        alt={channel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">📺</span>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-white text-lg mb-1">{channel.name}</h3>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400">
                      {categoryIcons[channel.category] || "📺"} {channel.category}
                    </span>
                  </div>

                  {channel.is_live && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {channelsData.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildHref(category, page - 1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-slate-400 px-4">
                Page {page} of {channelsData.total_pages}
              </span>
              {page < channelsData.total_pages && (
                <Link
                  href={buildHref(category, page + 1)}
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
          <p className="text-slate-400">No channels in this category</p>
          <Link href="/channels" className="text-red-400 hover:text-red-300 text-sm">
            View all channels →
          </Link>
        </div>
      )}
    </div>
  );
}

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: {
    category?: string;
    page?: string;
  };
}) {
  const category = searchParams.category;
  const page = parseInt(searchParams.page || "1", 10);

  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-slate-800 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-slate-800 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ChannelsPageClient category={category} page={page} />
    </Suspense>
  );
}
