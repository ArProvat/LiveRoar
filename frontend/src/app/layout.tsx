import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiveRoar — Watch. Feel. Roar.",
  description: "Live sports streaming platform for football, cricket, UFC and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
