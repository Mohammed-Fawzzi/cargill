import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { easeOut } from "@/lib/motion";

export default function PageBanner({
  title,
  subtitle,
  imageUrl,
  label,
  breadcrumbs = [],
  meta = [],
}) {
  const reduceMotion = useReducedMotion();
  const crumbs = breadcrumbs.filter((item) => item?.label);
  const labels = meta.filter(Boolean);

  return (
    <header className="bg-white pt-[140px] pb-16">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        {crumbs.length > 0 ? (
          <div className="mb-8 flex items-center gap-4">
            <nav
              aria-label="Breadcrumb"
              className="shrink-0 text-sm text-text-muted"
            >
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {crumbs.map((item, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-brand-ink/30" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      {item.to && !last ? (
                        <Link
                          to={item.to}
                          className="transition-colors hover:text-brand-ink"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className={last ? "text-brand-ink/70" : undefined}>
                          {item.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <div className="h-px min-w-0 flex-1 bg-brand-ink" aria-hidden="true" />
          </div>
        ) : null}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-4xl">
            {labels.length > 0 ? (
              <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {labels.map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                    {index > 0 ? (
                      <span className="text-brand-ink/25" aria-hidden="true">
                        ·
                      </span>
                    ) : null}
                    <span
                      className={
                        index === 0
                          ? "font-semibold text-brand-lime"
                          : "text-text-muted"
                      }
                    >
                      {item}
                    </span>
                  </span>
                ))}
              </p>
            ) : null}
            {title ? (
              <h1 className="text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-brand-ink">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-5 max-w-[560px] text-base leading-8 text-text-muted sm:text-lg sm:leading-9">
                {subtitle}
              </p>
            ) : null}
          </div>

          {label ? (
            <div className="flex shrink-0 items-center gap-2.5 lg:pb-2">
              <TriangleAccent className="h-3 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-ink">
                {label}
              </span>
            </div>
          ) : null}
        </div>

        {imageUrl ? (
          <div className="mt-10 overflow-hidden rounded-lg bg-surface-muted">
            <SafeImage
              src={imageUrl}
              alt=""
              className="h-[32vh] w-full object-cover"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}
