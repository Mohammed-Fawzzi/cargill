import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigationType } from "react-router-dom";
import { animate, motion } from "framer-motion";
import {
  buildImageSrcSet,
  normalizeImageUrl,
  warnMissingMedia,
} from "@/lib/image";
import { easeOut } from "@/lib/motion";
import { notePageSession, shouldPlayPageIntro } from "@/lib/pageIntro";
import { useLenis } from "@/components/layout/LenisProvider";
import InnerPageIntro from "@/components/ui/InnerPageIntro";
import HeroMedia from "@/components/ui/HeroMedia";

const EASE = [0.76, 0, 0.24, 1];

function reducedNow() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wordParts(text) {
  return String(text || "")
    .split(/(\s+)/)
    .filter((part) => part.length > 0);
}

function HeroTitle({ text, play }) {
  const parts = wordParts(text);
  let word = 0;
  return (
    <h1 className="page-hero__title">
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <span key={`s-${index}`}>{part}</span>;
        }
        const delay = word * 0.05;
        word += 1;
        if (!play) {
          return (
            <span key={`w-${index}`} className="page-hero__word">
              {part}
            </span>
          );
        }
        return (
          <span key={`w-${index}`} className="page-hero__word">
            <motion.span
              className="page-hero__word-inner"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.4, delay, ease: easeOut }}
            >
              {part}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}

