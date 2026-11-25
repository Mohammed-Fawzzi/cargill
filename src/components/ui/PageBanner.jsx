import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { easeOut } from "@/lib/motion";

function TitleLines({ title, reduceMotion }) {
  const lines = useMemo(() => {
    const parts = String(title || "")
      .trim()
      .split(/\n+/)
      .filter(Boolean);
    if (parts.length > 1) return parts;
    const words = String(title || "").trim().split(/\s+/).filter(Boolean);
    if (words.length <= 3) return [words.join(" ")];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }, [title]);

  if (!title) return null;

  return (
    <h1 className="text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[1.12] tracking-tight text-ink">
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          className="block overflow-hidden py-[0.12em]"
        >
          <motion.span
            className="text-clip-safe block leading-[1.12]"
            initial={reduceMotion ? false : { y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.55,
              delay: reduceMotion ? 0 : 0.12 + index * 0.1,
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
    <header className="bg-page pb-16 pt-[calc(var(--navbar-height)+var(--ticker-height)+2.5rem)]">
      <div className="container mx-auto px-4 lg:px-8">
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
                        <span className="text-ink/30" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      {item.to && !last ? (
                        <Link
                          to={item.to}
                          className="transition-colors hover:text-ink"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className={last ? "text-ink/70" : undefined}>
                          {item.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <span className="relative h-px min-w-0 flex-1 overflow-hidden" aria-hidden="true">
              <motion.span
                className="absolute inset-0 origin-left bg-ink rtl:origin-right"
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
              />
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-4xl">
            {labels.length > 0 ? (
              <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {labels.map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                    {index > 0 ? (
                      <span className="text-ink/25" aria-hidden="true">
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
            <TitleLines title={title} reduceMotion={reduceMotion} />
            {subtitle ? (
              <motion.p
                className="mt-5 max-w-[560px] text-base leading-8 text-text-muted sm:text-lg sm:leading-9"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.28, ease: easeOut }}
              >
                {subtitle}
              </motion.p>
            ) : null}
          </div>

          {label ? (
            <div className="flex shrink-0 items-center gap-2.5 lg:pb-2">
              <TriangleAccent className="h-3 w-3.5" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/70">
                {label}
              </span>
            </div>
          ) : null}
        </div>

        {imageUrl ? (
          <motion.div
            className="relative mt-10 overflow-hidden border border-line/12 bg-surface"
            initial={
              reduceMotion ? false : { clipPath: "inset(100% 0 0 0)" }
            }
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
          >
            <motion.div
              className="h-full w-full"
              initial={reduceMotion ? false : { scale: 1 }}
              whileInView={reduceMotion ? undefined : { scale: 1.05 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 9, ease: "linear" }}
            >
              <SafeImage
                src={imageUrl}
                alt=""
                className="cinema-grade-open h-[32vh] w-full object-cover"
                aria-hidden="true"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-brand-navy/25 mix-blend-multiply" />
          </motion.div>
        ) : null}
      </div>
    </header>
  );
}
