import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getDrivePosterUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

const VIDEO_FAIL_MS = 8000;
const HANDOFF_S = 0.45;

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
  playWhen = true,
  slot = "hero",
  className = "",
  videoClassName = "",
  onStateChange,
}) {
  const aRef = useRef(null);
  const bRef = useRef(null);
  const indexRef = useRef(0);
  const activeRef = useRef(0);
  const framedRef = useRef(false);
  const playingRef = useRef(false);
  const busyRef = useRef(false);
  const handoffRef = useRef(false);
  const playWhenRef = useRef(playWhen);
  const listRef = useRef([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cover, setCover] = useState([false, false]);
  const [inView, setInView] = useState(true);

  const list = useMemo(
    () => resolveList(videoUrl, videoUrls),
    [videoUrl, videoUrls],
  );
  const listKey = list.join("\n");
  const firstSrc = list[0] || "";
  const videoSrc = list[index] || firstSrc;
  const multi = list.length > 1;
  const allowed = Boolean(ready && list.length && shouldPlayHeroVideo());
  const wantVideo = Boolean(allowed && !failed);
  const posterSrc = useMemo(() => {
    if (typeof posterUrl === "string" && posterUrl.trim()) return posterUrl.trim();
    const raw =
      (Array.isArray(videoUrls) && videoUrls[0]) ||
      (typeof videoUrl === "string" ? videoUrl : "") ||
      "";
    return getDrivePosterUrl(raw);
  }, [posterUrl, videoUrl, videoUrls]);
  const baseClass =
    videoClassName ||
    "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-out";

  playWhenRef.current = playWhen;
  listRef.current = list;

  useEffect(() => {
    indexRef.current = 0;
    activeRef.current = 0;
    framedRef.current = false;
    playingRef.current = false;
    busyRef.current = false;
    handoffRef.current = false;
    setIndex(0);
    setActive(0);
    setFailed(false);
    setVisible(false);
    setCover([false, false]);
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
    const node = active === 0 ? aRef.current : bRef.current;
    if (!node || !wantVideo) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [wantVideo, active, listKey]);

  useEffect(() => {
    if (!wantVideo || !list.length) return undefined;

    const nodes = [aRef.current, bRef.current];
    if (!nodes[0] || !nodes[1]) return undefined;

    let cancelled = false;

    const syncIndex = (next) => {
      indexRef.current = next;
      if (!cancelled) setIndex(next);
    };

    const syncActive = (next) => {
      activeRef.current = next;
      if (!cancelled) setActive(next);
    };

    const setSlot = (slotIndex, on) => {
      const node = nodes[slotIndex];
      if (node) {
        node.style.opacity = on ? "1" : "0";
        node.style.zIndex = on ? "3" : "1";
      }
      if (!cancelled) {
        setCover((current) => {
          if (current[slotIndex] === on) return current;
          const next = current.slice();
          next[slotIndex] = on;
          return next;
        });
      }
    };

    const assignSrc = (node, src) => {
      if (node.dataset.heroSrc === src) return false;
      node.dataset.heroSrc = src;
      node.removeAttribute("poster");
      node.src = src;
      try {
        node.load();
      } catch {}
      return true;
    };

    const waitReady = (node) =>
      new Promise((resolve, reject) => {
        let done = false;
        const finish = (ok) => {
          if (done) return;
          done = true;
          node.removeEventListener("canplay", onOk);
          node.removeEventListener("loadeddata", onOk);
          node.removeEventListener("error", onErr);
          if (ok) resolve();
          else reject(new Error("not-ready"));
        };
        const onOk = () => finish(true);
        const onErr = () => finish(false);
        if (node.readyState >= 3) {
          finish(true);
          return;
        }
        node.addEventListener("canplay", onOk);
        node.addEventListener("loadeddata", onOk);
        node.addEventListener("error", onErr);
        window.setTimeout(() => {
          if (node.readyState >= 2) finish(true);
          else finish(false);
        }, VIDEO_FAIL_MS);
      });

    const prefetch = (fromIndex) => {
      const playlist = listRef.current;
      if (playlist.length < 2 || cancelled) return;
      const idleSlot = activeRef.current === 0 ? 1 : 0;
      const idle = nodes[idleSlot];
      const nextIndex = (fromIndex + 1) % playlist.length;
      const src = playlist[nextIndex];
      if (!idle || !src) return;
      if (idle.dataset.heroSrc === src && idle.readyState >= 2) return;
      assignSrc(idle, src);
    };

    const armFirst = () => {
      if (cancelled || framedRef.current) return;
      const node = nodes[0];
      if (!node || node.readyState < 2) return;
      try {
        node.pause();
      } catch {}
      node.removeAttribute("poster");
      setSlot(0, true);
      setSlot(1, false);
      framedRef.current = true;
      syncIndex(0);
      syncActive(0);
      setVisible(true);
      maybePlay();
    };

    const maybePlay = async () => {
      if (cancelled || playingRef.current || !framedRef.current) return;
      if (!playWhenRef.current) return;
      const node = nodes[activeRef.current];
      if (!node) return;
      node.removeAttribute("poster");
      try {
        const run = node.play();
        if (run?.catch) await run.catch(() => {});
      } catch {}
      if (cancelled) return;
      if (!node.paused) {
        playingRef.current = true;
        prefetch(indexRef.current);
      }
    };

    const swapTo = async (nextIndex) => {
      const playlist = listRef.current;
      if (cancelled || !playlist.length) return false;
      if (busyRef.current) return false;

      busyRef.current = true;
      handoffRef.current = true;

      const src = playlist[nextIndex];
      const prevSlot = activeRef.current;
      const nextSlot = prevSlot === 0 ? 1 : 0;
      const prev = nodes[prevSlot];
      const next = nodes[nextSlot];

      try {
        assignSrc(next, src);
        await waitReady(next);
        if (cancelled) return false;

        try {
          if (next.currentTime > 0.05) next.currentTime = 0;
        } catch {}

        next.removeAttribute("poster");
        const run = next.play();
        if (run?.catch) await run.catch(() => {});
        if (cancelled) return false;

        if (next.paused) {
          busyRef.current = false;
          handoffRef.current = false;
          if (prev) {
            try {
              const resume = prev.play();
              if (resume?.catch) resume.catch(() => {});
            } catch {}
          }
          return false;
        }

        setSlot(nextSlot, true);
        if (prev && prev !== next) setSlot(prevSlot, true);
        next.style.zIndex = "3";
        if (prev) prev.style.zIndex = "2";

        await new Promise((resolve) => {
          if (typeof next.requestVideoFrameCallback === "function") {
            try {
              next.requestVideoFrameCallback(() => resolve());
              window.setTimeout(resolve, 120);
              return;
            } catch {}
          }
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
        if (cancelled) return false;

        syncIndex(nextIndex);
        syncActive(nextSlot);
        playingRef.current = true;
        framedRef.current = true;
        setVisible(true);

        if (prev && prev !== next) {
          try {
            prev.pause();
          } catch {}
          setSlot(prevSlot, false);
        }

        prefetch(nextIndex);
        busyRef.current = false;
        handoffRef.current = false;
        return true;
      } catch {
        busyRef.current = false;
        handoffRef.current = false;
        if (prev) {
          try {
            const resume = prev.play();
            if (resume?.catch) resume.catch(() => {});
          } catch {}
        }
        return false;
      }
    };

    const advance = () => {
      const playlist = listRef.current;
      if (!multi || cancelled || !playingRef.current) return;
      if (busyRef.current || handoffRef.current) return;
      const next = (indexRef.current + 1) % playlist.length;
      swapTo(next);
    };

    const onTimeUpdate = (event) => {
      if (!multi || cancelled || busyRef.current || handoffRef.current) return;
      if (!playingRef.current) return;
      const node = event.currentTarget;
      if (node !== nodes[activeRef.current]) return;
      const duration = node.duration;
      if (!Number.isFinite(duration) || duration <= HANDOFF_S) return;
      if (duration - node.currentTime > HANDOFF_S) return;
      advance();
    };

    const onEnded = (event) => {
      if (cancelled || !playingRef.current) return;
      const node = event.currentTarget;
      if (node !== nodes[activeRef.current]) return;
      if (busyRef.current || handoffRef.current) return;
      if (!multi) {
        try {
          node.currentTime = 0;
          const run = node.play();
          if (run?.catch) run.catch(() => {});
        } catch {}
        return;
      }
      advance();
    };

    const onError = (event) => {
      if (cancelled || busyRef.current) return;
      const node = event.currentTarget;
      if (node !== nodes[activeRef.current]) return;
      if (playingRef.current) {
        advance();
        return;
      }
      if (!framedRef.current) {
        setFailed(true);
        setVisible(false);
      }
    };

    const onLoaded = (event) => {
      if (event.currentTarget === nodes[0]) armFirst();
    };

    nodes.forEach((node) => {
      node.addEventListener("timeupdate", onTimeUpdate);
      node.addEventListener("ended", onEnded);
      node.addEventListener("error", onError);
    });
    nodes[0].addEventListener("loadeddata", onLoaded);
    nodes[0].addEventListener("canplay", onLoaded);

    if (firstSrc) {
      nodes[0].dataset.heroSrc = firstSrc;
      nodes[0].src = firstSrc;
      try {
        nodes[0].load();
      } catch {}
    }

    if (nodes[0].readyState >= 2) armFirst();
    else {
      const failTimer = window.setTimeout(() => {
        if (!cancelled && !framedRef.current) {
          setFailed(true);
          setVisible(false);
        }
      }, VIDEO_FAIL_MS);
      return () => {
        cancelled = true;
        window.clearTimeout(failTimer);
        nodes.forEach((node) => {
          node.removeEventListener("timeupdate", onTimeUpdate);
          node.removeEventListener("ended", onEnded);
          node.removeEventListener("error", onError);
        });
        nodes[0].removeEventListener("loadeddata", onLoaded);
        nodes[0].removeEventListener("canplay", onLoaded);
      };
    }

    return () => {
      cancelled = true;
      busyRef.current = false;
      handoffRef.current = false;
      nodes.forEach((node) => {
        node.removeEventListener("timeupdate", onTimeUpdate);
        node.removeEventListener("ended", onEnded);
        node.removeEventListener("error", onError);
      });
      nodes[0].removeEventListener("loadeddata", onLoaded);
      nodes[0].removeEventListener("canplay", onLoaded);
    };
  }, [wantVideo, listKey, multi, firstSrc]);

  useEffect(() => {
    if (!wantVideo || !visible || !framedRef.current) return;
    if (playingRef.current) return;
    if (!playWhen) return;
    const node = active === 0 ? aRef.current : bRef.current;
    if (!node) return;
    node.removeAttribute("poster");
    const run = node.play();
    if (run?.then) {
      run
        .then(() => {
          playingRef.current = true;
          const idle = active === 0 ? bRef.current : aRef.current;
          const playlist = listRef.current;
          if (idle && playlist.length > 1) {
            const nextSrc = playlist[(indexRef.current + 1) % playlist.length];
            if (nextSrc && idle.dataset.heroSrc !== nextSrc) {
              idle.dataset.heroSrc = nextSrc;
              idle.src = nextSrc;
              try {
                idle.load();
              } catch {}
            }
          }
        })
        .catch(() => {});
    } else {
      playingRef.current = true;
    }
  }, [playWhen, wantVideo, visible, active]);

  useEffect(() => {
    const node = active === 0 ? aRef.current : bRef.current;
    if (!node || !wantVideo || !visible || !playingRef.current) return;
    if (busyRef.current) return;
    try {
      if (inView) {
        const run = node.play();
        if (run?.catch) run.catch(() => {});
      } else {
        node.pause();
      }
    } catch {}
  }, [inView, wantVideo, visible, active]);

  if (!wantVideo && !visible) return null;

  return (
    <div className={className || "absolute inset-0 overflow-hidden"}>
      <video
        ref={aRef}
        className={baseClass}
        style={{
          opacity: cover[0] ? 1 : 0,
          zIndex: active === 0 ? 3 : cover[0] ? 2 : 1,
        }}
        poster={posterSrc || undefined}
        muted
        playsInline
        loop={!multi}
        preload="auto"
        referrerPolicy="no-referrer"
        aria-hidden="true"
      />
      <video
        ref={bRef}
        className={baseClass}
        style={{
          opacity: cover[1] ? 1 : 0,
          zIndex: active === 1 ? 3 : cover[1] ? 2 : 1,
        }}
        muted
        playsInline
        loop={!multi}
        preload="auto"
        referrerPolicy="no-referrer"
        aria-hidden="true"
      />
    </div>
  );
}
