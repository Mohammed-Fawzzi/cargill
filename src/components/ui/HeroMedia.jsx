import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeImageUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

const VIDEO_FAIL_MS = 8000;

function resolveSrc(videoUrl, videoUrls) {
  if (typeof videoUrl === "string" && videoUrl.trim()) {
    return resolvePlayableVideoUrl(videoUrl.trim());
  }
  if (Array.isArray(videoUrls)) {
    for (const item of videoUrls) {
      const raw = typeof item === "string" ? item.trim() : "";
      if (!raw) continue;
      const resolved = resolvePlayableVideoUrl(raw);
      if (resolved) return resolved;
    }
  }
  return "";
}

export default function HeroMedia({
  videoUrl = "",
  videoUrls,
  posterUrl = "",
  ready = true,
  slot = "hero",
  className = "",
  videoClassName = "",
  onStateChange,
}) {
  const videoRef = useRef(null);
  const playedRef = useRef(false);
  const [allowed, setAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);

  const videoSrc = useMemo(
    () => resolveSrc(videoUrl, videoUrls),
    [videoUrl, videoUrls],
  );
  const posterSrc = useMemo(
    () =>
      posterUrl
        ? normalizeImageUrl(posterUrl, { width: 1920, quality: 78 })
        : "",
    [posterUrl],
  );
  const wantVideo = Boolean(allowed && videoSrc && !failed && ready);
  const baseClass =
    videoClassName ||
    "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200 ease-out";

  useEffect(() => {
    playedRef.current = false;
    setFailed(false);
    setVisible(false);
    setAllowed(false);
  }, [videoSrc]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const masked = videoSrc
      ? videoSrc.replace(/key=[^&]+/i, "key=***")
      : "(empty)";
    console.log(`[hero-video] ${slot} src:`, masked);
  }, [slot, videoSrc]);

  useEffect(() => {
    onStateChange?.({
      want: wantVideo,
      visible,
      failed,
      finished: false,
      src: videoSrc,
      raw: videoSrc,
      index: 0,
      total: videoSrc ? 1 : 0,
    });
  }, [wantVideo, visible, failed, videoSrc, onStateChange]);

  useEffect(() => {
    if (!ready || !videoSrc) {
      setAllowed(false);
      return undefined;
    }
    if (!shouldPlayHeroVideo()) {
      setAllowed(false);
      return undefined;
    }
    setAllowed(true);
    return undefined;
  }, [ready, videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [wantVideo, videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo || !videoSrc) return undefined;

    let cancelled = false;
    let failTimer = 0;
    let sawPlaying = false;

    const markPlayed = () => {
      if (cancelled || playedRef.current) return;
      playedRef.current = true;
      sawPlaying = true;
      window.clearTimeout(failTimer);
      if (!cancelled) setVisible(true);
    };

    const failOnce = () => {
      if (cancelled || playedRef.current || sawPlaying) return;
      window.clearTimeout(failTimer);
      setVisible(false);
      setFailed(true);
    };

    const onPlaying = () => markPlayed();
    const onCanPlay = () => {
      if (cancelled || playedRef.current) return;
      const run = node.play();
      if (run?.catch) run.catch(() => {});
    };
    const onError = () => {
      if (!sawPlaying && !playedRef.current) failOnce();
    };

    node.addEventListener("playing", onPlaying);
    node.addEventListener("canplay", onCanPlay);
    node.addEventListener("error", onError);

    failTimer = window.setTimeout(() => {
      if (!sawPlaying && !playedRef.current && node.readyState < 2) failOnce();
    }, VIDEO_FAIL_MS);

    try {
      const needsSrc = node.dataset.heroSrc !== videoSrc;
      if (needsSrc) {
        node.dataset.heroSrc = videoSrc;
        node.src = videoSrc;
        node.load();
      }
      const run = node.play();
      if (run?.catch) run.catch(() => {});
      if (node.readyState >= 2) onCanPlay();
      if (node.readyState >= 3 && !node.paused) markPlayed();
    } catch {
      failOnce();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
      node.removeEventListener("playing", onPlaying);
      node.removeEventListener("canplay", onCanPlay);
      node.removeEventListener("error", onError);
    };
  }, [wantVideo, videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo || !visible || !playedRef.current) return;
    try {
      if (inView) {
        const run = node.play();
        if (run?.catch) run.catch(() => {});
      } else {
        node.pause();
      }
    } catch {}
  }, [inView, wantVideo, visible]);

  if (!wantVideo && !visible) return null;

  return (
    <div className={className || "absolute inset-0 overflow-hidden"}>
      <video
        ref={videoRef}
        className={baseClass}
        style={{ opacity: visible ? 1 : 0 }}
        muted
        playsInline
        autoPlay
        loop={true}
        preload="auto"
        poster={posterSrc || undefined}
        aria-hidden="true"
      />
    </div>
  );
}
