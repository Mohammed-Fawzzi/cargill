import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { useLocale } from "@/context/LocaleContext";
import { PRODUCT_VIEW_LABELS } from "@/constants/cinematic";
import { t } from "@/lib/i18n";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function Pedestal({ height, width, className = "" }) {
  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
      style={{ width }}
      aria-hidden="true"
    >
      <div
        className="w-full rounded-full bg-[#221a72]"
        style={{ height: 10, marginBottom: -1 }}
      />
      <div className="w-[92%] bg-[#181060]" style={{ height }} />
      <div
        className="w-full rounded-full bg-[#110e33]"
        style={{ height: 12, marginTop: -1 }}
      />
    </div>
  );
}

export default function ProductStage({
  images = [],
  name = "",
  cutout = false,
  showNameBackdrop = true,
  stageKey,
}) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const gallery = useMemo(() => (images || []).filter(Boolean), [images]);
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, Math.max(gallery.length - 1, 0))];
  const showSwitcher = gallery.length > 1;
  const animKey = stageKey || current || name;

  return (
    <div className="relative">
      <div className="relative overflow-hidden border border-line/12 bg-page">
        <AmbientGlow className="top-0 start-1/2 h-32 w-[55%] -translate-x-1/2 rtl:translate-x-1/2" />
        {showNameBackdrop && name ? (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[6%] z-0 text-center font-extrabold leading-none tracking-tight text-transparent"
            style={{
              fontSize: "clamp(5rem, 18vw, 13.75rem)",
              WebkitTextStroke: "1px rgba(255,255,255,0.22)",
            }}
          >
            {name}
          </p>
        ) : null}

        <div className="relative z-10 flex min-h-[22rem] flex-col items-center justify-end px-4 pb-8 pt-10 sm:min-h-[26rem] sm:px-8">
          <div className="relative z-20 mb-[-1.25rem] flex w-full max-w-md items-end justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {current ? (
                <motion.div
                  key={animKey}
                  initial={
                    reducedMotion ? false : { opacity: 0, y: 36 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, y: 40, transition: { duration: 0.4, ease: easeOut } }
                  }
                  transition={{ duration: 0.4, ease: easeOut }}
                  className="relative z-20 w-[70%] max-w-[280px]"
                >
                  {cutout ? (
                    <SafeImage
                      src={current}
                      alt={name}
                      className="relative z-20 h-auto w-full object-contain drop-shadow-[0_18px_28px_rgba(10,8,32,0.45)]"
                    />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-line/15 bg-surface p-3">
                      <SafeImage
                        src={current}
                        alt={name}
                        className="aspect-[4/5] w-full object-contain"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <div
                  key="empty"
                  className="relative z-20 px-6 text-center text-ink/40"
                >
                  {name}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex w-full max-w-lg items-end justify-center gap-3 sm:gap-5">
            <Pedestal height={48} width="22%" className="opacity-90" />
            <Pedestal height={78} width="36%" />
            <Pedestal height={58} width="26%" className="opacity-95" />
            <div
              className="pointer-events-none absolute bottom-1 start-1/2 h-8 w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(10,8,32,0.55),transparent_70%)] blur-md rtl:translate-x-1/2"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {showSwitcher ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {gallery.map((src, index) => {
            const label =
              t(PRODUCT_VIEW_LABELS[index], locale) || `${index + 1}`;
            const isActive = index === active;
            return (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? "border-brand-lime bg-brand-lime text-brand-navy"
                    : "border-line/15 text-ink/60 hover:border-brand-lime hover:text-brand-lime"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
