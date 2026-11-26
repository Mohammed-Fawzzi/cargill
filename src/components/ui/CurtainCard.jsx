import React from "react";
import { Link } from "react-router-dom";
import SafeMedia from "@/components/ui/SafeMedia";
import ParallaxImage from "@/components/ui/ParallaxImage";

function Cover({ imageUrl, videoUrl }) {
  if (!imageUrl && !videoUrl) return null;
  return (
    <div className="curtain-card__cover" aria-hidden="true">
      {imageUrl ? (
        <ParallaxImage
          src={imageUrl}
          alt=""
          width={960}
          className="curtain-card__photo"
        />
      ) : (
        <SafeMedia
          src=""
          videoUrl={videoUrl}
          alt=""
          width={960}
          className="curtain-card__photo"
        />
      )}
      <div className="curtain-card__shade" />
    </div>
  );
}

export default function CurtainCard({
  to,
  titleTo,
  imageUrl,
  videoUrl = "",
  imageAlt = "",
  label = "",
  title = "",
  description = "",
  fit = "cover",
  titleAs: Title = "h3",
  className = "",
  onPointerEnter,
  children,
}) {
  const photoClass = fit === "contain" ? "is-contain" : "is-cover";
  const thumbClass = "curtain-card__thumb ix-card__media";
  const hasMedia = Boolean(imageUrl || videoUrl);
  const media = hasMedia ? (
    <SafeMedia
      src={imageUrl}
      videoUrl={videoUrl}
      alt={imageAlt || title || ""}
      width={480}
      className={photoClass}
    />
  ) : null;
  const thumb = <div className={thumbClass}>{media}</div>;

  const inner = (
    <>
      {hasMedia ? <Cover imageUrl={imageUrl} videoUrl={videoUrl} /> : null}
      {hasMedia && titleTo && !to ? (
        <Link to={titleTo} className={thumbClass}>
          {media}
        </Link>
      ) : hasMedia ? (
        thumb
      ) : null}
      <div className="curtain-card__copy">
        {label ? <p className="curtain-card__label">{label}</p> : null}
        {title ? (
          titleTo && !to ? (
            <Link to={titleTo}>
              <Title className="curtain-card__title">{title}</Title>
            </Link>
          ) : (
            <Title className="curtain-card__title">{title}</Title>
          )
        ) : null}
        {description ? (
          <p className="curtain-card__desc">{description}</p>
        ) : null}
        {children}
      </div>
    </>
  );

  const classes = `curtain-card ix-card ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} onPointerEnter={onPointerEnter}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={classes} onPointerEnter={onPointerEnter}>
      {inner}
    </div>
  );
}
