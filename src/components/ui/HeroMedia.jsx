import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeImageUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

const VIDEO_FADE_MS = 220;
const VIDEO_FAIL_MS = 12000;

function resolveList(videoUrl, videoUrls) {
  if (Array.isArray(videoUrls) && videoUrls.length) {
    return videoUrls
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .map((item) => resolvePlayableVideoUrl(item))
      .filter(Boolean);
  }
  const one = typeof videoUrl === "string" ? videoUrl.trim() : "";
  const resolved = resolvePlayableVideoUrl(one);
  return resolved ? [resolved] : [];
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
  const aRef = useRef(null);
  const bRef = useRef(null);
  const failTimerRef = useRef(0);
  const stallTimerRef = useRef(0);
  const indexRef = useRef(0);
  const activeRef = useRef(0);
  const aliveRef = useRef(true);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [srcs, setSrcs] = useState(["", ""]);
  const [allowed, setAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);

  const list = useMemo(
    () => resolveList(videoUrl, videoUrls),
    [videoUrl, videoUrls],
  );
  const listKey = list.join("\n");
  const videoSrc = list[index] || "";
  const posterSrc = useMemo(
    () =>
      posterUrl
        ? normalizeImageUrl(posterUrl, { width: 1920, quality: 78 })
        : "",
    [posterUrl],
  );
  const wantVideo = Boolean(
    allowed && list.length && !failed && !finished && ready,
  );
  const baseClass =
    videoClassName ||
    "absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-out";

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    indexRef.current = 0;
    activeRef.current = 0;
    setIndex(0);
    setActive(0);
    setSrcs(["", ""]);
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
    console.log(`[hero-video] ${slot} src:`, masked);
    console.log(`[hero-video] ${slot} playlist:`, list.length, "index:", index);
  }, [slot, videoSrc, list.length, index]);

  useEffect(() => {
    onStateChange?.({
      want: wantVideo,
      visible,
      failed,
      finished,
      src: videoSrc,
      raw: videoSrc,
      index,
      total: list.length,
    });
  }, [
    wantVideo,
    visible,
    failed,
    finished,
    videoSrc,
    index,
    list.length,
    onStateChange,
  ]);

  useEffect(() => {
    if (!ready || !list.length) {
      setAllowed(false);
      return undefined;
    }
    if (!shouldPlayHeroVideo()) {
      setAllowed(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setAllowed(true), 80);
    return () => window.clearTimeout(timer);
  }, [ready, listKey]);

  useEffect(() => {
    const node = active === 0 ? aRef.current : bRef.current;
    if (!node || !wantVideo) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [wantVideo, active, srcs]);

  useEffect(() => {
    if (!wantVideo) return undefined;

    const playlist = list;
    const nodes = [aRef.current, bRef.current];
    if (!nodes[0] || !nodes[1]) return undefined;

    let cancelled = false;
    let playing = false;

    const clearTimers = () => {
      window.clearTimeout(failTimerRef.current);
      window.clearTimeout(stallTimerRef.current);
    };

    const setPlaylistIndex = (next) => {
      indexRef.current = next;
      if (aliveRef.current) setIndex(next);
    };

    const setActiveSlot = (next) => {
      activeRef.current = next;
      if (aliveRef.current) setActive(next);
    };

    const writeSrc = (slotIndex, src) => {
      if (!aliveRef.current) return;
      setSrcs((prev) => {
        if (prev[slotIndex] === src) return prev;
        const copy = [...prev];
        copy[slotIndex] = src;
        return copy;
      });
    };

    const finishAll = () => {
      playing = false;
      if (!aliveRef.current) return;
      setVisible(false);
      window.setTimeout(() => {
        if (aliveRef.current) setFinished(true);
      }, VIDEO_FADE_MS);
    };

    const failCurrent = () => {
      clearTimers();
      const current = indexRef.current;
      if (current < playlist.length - 1) {
        playAt(current + 1, true);
        return;
      }
      playing = false;
      if (!aliveRef.current) return;
      setVisible(false);
      window.setTimeout(() => {
        if (aliveRef.current) setFailed(true);
      }, VIDEO_FADE_MS);
    };

    const bindPlayback = (node, onReady, onFail) => {
      const handleReady = () => onReady();
      const handleError = () => onFail();
      const handleStalled = () => {
        window.clearTimeout(stallTimerRef.current);
        stallTimerRef.current = window.setTimeout(() => {
          if (node.readyState < 3) onFail();
        }, VIDEO_FAIL_MS);
      };
      node.addEventListener("canplay", handleReady);
      node.addEventListener("loadeddata", handleReady);
      node.addEventListener("playing", handleReady);
      node.addEventListener("error", handleError);
      node.addEventListener("stalled", handleStalled);
      node.addEventListener("waiting", handleStalled);
      return () => {
        node.removeEventListener("canplay", handleReady);
        node.removeEventListener("loadeddata", handleReady);
        node.removeEventListener("playing", handleReady);
        node.removeEventListener("error", handleError);
        node.removeEventListener("stalled", handleStalled);
        node.removeEventListener("waiting", handleStalled);
      };
    };

    const playNode = (node) => {
      const run = node.play();
      if (run?.catch) run.catch(() => {});
      return run;
    };

    const waitReady = (node) =>
      new Promise((resolve, reject) => {
        let done = false;
        const finish = (ok) => {
          if (done) return;
          done = true;
          unbind();
          clearTimers();
          if (ok) resolve();
          else reject();
        };
        const unbind = bindPlayback(
          node,
          () => finish(true),
          () => finish(false),
        );
        failTimerRef.current = window.setTimeout(() => {
          if (node.readyState < 2) finish(false);
        }, VIDEO_FAIL_MS);
        try {
          node.load();
          if (node.readyState >= 2) {
            playNode(node);
            finish(true);
            return;
          }
          playNode(node);
        } catch {
          finish(false);
        }
      });

    const onEnded = () => {
      if (cancelled) return;
      const current = indexRef.current;
      if (current >= playlist.length - 1) {
        finishAll();
        return;
      }
      playAt(current + 1, false);
    };

    const attachEnded = (node) => {
      node.addEventListener("ended", onEnded);
      return () => node.removeEventListener("ended", onEnded);
    };

    let detachEnded = () => {};

    const playAt = async (nextIndex, replace) => {
      if (cancelled || nextIndex >= playlist.length) {
        finishAll();
        return;
      }

      const src = playlist[nextIndex];
      const currentActive = activeRef.current;
      const nextSlot = replace || !playing ? currentActive : currentActive === 0 ? 1 : 0;
      const node = nodes[nextSlot];
      const prev = nodes[currentActive];

      setPlaylistIndex(nextIndex);
      writeSrc(nextSlot, src);
      try {
        node.src = src;
      } catch {
        failCurrent();
        return;
      }

      try {
        await waitReady(node);
      } catch {
        if (cancelled) return;
        if (nextIndex < playlist.length - 1) {
          playAt(nextIndex + 1, true);
          return;
        }
        failCurrent();
        return;
      }

      if (cancelled) return;

      playing = true;
      setActiveSlot(nextSlot);
      if (aliveRef.current) setVisible(true);
      detachEnded();
      detachEnded = attachEnded(node);

      if (!replace && prev && prev !== node) {
        try {
          prev.pause();
        } catch {}
      }

      const prefetchIndex = nextIndex + 1;
      if (prefetchIndex < playlist.length) {
        const idleSlot = nextSlot === 0 ? 1 : 0;
        const idle = nodes[idleSlot];
        const prefetchSrc = playlist[prefetchIndex];
        writeSrc(idleSlot, prefetchSrc);
        try {
          idle.src = prefetchSrc;
          idle.preload = "auto";
          idle.load();
        } catch {}
      }
    };

    playAt(0, true);

    return () => {
      cancelled = true;
      clearTimers();
      detachEnded();
      nodes.forEach((node) => {
        try {
          node.pause();
        } catch {}
      });
    };
  }, [wantVideo, listKey]);

  useEffect(() => {
    const node = active === 0 ? aRef.current : bRef.current;
    if (!node || !wantVideo || !visible || finished) return;
    try {
      if (inView) {
        const run = node.play();
        if (run?.catch) run.catch(() => {});
      } else {
        node.pause();
      }
    } catch {}
  }, [inView, wantVideo, visible, finished, active]);

  if (!wantVideo && !visible) return null;

  return (
    <div className={className || "absolute inset-0 overflow-hidden"}>
      <video
        ref={aRef}
        className={baseClass}
        style={{
          opacity: visible && active === 0 ? 1 : 0,
          transitionDuration: `${VIDEO_FADE_MS}ms`,
          zIndex: active === 0 ? 2 : 1,
        }}
        src={srcs[0] || undefined}
        muted
        playsInline
        preload="auto"
        poster={posterSrc || undefined}
        aria-hidden="true"
      />
      <video
        ref={bRef}
        className={baseClass}
        style={{
          opacity: visible && active === 1 ? 1 : 0,
          transitionDuration: `${VIDEO_FADE_MS}ms`,
          zIndex: active === 1 ? 2 : 1,
        }}
        src={srcs[1] || undefined}
        muted
        playsInline
        preload="auto"
        poster={posterSrc || undefined}
        aria-hidden="true"
      />
    </div>
  );
}
