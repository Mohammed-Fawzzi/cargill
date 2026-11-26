import React, { useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import {
  normalizeImageUrl,
  resolvePlayableVideoUrl,
  shouldPlayHeroVideo,
} from "@/lib/image";

export default function SafeMedia({
  src,
  videoUrl = "",
  alt = "",
  className = "",
  loading = "lazy",
  width,
  sizes,
  loop = true,
  ...props
}) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const videoSrc = useMemo(
    () => resolvePlayableVideoUrl(videoUrl),
    [videoUrl],
  );
  const poster = useMemo(
    () =>
      src
        ? normalizeImageUrl(src, {
            width: typeof width === "number" ? width : 960,
            quality: 75,
          })
        : "",
    [src, width],
  );
  const want = Boolean(videoSrc && !failed && shouldPlayHeroVideo());

  useEffect(() => {
    setFailed(false);
    setVisible(false);
  }, [videoSrc]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !want) return undefined;

    const onReady = () => {
      const run = node.play();
      if (run?.then) {
        run
          .then(() => setVisible(true))
          .catch(() => setFailed(true));
        return;
      }
      setVisible(true);
    };
    const onError = () => setFailed(true);

    node.addEventListener("canplay", onReady);
    node.addEventListener("loadeddata", onReady);
    node.addEventListener("error", onError);

    try {
      node.load();
      if (node.readyState >= 2) onReady();
    } catch {
      setFailed(true);
    }

    return () => {
      node.removeEventListener("canplay", onReady);
      node.removeEventListener("loadeddata", onReady);
      node.removeEventListener("error", onError);
      try {
        node.pause();
      } catch {}
    };
  }, [want, videoSrc]);

  if (!src && !want) return null;

  if (!want) {
    return (
      <SafeImage
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        sizes={sizes}
        {...props}
      />
    );
  }

  return (
    <>
      {src ? (
        <SafeImage
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          width={width}
          sizes={sizes}
          {...props}
        />
      ) : null}
      <video
        ref={videoRef}
        className={className}
        style={{
          opacity: visible ? 1 : 0,
          ...(src
            ? { position: "absolute", inset: 0, height: "100%", width: "100%" }
            : null),
        }}
        src={videoSrc}
        muted
        playsInline
        autoPlay
        loop={loop}
        preload="metadata"
        poster={poster || undefined}
        aria-hidden="true"
      />
    </>
  );
}