function Crumbs({ items }) {
  if (!items?.length) return null;
  return (
    <p className="page-hero__kicker">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 ? <span className="page-hero__kicker-sep"> / </span> : null}
          {item.to ? (
            <Link to={item.to} className="hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}

export default function PageHero({
  title,
  description = "",
  imageUrl = "",
  videoUrl = "",
  videoUrls,
  sideImages = [],
  crumbs = [],
  kicker = "",
  actions = null,
  actionsRef = null,
  card = null,
  anchors = [],
  size = "tall",
}) {
  const navType = useNavigationType();
  const lenis = useLenis();
  const rootRef = useRef(null);
  const mediaRef = useRef(null);
  const baseScale = useRef(1);
  const reduced = useMemo(() => reducedNow(), []);
  const hasImage = Boolean(typeof imageUrl === "string" && imageUrl.trim());
  const hasVideo = Boolean(
    (typeof videoUrl === "string" && videoUrl.trim()) ||
      (Array.isArray(videoUrls) && videoUrls.some(Boolean)),
  );
  const [showIntro, setShowIntro] = useState(
    () => hasImage && shouldPlayPageIntro(navType, reduced),
  );
  const [revealed, setRevealed] = useState(
    () => !(hasImage && shouldPlayPageIntro(navType, reduced)) && !reduced,
  );
  const [instant, setInstant] = useState(
    () => !(hasImage && shouldPlayPageIntro(navType, reduced)) && !reduced,
  );
  const [loaded, setLoaded] = useState(false);
  const [copyOn, setCopyOn] = useState(
    () => !(hasImage && shouldPlayPageIntro(navType, reduced)) && !reduced,
  );
  const [activeAnchor, setActiveAnchor] = useState(anchors[0]?.id || "");
  const [media, setMedia] = useState({
    want: false,
    visible: false,
    failed: false,
    finished: false,
  });
  const videoActive = Boolean(media.want || media.visible);
  const showCopy = revealed && !showIntro && copyOn;
  const mediaReady = Boolean(
    (hasImage && loaded) ||
      (hasVideo && (media.visible || media.want)) ||
      (!hasImage && !hasVideo),
  );

  const src = hasImage
    ? normalizeImageUrl(imageUrl, { width: 1600, quality: 78 })
    : "";
  const srcSet = hasImage ? buildImageSrcSet(imageUrl, { quality: 78 }) : "";
  const wordCount = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const descDelay = wordCount * 0.05 + 0.08;
  const actionDelay = descDelay + (description ? 0.16 : 0.06);

  useEffect(() => {
    warnMissingMedia("page-hero", imageUrl || videoUrl);
  }, [imageUrl, videoUrl]);

  const applyMedia = () => {
    const hero = rootRef.current;
    const img = mediaRef.current;
    if (!hero || !img) return;
    const height = hero.offsetHeight || 1;
    const progress = Math.min(Math.max(window.scrollY / height, 0), 1);
    const scale = Math.max(1, baseScale.current * (1 + progress * 0.15));
    img.style.transform = `translate3d(0, ${progress * 15}%, 0) scale(${scale})`;
  };

  useEffect(() => {
    notePageSession();
    document.documentElement.dataset.pageHero = "on";
    return () => {
      delete document.documentElement.dataset.pageHero;
    };
  }, []);

  useEffect(() => {
    if (!showIntro) document.documentElement.dataset.pageIntro = "done";
  }, [showIntro]);

  useEffect(() => {
    if (!src) {
      setLoaded(!hasImage);
      return undefined;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setLoaded(true);
    };
    img.onerror = () => {
      if (alive) setLoaded(false);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src, hasImage]);

  useEffect(() => {
    if (!reduced || showIntro) return undefined;
    const frame = requestAnimationFrame(() => setRevealed(true));
    const copy = window.setTimeout(() => setCopyOn(true), 200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(copy);
    };
  }, [reduced, showIntro]);

  useEffect(() => {
    if (!hasImage || !loaded) return undefined;
    const onScroll = () => applyMedia();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loaded, hasImage]);

  useLayoutEffect(() => {
    if (!revealed || !hasImage || !loaded) return undefined;
    const img = mediaRef.current;
    if (!img) return undefined;
    if (instant || reduced) {
      baseScale.current = 1;
      applyMedia();
      return undefined;
    }
    baseScale.current = 1.08;
    applyMedia();
    const run = animate(1.08, 1, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (value) => {
        baseScale.current = value;
        applyMedia();
      },
    });
    return () => run.stop();
  }, [revealed, loaded, instant, reduced, hasImage]);

  useEffect(() => {
    if (!anchors.length) return undefined;
    const nodes = anchors
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (!nodes.length) return undefined;
    const update = () => {
      const line = Math.min(window.innerHeight * 0.35, 220);
      let current = anchors[0].id;
      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top <= line) current = node.id;
      });
      setActiveAnchor(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [anchors]);

  const onDone = (mode) => {
    setShowIntro(false);
    if (mode === "skip") {
      setInstant(true);
      setRevealed(true);
      setCopyOn(true);
      document.documentElement.dataset.pageIntro = "done";
      return;
    }
    setRevealed(true);
    window.setTimeout(() => setCopyOn(true), 200);
  };

  const scrollNext = () => {
    const node = rootRef.current?.parentElement?.nextElementSibling;
    if (!node) return;
    const navbar =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"),
      ) || 92;
    lenis?.scrollTo(node, { offset: -navbar });
  };

  const shadeClass = `page-hero__shade${revealed ? " is-on" : ""}${instant ? " is-instant" : ""}${reduced && !instant ? " is-fade" : ""}`;
  const photoVisible = hasImage && revealed && loaded && !media.visible;

  return (
    <>
      <div className="page-hero-wrap">
        <section
          ref={rootRef}
          className={`page-hero${size === "mid" ? " page-hero--mid" : ""}`}
        >
          <div className="page-hero__media" data-page-hero-media>
            {src ? (
              <img
                ref={mediaRef}
                data-page-hero-photo
                src={src}
                srcSet={srcSet || undefined}
                sizes={srcSet ? "100vw" : undefined}
                alt=""
                loading="eager"
                fetchPriority="high"
                className={`page-hero__photo${(reduced && !instant) || (revealed && !loaded) ? " is-fade" : ""}`}
                style={{ opacity: photoVisible ? 1 : 0 }}
                draggable={false}
              />
            ) : null}
            <HeroMedia
              videoUrl={videoUrl}
              videoUrls={videoUrls}
              posterUrl={imageUrl}
              ready={hasVideo}
              slot="page-hero"
              videoClassName="page-hero__photo absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-out"
              onStateChange={setMedia}
            />
            <div
              className="page-hero__panel"
              style={{
                opacity: mediaReady || videoActive ? 0 : 1,
              }}
            />
            <div className={shadeClass} />
          </div>

          <div className={`page-hero__copy${showCopy ? " is-on" : ""}`}>
            {showCopy ? (
              <>
                <motion.div
                  initial={instant || reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                >
                  {kicker ? <p className="page-hero__kicker">{kicker}</p> : <Crumbs items={crumbs} />}
                </motion.div>
                {title ? (
                  <HeroTitle text={title} play={!reduced && !instant} />
                ) : null}
                {description ? (
                  <div className="page-hero__desc-mask">
                    <motion.p
                      className="page-hero__desc"
                      initial={instant || reduced ? false : { y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: instant ? 0 : descDelay,
                        ease: easeOut,
                      }}
                    >
                      {description}
                    </motion.p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="invisible" aria-hidden="true">
                {kicker ? <p className="page-hero__kicker">{kicker}</p> : <Crumbs items={crumbs} />}
                {title ? <h1 className="page-hero__title">{title}</h1> : null}
                {description ? <p className="page-hero__desc">{description}</p> : null}
              </div>
            )}
            {actions ? (
              <div ref={actionsRef} className="page-hero__actions">
                {showCopy ? (
                  <motion.div
                    initial={instant || reduced ? false : { y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: instant ? 0 : actionDelay,
                      ease: easeOut,
                    }}
                  >
                    {actions}
                  </motion.div>
                ) : (
                  <div className="invisible">{actions}</div>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className={`page-hero__chevron${showCopy ? " is-on" : ""}`}
            onClick={scrollNext}
            aria-label={title || ""}
          >
            <svg viewBox="0 0 24 32" aria-hidden="true">
              <path d="M6 6 L12 12 L18 6" />
              <path d="M6 16 L12 22 L18 16" />
            </svg>
          </button>
        </section>

        {card ? <aside className="page-hero__card">{card}</aside> : null}

        {anchors.length ? (
          <nav className="page-anchors" aria-label={title || ""}>
            {anchors.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={item.id === activeAnchor ? "is-active" : ""}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>

      {showIntro ? (
        <InnerPageIntro
          imageUrl={imageUrl}
          sideImages={sideImages}
          onDone={onDone}
        />
      ) : null}
    </>
  );
}
