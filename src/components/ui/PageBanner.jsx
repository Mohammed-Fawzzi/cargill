import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import OrganicFloat from "@/components/ui/OrganicFloat";
import { normalizeImageUrl } from "@/lib/image";
import { easeOut } from "@/lib/motion";

export default function PageBanner({
  title,
  subtitle,
  imageUrl,
  variant = "default",
  eyebrow,
}) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 420], [0, 70]);
  const src = normalizeImageUrl(imageUrl, { width: 1920, quality: 72 });
  const tall = variant === "editorial" || variant === "immersive";
  const minH =
    variant === "immersive"
      ? "min-h-[68vh] sm:min-h-[74vh]"
      : variant === "editorial"
        ? "min-h-[52vh] sm:min-h-[58vh]"
        : "min-h-[42vh] sm:min-h-[48vh]";

  return (
    <section
      className={`relative isolate overflow-hidden bg-brand-forest-deep text-white ${minH}`}
    >
      {src ? (
        <motion.img
          src={src}
          alt=""
          style={{ y: imageY }}
          className="absolute inset-0 h-[120%] w-full object-cover will-change-transform"
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-forest via-brand-forest-deep to-brand-black"
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/70 to-brand-black/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-brand-forest-deep/55 via-transparent to-brand-black/30"
        aria-hidden="true"
      />
      <OrganicFloat className="opacity-70 mix-blend-screen" />

      <div
        className={`relative container mx-auto flex min-h-[inherit] px-4 pt-[calc(var(--navbar-height)+2.5rem)] lg:px-8 ${
          variant === "center"
            ? "items-center justify-center pb-16 text-center"
            : "items-end pb-12 lg:pb-16"
        }`}
      >
        <motion.div
          className={`max-w-3xl ${variant === "center" ? "mx-auto" : ""}`}
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
        >
          {eyebrow ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-lime sm:text-sm">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h1
              className={`font-extrabold leading-[1.08] tracking-tight ${
                tall
                  ? "text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
                  : "text-4xl sm:text-5xl lg:text-6xl"
              }`}
            >
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <motion.p
              className={`mt-4 max-w-2xl text-base leading-8 text-white/85 sm:text-lg ${
                variant === "center" ? "mx-auto" : ""
              }`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: easeOut, delay: 0.12 }}
            >
              {subtitle}
            </motion.p>
          ) : null}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/10 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
