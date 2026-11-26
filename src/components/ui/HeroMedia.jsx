import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeImageUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

const VIDEO_FADE_MS = 600;
const VIDEO_FAIL_MS = 12000;

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
  const failTimerRef = useRef(0);
  const stallTimerRef = useRef(0);
  const settledRef = useRef(false);
  const fadeOutTimerRef = useRef(0);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);

  const list = useMemo(() => {
    if (Array.isArray(videoUrls) && videoUrls.length) {
      return videoUrls
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
    const one = typeof videoUrl === "string" ? videoUrl.trim() : "";
    return one ? [one] : [];
  }, [videoUrl, videoUrls]);

  const listKey = list.join("\n");
  const rawVideo = list[index] || "";
  const videoSrc = useMemo(() => resolvePlayableVideoUrl(rawVideo), [rawVideo]);
  const posterSrc = useMemo(
    () =>
      posterUrl
        ? normalizeImageUrl(posterUrl, { width: 1920, quality: 78 })
        : "",
    [posterUrl],
  );
  const wantVideo = Boolean(
    allowed && videoSrc && !failed && !finished && ready,
  );

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    setIndex(0);
    indexRef.current = 0;
    settledRef.current = false;
    setFailed(false);
    setFinished(false);
    setVisible(false);
    setAllowed(false);
  }, [listKey]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const masked = videoSrc
      ? videoSrc.replace(/key=[^&]+/i, "key=***")
      : "(empty)";
    console.log(`[hero-video] ${slot} raw:`, rawVideo || "(empty)");
    console.log(`[hero-video] ${slot} src:`, masked);
    console.log(`[hero-video] ${slot} playlist:`, list.length, "index:", index);
  }, [slot, rawVideo, videoSrc, list.length, index]);

  useEffect(() => {
    onStateChange?.({
      want: wantVideo,
      visible,
      failed,
      finished,
      src: videoSrc,
      raw: rawVideo,
      index,
      total: list.length,
    });
  }, [
    wantVideo,
    visible,
    failed,
    finished,
    videoSrc,
    rawVideo,
    index,
    list.length,
    onStateChange,
  ]);

  useEffect(() => {
    settledRef.current = false;
    setFailed(false);
    setFinished(false);
    setVisible(false);
    window.clearTimeout(fadeOutTimerRef.current);
    if (!ready || !videoSrc) {
      setAllowed(false);
      return undefined;
    }
    if (!shouldPlayHeroVideo()) {
      setAllowed(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setAllowed(true), 120);
    return () => window.clearTimeout(timer);
  }, [ready, videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [wantVideo, videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo) return undefined;

    const clearTimers = () => {
      window.clearTimeout(failTimerRef.current);
      window.clearTimeout(stallTimerRef.current);
    };

    const advanceOrFinish = () => {
      const current = indexRef.current;
      if (current < list.length - 1) {
        settledRef.current = false;
        setIndex(current + 1);
        return;
      }
      setFinished(true);
    };

    const fail = () => {
      if (settledRef.current) return;
      settledRef.current = true;
      clearTimers();
      setVisible(false);
      try {
        node.pause();
      } catch {}
      window.clearTimeout(fadeOutTimerRef.current);
      fadeOutTimerRef.current = window.setTimeout(() => {
        if (indexRef.current < list.length - 1) {
          settledRef.current = false;
          setIndex(indexRef.current + 1);
        } else {
          setFailed(true);
        }
      }, VIDEO_FADE_MS);
    };

    const succeed = () => {
      if (settledRef.current) return;
      settledRef.current = true;
      clearTimers();
      const run = node.play();
      if (run?.then) {
        run
          .then(() => setVisible(true))
          .catch(() => {
            settledRef.current = false;
            fail();
          });
        return;
      }
      setVisible(true);
    };

    const onCanPlay = () => succeed();
    const onPlaying = () => {
      if (!settledRef.current) succeed();
      else setVisible(true);
    };
    const onError = () => fail();
    const onEnded = () => {
      clearTimers();
      setVisible(false);
      try {
        node.pause();
      } catch {}
      window.clearTimeout(fadeOutTimerRef.current);
      fadeOutTimerRef.current = window.setTimeout(() => {
        advanceOrFinish();
      }, VIDEO_FADE_MS);
    };
    const onStalled = () => {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = window.setTimeout(() => {
        if (node.readyState < 3) fail();
      }, VIDEO_FAIL_MS);
    };

    node.addEventListener("canplay", onCanPlay);
    node.addEventListener("loadeddata", onCanPlay);
    node.addEventListener("playing", onPlaying);
    node.addEventListener("error", onError);
    node.addEventListener("ended", onEnded);
    node.addEventListener("stalled", onStalled);
    node.addEventListener("waiting", onStalled);

    failTimerRef.current = window.setTimeout(() => {
      if (node.readyState < 2) fail();
    }, VIDEO_FAIL_MS);

    try {
      node.load();
      if (node.readyState >= 2) {
        succeed();
      } else {
        const run = node.play();
        if (run?.catch) run.catch(() => {});
      }
    } catch {
      fail();
    }

    return () => {
      clearTimers();
      window.clearTimeout(fadeOutTimerRef.current);
      node.removeEventListener("canplay", onCanPlay);
      node.removeEventListener("loadeddata", onCanPlay);
      node.removeEventListener("playing", onPlaying);
      node.removeEventListener("error", onError);
      node.removeEventListener("ended", onEnded);
      node.removeEventListener("stalled", onStalled);
      node.removeEventListener("waiting", onStalled);
      try {
        node.pause();
      } catch {}
    };
  }, [wantVideo, videoSrc, list.length]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !wantVideo || !visible || finished) return;
    try {
      if (inView) {
        const run = node.play();
        if (run?.catch) run.catch(() => {});
      } else {
        node.pause();
      }
    } catch {}
  }, [inView, wantVideo, visible, finished]);

  if (!wantVideo && !visible) return null;

  return (
    <div className={className || "absolute inset-0 overflow-hidden"}>
      {wantVideo ? (
        <video
          key={videoSrc}
          ref={videoRef}
          className={
            videoClassName ||
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-out"
          }
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${VIDEO_FADE_MS}ms`,
          }}
          src={videoSrc}
          muted
          playsInline
          autoPlay
          preload="auto"
          poster={posterSrc || undefined}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
