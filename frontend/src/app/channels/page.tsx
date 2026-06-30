export default async function ChannelsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Channels</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["ESPN Live", "Sky Sports", "UFC Fight Pass", "Star Sports", "Fox Sports", "beIN Sports"].map(
          (name) => (
            <div key={name} className="bg-slate-800 rounded-lg p-6 text-center hover:ring-2 hover:ring-red-500 transition">
              <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4" />
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-slate-400 mt-1">
                {name.includes("UFC") ? "UFC" : name.includes("ESPN") ? "FOOTBALL" : name.includes("Star") ? "CRICKET" : "OTHER"}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
