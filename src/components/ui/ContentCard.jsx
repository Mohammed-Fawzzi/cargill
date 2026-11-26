import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SafeMedia from "@/components/ui/SafeMedia";
import { easeOut } from "@/lib/motion";

export default function ContentCard({
  to,
  imageUrl,
  videoUrl = "",
  title,
  body,
  category,
  secondary,
  index = 0,
  layout = "default",
  imageFit = "cover",
}) {
  const reduceMotion = useReducedMotion();
  const horizontal = layout === "horizontal";
  const contain = imageFit === "contain";
  const number = `${String(index + 1).padStart(2, "0")}.`;
  const mediaH = horizontal ? "14rem" : "12.5rem";
  const hasMedia = Boolean(imageUrl || videoUrl);

  return (
    <article className="h-full">
      <Link
        to={to}
        className={`ix-card group relative ${
          horizontal
            ? "flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-10"
            : ""
        }`}
        style={{ "--ix-media-h": mediaH }}
      >
        <motion.div
          className={`ix-card__media bg-surface-muted ${
            horizontal ? "w-full sm:w-[46%]" : "w-full"
          }`}
          style={{ height: mediaH }}
          initial={reduceMotion ? false : { clipPath: "inset(100% 0 0 0)" }}
          whileInView={{ clipPath: "inset(0% 0 0 0)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          {hasMedia ? (
            <SafeMedia
              src={imageUrl}
              videoUrl={videoUrl}
              alt={title || ""}
              className={`h-full w-full ${
                contain ? "object-contain p-4" : "object-cover"
              }`}
            />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center px-4 text-center text-sm font-semibold text-ink/50">
              {title}
            </div>
          )}
        </motion.div>

        <div
          className={`flex min-w-0 flex-1 flex-col ${
            horizontal ? "justify-center pb-5 sm:pb-2" : "pb-5"
          }`}
        >
          {category || secondary ? (
            <p className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {category ? (
                <span className="font-semibold text-brand-lime">{category}</span>
              ) : null}
              {category && secondary ? (
                <span className="text-ink/25" aria-hidden="true">
                  ·
                </span>
              ) : null}
              {secondary ? (
                <span className="text-text-muted">{secondary}</span>
              ) : null}
            </p>
          ) : null}

          {title ? (
            <div className="ix-card__title-row mt-0">
              <span className="ix-card__num text-ink/20" dir="ltr">
                {number}
              </span>
              <h3 className="ix-card__title text-[22px] font-extrabold text-ink">
                {title}
              </h3>
            </div>
          ) : null}

          {body ? (
            <p className="ix-card__desc line-clamp-2 text-sm leading-7 text-text-muted">
              {body}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
