import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title:
    "LiveRoar — Watch Live Sports | Football, Cricket, UFC & More",
  description:
    "Your front row to every live match. Watch football, cricket, UFC, basketball, tennis, and more in HD. Real-time streams, live fan chat, and instant match reminders. Free to start.",
  keywords: [
    "live sports",
    "streaming",
    "football",
    "cricket",
    "UFC",
    "basketball",
    "tennis",
    "live scores",
    "sports fan",
    "live match",
    "sports streaming platform",
    "watch live football",
    "watch cricket live",
  ],
  openGraph: {
    title: "LiveRoar — Watch Live Sports | Your Front Row to Every Match",
    description:
      "Watch football, cricket, UFC, and more in HD with real-time streams, live fan chat, and instant match reminders. Free to start.",
    type: "website",
    locale: "en_US",
    siteName: "LiveRoar",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveRoar — Watch Live Sports",
    description:
      "Your front row to every live match. Football, cricket, UFC, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <div className="pt-0 sm:pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
