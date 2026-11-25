import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";

function CardArrow() {
  return (
    <span className="card-arrow" aria-hidden="true">
      <span className="card-arrow__ring">
        <span className="card-arrow__glyph">←</span>
        <span className="card-arrow__glyph">←</span>
      </span>
    </span>
  );
}

function Cover({ imageUrl }) {
  return (
    <div className="curtain-card__cover" aria-hidden="true">
      {imageUrl ? (
        <SafeImage
          src={imageUrl}
          alt=""
          width={960}
          className="curtain-card__photo"
        />
      ) : null}
      <div className="curtain-card__shade" />
    </div>
  );
}

export default function CurtainCard({
  to,
  titleTo,
  imageUrl,
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
  const thumb = (
    <div className={thumbClass}>
      {imageUrl ? (
        <SafeImage
          src={imageUrl}
          alt={imageAlt || title || ""}
          width={480}
          className={photoClass}
        />
      ) : null}
    </div>
  );

  const inner = (
    <>
      {imageUrl ? <Cover imageUrl={imageUrl} /> : null}
      {imageUrl && titleTo && !to ? (
        <Link to={titleTo} className={thumbClass}>
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={imageAlt || title || ""}
              width={480}
              className={photoClass}
            />
          ) : null}
        </Link>
      ) : imageUrl ? (
        thumb
      ) : null}
      {imageUrl ? <CardArrow /> : null}
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
