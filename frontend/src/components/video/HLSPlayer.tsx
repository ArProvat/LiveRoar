"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function HLSPlayer({ src, autoPlay = true, muted = false }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls?.levels[data.level];
        if (level?.details?.live) {
          setIsLive(true);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error. Retrying...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error. Recovering...");
              hls?.recoverMediaError();
              break;
            default:
              setError("Stream unavailable. Please try again later.");
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        if (autoPlay) video.play().catch(() => {});
        setIsLive(true);
      });
    }

    return () => {
      hls?.destroy();
    };
  }, [src, autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  if (error) return (
    <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
      <div className="text-center p-4">
        <p className="text-red-400 text-lg mb-2">{error}</p>
        <button
          onClick={() => setError(null)}
          className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        muted={muted}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {isLive && (
        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse z-10">
          LIVE
        </span>
      )}
    </div>
  );
}
