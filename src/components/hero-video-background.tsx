"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        options: YTPlayerOptions
      ) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerOptions {
  videoId: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
  };
}

interface YTPlayer {
  mute(): void;
  playVideo(): void;
  destroy(): void;
}

let apiLoaded = false;
const pendingCallbacks: Array<() => void> = [];

function ensureYouTubeAPI(onReady: () => void) {
  if (apiLoaded) {
    onReady();
    return;
  }

  pendingCallbacks.push(onReady);

  if (document.getElementById("yt-iframe-api")) return;

  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    apiLoaded = true;
    if (prev) prev();
    pendingCallbacks.splice(0).forEach((cb) => cb());
  };

  const script = document.createElement("script");
  script.id = "yt-iframe-api";
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

interface Props {
  videoId: string;
}

export function HeroVideoBackground({ videoId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let destroyed = false;

    ensureYouTubeAPI(() => {
      if (destroyed || !containerRef.current) return;

      const el = document.createElement("div");
      containerRef.current.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
        },
      });
    });

    return () => {
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  return <div ref={containerRef} className="hero-video-bg" />;
}
