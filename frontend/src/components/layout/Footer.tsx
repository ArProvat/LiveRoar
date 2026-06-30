export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} LiveRoar. Watch. Feel. Roar.</p>
        <p className="mt-2">Only stream content with proper broadcasting rights.</p>
      </div>
    </footer>
  );
}
