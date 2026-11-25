import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { easeOut } from "@/lib/motion";

function TitleLines({ title, reduceMotion }) {
  const lines = useMemo(() => {
    const parts = String(title || "")
      .trim()
      .split(/\n+/)
      .filter(Boolean);
    if (parts.length > 1) return parts;
    return [String(title || "").trim()].filter(Boolean);
  }, [title]);

  if (!title) return null;

  return (
    <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-tight text-white md:text-5xl lg:text-6xl">
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          className="block overflow-hidden py-[0.08em]"
        >
          <motion.span
            className="text-clip-safe block leading-[1.15]"
            initial={reduceMotion ? false : { y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.55,
              delay: reduceMotion ? 0 : 0.1 + index * 0.08,
              ease: easeOut,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

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
    <header className="bg-[#0A0820] pb-10 pt-[calc(var(--navbar-height)+var(--ticker-height)+2rem)] md:pb-14 md:pt-[calc(var(--navbar-height)+var(--ticker-height)+2.5rem)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {crumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-5 text-sm text-white/45"
          >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {crumbs.map((item, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-2"
                  >
                    {index > 0 ? (
                      <span className="text-white/25" aria-hidden="true">
                        /
                      </span>
                    ) : null}
                    {item.to && !last ? (
                      <Link
                        to={item.to}
                        className="transition-colors hover:text-brand-lime"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={last ? "text-white" : undefined}>
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-10">
          <div className="min-w-0 max-w-3xl space-y-3">
            {label || labels.length > 0 ? (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-brand-lime"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium tracking-wide text-brand-lime">
                  {label || labels[0]}
                </p>
              </div>
            ) : null}
            <TitleLines title={title} reduceMotion={reduceMotion} />
          </div>

          {subtitle ? (
            <motion.p
              className="max-w-xl text-sm leading-relaxed text-white/55 md:pb-1 md:text-base"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22, ease: easeOut }}
            >
              {subtitle}
            </motion.p>
          ) : null}
        </div>

        {imageUrl ? (
          <motion.div
            className="relative mt-10 overflow-hidden rounded-2xl border border-white/8 bg-[#110E33]"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
          >
            <SafeImage
              src={imageUrl}
              alt=""
              className="h-[28vh] w-full object-cover md:h-[32vh]"
              aria-hidden="true"
            />
          </motion.div>
        ) : null}
      </div>
    </header>
  );
}
