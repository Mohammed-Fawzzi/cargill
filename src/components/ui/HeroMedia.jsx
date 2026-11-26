import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeImageUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

const VIDEO_FAIL_MS = 8000;

function resolveList(videoUrl, videoUrls) {
  const raw = [];
  if (Array.isArray(videoUrls) && videoUrls.length) {
    videoUrls.forEach((item) => {
      const value = typeof item === "string" ? item.trim() : "";
      if (value) raw.push(value);
    });
  } else if (typeof videoUrl === "string" && videoUrl.trim()) {
    raw.push(videoUrl.trim());
  }

  const seen = new Set();
  const list = [];
  raw.forEach((item) => {
    const resolved = resolvePlayableVideoUrl(item);
    if (!resolved || seen.has(resolved)) return;
    seen.add(resolved);
    list.push(resolved);
  });
  return list;
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
  const indexRef = useRef(0);
  const playedRef = useRef(false);
  const busyRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);

  const list = useMemo(
    () => resolveList(videoUrl, videoUrls),
    [videoUrl, videoUrls],
  );
  const listKey = list.join("\n");
  const videoSrc = list[index] || "";
  const single = list.length <= 1;
  const posterSrc = useMemo(
    () =>
      posterUrl
        ? normalizeImageUrl(posterUrl, { width: 1920, quality: 78 })
        : "",
    [posterUrl],
  );
  const wantVideo = Boolean(allowed && list.length && !failed && ready);
  const baseClass =
    videoClassName ||
    "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200 ease-out";

  useEffect(() => {
    indexRef.current = 0;
    playedRef.current = false;
    busyRef.current = false;
    setIndex(0);
    setFailed(false);
    setVisible(false);
    setAllowed(false);
  }, [listKey]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const masked = videoSrc
      ? videoSrc.replace(/key=[^&]+/i, "key=***")
      : "(empty)";
    console.log(`[hero-video] ${slot} src:`, masked);
    console.log(`[hero-video] ${slot} playlist:`, list.length, "index:", index);
  }, [slot, videoSrc, list.length, index]);

  useEffect(() => {
    onStateChange?.({
      want: wantVideo,
      visible,
      failed,
      finished: false,
      src: videoSrc,
      raw: videoSrc,
      index,
      total: list.length,
    });
  }, [wantVideo, visible, failed, videoSrc, index, list.length, onStateChange]);

  useEffect(() => {
    if (!ready || !list.length) {
      setAllowed(false);
      return undefined;
    }
    if (!shouldPlayHeroVideo()) {
      setAllowed(false);
      return undefined;
    }
    setAllowed(true);
    return undefined;
  }, [ready, listKey]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [wantVideo, listKey]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo || !list.length) return undefined;

    let cancelled = false;
    let failTimer = 0;
    let itemPlaying = false;
    const tried = new Set();

    const clearFailTimer = () => {
      window.clearTimeout(failTimer);
      failTimer = 0;
    };

    const syncIndex = (next) => {
      indexRef.current = next;
      if (!cancelled) setIndex(next);
    };

    const markPlayed = () => {
      if (cancelled) return;
      itemPlaying = true;
      playedRef.current = true;
      clearFailTimer();
      busyRef.current = false;
      setVisible(true);
    };

    const failHard = () => {
      if (cancelled || playedRef.current) return;
      clearFailTimer();
      busyRef.current = false;
      setVisible(false);
      setFailed(true);
    };

    const advanceFrom = (fromIndex) => {
      if (list.length <= 1) {
        if (!playedRef.current) failHard();
        return;
      }
      const next = fromIndex >= list.length - 1 ? 0 : fromIndex + 1;
      if (next === fromIndex) return;
      playAt(next);
    };

    let onItemPlaying = null;

    const playAt = (nextIndex) => {
      if (cancelled || !list.length) return;
      if (nextIndex < 0 || nextIndex >= list.length) {
        if (playedRef.current) {
          playAt(0);
          return;
        }
        failHard();
        return;
      }

      if (!playedRef.current && tried.has(nextIndex)) {
        failHard();
        return;
      }
      if (!playedRef.current) tried.add(nextIndex);

      busyRef.current = true;
      itemPlaying = false;
      clearFailTimer();
      if (onItemPlaying) {
        node.removeEventListener("playing", onItemPlaying);
        onItemPlaying = null;
      }

      const src = list[nextIndex];
      syncIndex(nextIndex);

      onItemPlaying = () => {
        if (onItemPlaying) {
          node.removeEventListener("playing", onItemPlaying);
          onItemPlaying = null;
        }
        markPlayed();
      };
      node.addEventListener("playing", onItemPlaying);

      failTimer = window.setTimeout(() => {
        if (cancelled || itemPlaying) return;
        if (onItemPlaying) {
          node.removeEventListener("playing", onItemPlaying);
          onItemPlaying = null;
        }
        advanceFrom(nextIndex);
      }, VIDEO_FAIL_MS);

      try {
        if (node.dataset.heroSrc !== src) {
          node.dataset.heroSrc = src;
          node.src = src;
          node.load();
        } else {
          try {
            node.currentTime = 0;
          } catch {}
        }
        const run = node.play();
        if (run?.catch) {
          run.catch(() => {
            if (cancelled || itemPlaying) return;
            if (onItemPlaying) {
              node.removeEventListener("playing", onItemPlaying);
              onItemPlaying = null;
            }
            advanceFrom(nextIndex);
          });
        }
        if (node.readyState >= 3 && !node.paused) {
          if (onItemPlaying) {
            node.removeEventListener("playing", onItemPlaying);
            onItemPlaying = null;
          }
          markPlayed();
        }
      } catch {
        if (onItemPlaying) {
          node.removeEventListener("playing", onItemPlaying);
          onItemPlaying = null;
        }
        advanceFrom(nextIndex);
      }
    };

    const onEnded = () => {
      if (cancelled || busyRef.current) return;
      if (list.length <= 1) return;
      advanceFrom(indexRef.current);
    };

    const onError = () => {
      if (cancelled || busyRef.current) return;
      advanceFrom(indexRef.current);
    };

    node.addEventListener("ended", onEnded);
    node.addEventListener("error", onError);
    playAt(indexRef.current || 0);

    return () => {
      cancelled = true;
      busyRef.current = false;
      clearFailTimer();
      if (onItemPlaying) {
        node.removeEventListener("playing", onItemPlaying);
        onItemPlaying = null;
      }
      node.removeEventListener("ended", onEnded);
      node.removeEventListener("error", onError);
    };
  }, [wantVideo, listKey]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo || !visible || !playedRef.current) return;
    if (busyRef.current) return;
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
        loop={single}
        preload="auto"
        poster={posterSrc || undefined}
        aria-hidden="true"
      />
    </div>
  );
}
