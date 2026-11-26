import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getDrivePosterUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

const VIDEO_FAIL_MS = 8000;
const HANDOFF_S = 0.6;

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

function paintReady(node) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (typeof node.requestVideoFrameCallback === "function") {
      try {
        node.requestVideoFrameCallback(() => finish());
        window.setTimeout(finish, 160);
        return;
      } catch {}
    }
    requestAnimationFrame(() => requestAnimationFrame(finish));
  });
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
  const playWhenRef = useRef(playWhen);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cover, setCover] = useState([true, false]);
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
    "absolute inset-0 h-full w-full object-cover object-center";

  playWhenRef.current = playWhen;

  useEffect(() => {
    indexRef.current = 0;
    activeRef.current = 0;
    framedRef.current = false;
    playingRef.current = false;
    busyRef.current = false;
    setIndex(0);
    setActive(0);
    setFailed(false);
    setVisible(false);
    setCover([true, false]);
  }, [listKey, posterSrc]);

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
    let failTimer = 0;
    let handoff = false;

    const clearFailTimer = () => {
      window.clearTimeout(failTimer);
      failTimer = 0;
    };

    const syncIndex = (next) => {
      indexRef.current = next;
      if (!cancelled) setIndex(next);
    };

    const syncActive = (next) => {
      activeRef.current = next;
      if (!cancelled) setActive(next);
    };

    const setSlotCover = (slotIndex, on) => {
      if (cancelled) return;
      setCover((current) => {
        if (current[slotIndex] === on) return current;
        const next = current.slice();
        next[slotIndex] = on;
        return next;
      });
    };

    const failHard = () => {
      if (cancelled || framedRef.current || playingRef.current) return;
      clearFailTimer();
      busyRef.current = false;
      setVisible(false);
      setFailed(true);
    };

    const assignSrc = (node, src) => {
      if (node.dataset.heroSrc === src) return false;
      node.dataset.heroSrc = src;
      node.src = src;
      try {
        node.load();
      } catch {}
      return true;
    };

    const waitFrame = (node) =>
      new Promise((resolve, reject) => {
        let done = false;
        const finish = (ok) => {
          if (done) return;
          done = true;
          node.removeEventListener("loadeddata", onReady);
          node.removeEventListener("loadedmetadata", onReady);
          node.removeEventListener("canplay", onReady);
          node.removeEventListener("error", onErr);
          if (ok) resolve();
          else reject(new Error("not-ready"));
        };
        const onReady = () => finish(true);
        const onErr = () => finish(false);
        if (node.readyState >= 2) {
          finish(true);
          return;
        }
        node.addEventListener("loadeddata", onReady);
        node.addEventListener("loadedmetadata", onReady);
        node.addEventListener("canplay", onReady);
        node.addEventListener("error", onErr);
        window.setTimeout(() => {
          if (node.readyState >= 2) finish(true);
          else finish(false);
        }, VIDEO_FAIL_MS);
      });

    const prefetch = (fromIndex) => {
      if (!multi || cancelled) return;
      const idleSlot = activeRef.current === 0 ? 1 : 0;
      const idle = nodes[idleSlot];
      if (!idle) return;
      const nextIndex = (fromIndex + 1) % list.length;
      const src = list[nextIndex];
      if (!src) return;
      if (idle.dataset.heroSrc === src && idle.readyState >= 2) return;
      try {
        assignSrc(idle, src);
      } catch {}
    };

    const clearVideoPoster = (node) => {
      if (!node) return;
      node.removeAttribute("poster");
    };

    const showStill = (slotIndex, clipIndex) => {
      if (cancelled) return;
      const node = nodes[slotIndex];
      try {
        node.pause();
      } catch {}
      node.style.opacity = "1";
      node.style.zIndex = "3";
      setSlotCover(slotIndex, true);
      syncIndex(clipIndex);
      syncActive(slotIndex);
      framedRef.current = true;
      setVisible(true);
      clearFailTimer();
    };

    const startPlayback = async () => {
      if (cancelled || playingRef.current || !framedRef.current) return;
      if (!playWhenRef.current) return;
      const node = nodes[activeRef.current];
      if (!node) return;
      try {
        clearVideoPoster(node);
        const run = node.play();
        if (run?.catch) await run.catch(() => {});
        if (cancelled) return;
        if (!node.paused) {
          playingRef.current = true;
          busyRef.current = false;
          prefetch(indexRef.current);
        }
      } catch {}
    };

    const revealNext = async (slotIndex, clipIndex) => {
      if (cancelled) return;
      const node = nodes[slotIndex];
      const prevSlot = activeRef.current;
      const prev = nodes[prevSlot];

      clearVideoPoster(node);
      node.style.opacity = "1";
      node.style.zIndex = "3";
      if (prev && prev !== node) {
        prev.style.zIndex = "2";
        prev.style.opacity = "1";
      }
      setSlotCover(slotIndex, true);
      if (prev && prev !== node) setSlotCover(prevSlot, true);

      syncIndex(clipIndex);
      syncActive(slotIndex);
      framedRef.current = true;
      playingRef.current = true;
      setVisible(true);
      clearFailTimer();

      await paintReady(node);
      if (cancelled) return;

      if (prev && prev !== node) {
        try {
          prev.pause();
        } catch {}
        prev.style.opacity = "0";
        prev.style.zIndex = "1";
        setSlotCover(prevSlot, false);
      }

      handoff = false;
      busyRef.current = false;
      prefetch(clipIndex);
    };

    const markFirstFrame = (node) => {
      if (cancelled || framedRef.current) return;
      if (node !== nodes[0]) return;
      showStill(0, 0);
      busyRef.current = false;
      startPlayback();
    };

    const playAt = async (nextIndex, { fromHandoff = false } = {}) => {
      if (cancelled || !list.length) return;
      if (busyRef.current && !fromHandoff) return;
      if (nextIndex < 0 || nextIndex >= list.length) {
        if (playingRef.current) playAt(0, { fromHandoff });
        else failHard();
        return;
      }

      busyRef.current = true;
      clearFailTimer();

      const src = list[nextIndex];
      const currentSlot = activeRef.current;
      let slotIndex = currentSlot;
      if (multi && (playingRef.current || fromHandoff)) {
        slotIndex = currentSlot === 0 ? 1 : 0;
      }

      const node = nodes[slotIndex];
      const prev = nodes[currentSlot];
      if (!node) {
        busyRef.current = false;
        if (!playingRef.current) failHard();
        else handoff = false;
        return;
      }

      try {
        if (!(slotIndex === 0 && nextIndex === 0 && node.dataset.heroSrc === src)) {
          assignSrc(node, src);
        } else if (!node.dataset.heroSrc) {
          node.dataset.heroSrc = src;
        }

        await waitFrame(node);
        if (cancelled) return;

        if (!playingRef.current && !fromHandoff) {
          showStill(slotIndex, nextIndex);
          busyRef.current = false;
          await startPlayback();
          return;
        }

        try {
          if (node.currentTime > 0.05) node.currentTime = 0;
        } catch {}

        clearVideoPoster(node);
        const run = node.play();
        if (run?.catch) await run.catch(() => {});
        if (cancelled) return;

        if (node.paused) {
          busyRef.current = false;
          handoff = false;
          if (prev && prev !== node) {
            try {
              const resume = prev.play();
              if (resume?.catch) resume.catch(() => {});
            } catch {}
          }
          return;
        }

        await revealNext(slotIndex, nextIndex);
      } catch {
        busyRef.current = false;
        handoff = false;
        clearFailTimer();
        if (cancelled) return;
        if (!playingRef.current) {
          const fallback = (nextIndex + 1) % list.length;
          if (fallback !== nextIndex) playAt(fallback);
          else failHard();
          return;
        }
        if (prev && prev !== node) {
          try {
            const resume = prev.play();
            if (resume?.catch) resume.catch(() => {});
          } catch {}
        }
      }
    };

    const startHandoff = () => {
      if (!multi || cancelled || busyRef.current || handoff) return;
      if (!playingRef.current) return;
      handoff = true;
      const current = nodes[activeRef.current];
      if (current) {
        try {
          if (
            Number.isFinite(current.duration) &&
            current.duration - current.currentTime < 0.12
          ) {
            current.pause();
          }
        } catch {}
      }
      const next = (indexRef.current + 1) % list.length;
      playAt(next, { fromHandoff: true });
    };

    const onTimeUpdate = (event) => {
      if (!multi || cancelled || busyRef.current || handoff) return;
      if (!playingRef.current) return;
      const node = event.currentTarget;
      if (node !== nodes[activeRef.current]) return;
      const duration = node.duration;
      if (!Number.isFinite(duration) || duration <= HANDOFF_S) return;
      const left = duration - node.currentTime;
      if (left > HANDOFF_S || left < 0) return;
      startHandoff();
    };

    const onEnded = (event) => {
      if (cancelled || !playingRef.current) return;
      const node = event.currentTarget;
      if (node !== nodes[activeRef.current]) return;
      if (busyRef.current || handoff) return;
      if (!multi) {
        try {
          node.currentTime = 0;
          const run = node.play();
          if (run?.catch) run.catch(() => {});
        } catch {}
        return;
      }
      startHandoff();
    };

    const onError = (event) => {
      if (cancelled || busyRef.current) return;
      const node = event.currentTarget;
      if (node !== nodes[activeRef.current]) return;
      if (playingRef.current) return;
      const fallback = (indexRef.current + 1) % list.length;
      if (fallback === indexRef.current) {
        failHard();
        return;
      }
      playAt(fallback);
    };

    const onLoadedData = (event) => {
      markFirstFrame(event.currentTarget);
    };

    nodes.forEach((node) => {
      node.addEventListener("timeupdate", onTimeUpdate);
      node.addEventListener("ended", onEnded);
      node.addEventListener("error", onError);
    });
    nodes[0].addEventListener("loadeddata", onLoadedData);
    nodes[0].addEventListener("loadedmetadata", onLoadedData);

    if (firstSrc) {
      nodes[0].dataset.heroSrc = firstSrc;
      if (!nodes[0].getAttribute("src")) {
        nodes[0].src = firstSrc;
        try {
          nodes[0].load();
        } catch {}
      }
    }

    if (nodes[0].readyState >= 2) markFirstFrame(nodes[0]);
    else playAt(0);

    return () => {
      cancelled = true;
      busyRef.current = false;
      clearFailTimer();
      nodes.forEach((node) => {
        node.removeEventListener("timeupdate", onTimeUpdate);
        node.removeEventListener("ended", onEnded);
        node.removeEventListener("error", onError);
      });
      nodes[0].removeEventListener("loadeddata", onLoadedData);
      nodes[0].removeEventListener("loadedmetadata", onLoadedData);
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
          opacity: wantVideo || cover[0] ? 1 : 0,
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
