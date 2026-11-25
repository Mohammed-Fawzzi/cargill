import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import TiltCard from "@/components/ui/TiltCard";
import { easeOut } from "@/lib/motion";

export default function ContentCard({
  to,
  imageUrl,
  title,
  body,
  category,
  secondary,
  layout = "default",
  imageFit = "cover",
}) {
  const reduceMotion = useReducedMotion();
  const horizontal = layout === "horizontal";
  const contain = imageFit === "contain";

  return (
    <article className="h-full">
      <Link
        to={to}
        className={`group relative flex h-full ${
          horizontal
            ? "flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-10"
            : "flex-col"
        }`}
      >
        <TiltCard
          className={`relative overflow-hidden rounded-md bg-surface-muted ${
            horizontal
              ? "aspect-[4/3] w-full sm:aspect-auto sm:w-[46%] sm:min-h-[280px]"
              : contain
                ? "aspect-[4/3] w-full"
                : "aspect-[16/10] w-full"
          }`}
        >
          <motion.div
            className="h-full w-full"
            initial={
              reduceMotion ? false : { clipPath: "inset(100% 0 0 0)" }
            }
            whileInView={{ clipPath: "inset(0% 0 0 0)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            {imageUrl ? (
              <SafeImage
                src={imageUrl}
                alt={title || ""}
                className={`h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                  contain ? "object-contain p-4" : "object-cover"
                }`}
              />
            ) : (
              <div className="flex h-full min-h-[180px] items-center justify-center px-4 text-center text-sm font-semibold text-ink/50">
                {title}
              </div>
            )}
          </motion.div>
        </TiltCard>

        <div
          className={`flex min-w-0 flex-1 flex-col ${
            horizontal ? "justify-center pb-5 sm:pb-2" : "pt-4 pb-5"
          }`}
        >
          {category || secondary ? (
            <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
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
            <h3 className="mb-2 line-clamp-2 text-[22px] font-extrabold leading-8 text-ink">
              {title}
            </h3>
          ) : null}

          {body ? (
            <p className="line-clamp-2 text-sm leading-7 text-text-muted">
              {body}
            </p>
          ) : null}
        </div>

        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-navy/15"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-lime transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
