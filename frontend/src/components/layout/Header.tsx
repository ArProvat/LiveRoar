import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function Header() {
  const token = (await headers()).get("cookie")?.includes("access_token")
    ? "user"
    : null;

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-red-500">
          🔴 LiveRoar
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/matches" className="text-slate-300 hover:text-white">
            Matches
          </Link>
          <Link href="/channels" className="text-slate-300 hover:text-white">
            Channels
          </Link>
          {token ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-red-600 text-white text-sm">
                  {token?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link href="/user/profile" className="text-slate-300 hover:text-white">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/user/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/user/register">
                <Button className="bg-red-600 hover:bg-red-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
