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
  const indexRef = useRef(0);
  const activeRef = useRef(0);
  const busyRef = useRef(false);
  const aliveRef = useRef(true);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);
  const [fadeMs, setFadeMs] = useState(0);

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
    busyRef.current = false;
    setIndex(0);
    setActive(0);
    setFailed(false);
    setFinished(false);
    setVisible(false);
    setAllowed(false);
    setFadeMs(0);
    [aRef.current, bRef.current].forEach((node) => {
      if (!node) return;
      try {
        node.pause();
        node.removeAttribute("src");
        delete node.dataset.heroSrc;
        node.load();
      } catch {}
    });
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
    setAllowed(true);
    return undefined;
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
  }, [wantVideo, active]);

  useEffect(() => {
    if (!wantVideo) return undefined;

    const playlist = list.slice();
    const nodes = [aRef.current, bRef.current];
    if (!nodes[0] || !nodes[1] || !playlist.length) return undefined;

    let cancelled = false;
    let failTimer = 0;
    let stallTimer = 0;
    let endedNode = null;

    const clearTimers = () => {
      window.clearTimeout(failTimer);
      window.clearTimeout(stallTimer);
    };

    const syncIndex = (next) => {
      indexRef.current = next;
      if (aliveRef.current) setIndex(next);
    };

    const syncActive = (next) => {
      activeRef.current = next;
      if (aliveRef.current) setActive(next);
    };

    const finishAll = () => {
      busyRef.current = false;
      if (!aliveRef.current || cancelled) return;
      setVisible(false);
      window.setTimeout(() => {
        if (aliveRef.current && !cancelled) setFinished(true);
      }, VIDEO_FADE_MS);
    };

    const waitReady = (node, { restart = false } = {}) =>
      new Promise((resolve, reject) => {
        let done = false;
        const finish = (ok) => {
          if (done) return;
          done = true;
          clearTimers();
          node.removeEventListener("canplay", onReady);
          node.removeEventListener("loadeddata", onReady);
          node.removeEventListener("playing", onReady);
          node.removeEventListener("error", onError);
          node.removeEventListener("stalled", onStall);
          node.removeEventListener("waiting", onStall);
          if (ok) resolve();
          else reject(new Error("video-not-ready"));
        };
        const onReady = () => finish(true);
        const onError = () => finish(false);
        const onStall = () => {
          window.clearTimeout(stallTimer);
          stallTimer = window.setTimeout(() => {
            if (node.readyState < 3) finish(false);
          }, VIDEO_FAIL_MS);
        };

        node.addEventListener("canplay", onReady);
        node.addEventListener("loadeddata", onReady);
        node.addEventListener("playing", onReady);
        node.addEventListener("error", onError);
        node.addEventListener("stalled", onStall);
        node.addEventListener("waiting", onStall);

        failTimer = window.setTimeout(() => {
          if (node.readyState < 2) finish(false);
        }, VIDEO_FAIL_MS);

        try {
          if (restart) {
            try {
              node.pause();
            } catch {}
            try {
              node.currentTime = 0;
            } catch {}
          }

          if (!restart && node.readyState >= 3 && !node.ended) {
            const run = node.play();
            if (run?.catch) run.catch(() => {});
            finish(true);
            return;
          }

          if (restart && node.readyState >= 2) {
            const run = node.play();
            if (run?.catch) run.catch(() => {});
            if (!node.ended && node.currentTime < 0.25) {
              finish(true);
              return;
            }
          }

          node.load();
          if (restart) {
            try {
              node.currentTime = 0;
            } catch {}
          }
          const run = node.play();
          if (run?.catch) run.catch(() => {});
          if (node.readyState >= 2) finish(true);
        } catch {
          finish(false);
        }
      });

    const detachEnded = () => {
      if (!endedNode) return;
      endedNode.removeEventListener("ended", onEnded);
      endedNode = null;
    };

    const onEnded = () => {
      if (cancelled || busyRef.current) return;
      const current = indexRef.current;
      const next =
        playlist.length < 2
          ? current
          : current >= playlist.length - 1
            ? 0
            : current + 1;
      playAt(next);
    };

    const attachEnded = (node) => {
      detachEnded();
      endedNode = node;
      node.addEventListener("ended", onEnded);
    };

    const assignSrc = (node, src) => {
      const same = node.dataset.heroSrc === src;
      node.dataset.heroSrc = src;
      if (!same) node.src = src;
      return same;
    };

    const prefetch = (fromIndex, activeSlot) => {
      if (playlist.length < 2) return;
      const nextIndex = (fromIndex + 1) % playlist.length;
      const src = playlist[nextIndex];
      if (!src) return;
      if (src === playlist[fromIndex]) return;
      const idleSlot = activeSlot === 0 ? 1 : 0;
      const idle = nodes[idleSlot];
      if (!idle) return;
      if (idle.dataset.heroSrc === src && idle.readyState >= 2) return;
      try {
        assignSrc(idle, src);
        idle.preload = "auto";
        idle.load();
      } catch {}
    };

    const playAt = async (nextIndex) => {
      if (cancelled || busyRef.current) return;
      if (nextIndex < 0 || nextIndex >= playlist.length) {
        finishAll();
        return;
      }

      busyRef.current = true;
      detachEnded();

      const src = playlist[nextIndex];
      const prevIndex = indexRef.current;
      const currentActive = activeRef.current;
      const prevSrc = playlist[prevIndex] || "";
      const looping =
        nextIndex === 0 && prevIndex === playlist.length - 1 && playlist.length > 1;
      const sameAsPrevious =
        src === prevSrc && (nextIndex !== prevIndex || playlist.length === 1 || looping);

      let nextSlot;
      if (sameAsPrevious) {
        nextSlot = currentActive;
      } else if (nodes[0]?.dataset?.heroSrc === src && nodes[0] !== nodes[currentActive]) {
        nextSlot = 0;
      } else if (nodes[1]?.dataset?.heroSrc === src && nodes[1] !== nodes[currentActive]) {
        nextSlot = 1;
      } else if (nextIndex === 0) {
        nextSlot = currentActive;
      } else {
        nextSlot = currentActive === 0 ? 1 : 0;
      }

      const node = nodes[nextSlot];
      const prev = nodes[currentActive];
      const reusedSame = assignSrc(node, src);

      syncIndex(nextIndex);

      try {
        await waitReady(node, {
          restart: sameAsPrevious || (reusedSame && (node.ended || node.currentTime > 0.2)),
        });
      } catch {
        busyRef.current = false;
        if (cancelled) return;
        if (nextIndex < playlist.length - 1) {
          playAt(nextIndex + 1);
          return;
        }
        if (aliveRef.current) {
          setVisible(false);
          window.setTimeout(() => {
            if (aliveRef.current && !cancelled) setFailed(true);
          }, VIDEO_FADE_MS);
        }
        return;
      }

      if (cancelled) {
        busyRef.current = false;
        return;
      }

      try {
        if (node.ended || node.currentTime > 0.05) node.currentTime = 0;
      } catch {}

      const run = node.play();
      if (run?.catch) {
        try {
          await run;
        } catch {
          busyRef.current = false;
          if (nextIndex < playlist.length - 1) {
            playAt(nextIndex + 1);
            return;
          }
          finishAll();
          return;
        }
      }

      syncActive(nextSlot);
      if (aliveRef.current) {
        setVisible(true);
        if (nextIndex > 0) setFadeMs(VIDEO_FADE_MS);
      }
      attachEnded(node);
      busyRef.current = false;

      if (prev && prev !== node) {
        try {
          prev.pause();
        } catch {}
      }

      prefetch(nextIndex, nextSlot);
    };

    playAt(0);

    return () => {
      cancelled = true;
      busyRef.current = false;
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
    if (!node || !wantVideo || !visible || finished || busyRef.current) return;
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
          transitionDuration: `${fadeMs}ms`,
          zIndex: active === 0 ? 2 : 1,
        }}
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
          transitionDuration: `${fadeMs}ms`,
          zIndex: active === 1 ? 2 : 1,
        }}
        muted
        playsInline
        preload="auto"
        poster={posterSrc || undefined}
        aria-hidden="true"
      />
    </div>
  );
}
