import { defineConfig } from "next";

export default defineConfig({
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/matches",
        permanent: false,
      },
    ];
  },
});
