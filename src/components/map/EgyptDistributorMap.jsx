import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import MonoLabel from "@/components/ui/MonoLabel";
import LtrText from "@/components/ui/LtrText";
import { useLocale } from "@/context/LocaleContext";
import { getDistributors } from "@/services/cms/distributors";
import { EGYPT_GOVERNORATES } from "@/constants/editorial";
import { slugifyLabel } from "@/lib/fieldIndex";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const MAP_CELLS = [
  { id: "matrouh", x: 8, y: 8, w: 18, h: 14 },
  { id: "alexandria", x: 28, y: 6, w: 10, h: 8 },
  { id: "beheira", x: 28, y: 16, w: 12, h: 10 },
  { id: "kafr-el-sheikh", x: 42, y: 8, w: 10, h: 8 },
  { id: "gharbia", x: 42, y: 18, w: 10, h: 8 },
  { id: "dakahlia", x: 54, y: 10, w: 10, h: 10 },
  { id: "damietta", x: 66, y: 8, w: 8, h: 7 },
  { id: "port-said", x: 76, y: 8, w: 8, h: 7 },
  { id: "sharqia", x: 54, y: 22, w: 12, h: 10 },
  { id: "monufia", x: 42, y: 28, w: 10, h: 8 },
  { id: "qalyubia", x: 52, y: 34, w: 8, h: 7 },
  { id: "cairo", x: 56, y: 42, w: 8, h: 8 },
  { id: "giza", x: 44, y: 40, w: 10, h: 10 },
  { id: "ismailia", x: 68, y: 24, w: 10, h: 10 },
  { id: "suez", x: 72, y: 36, w: 8, h: 10 },
  { id: "north-sinai", x: 82, y: 16, w: 14, h: 16 },
  { id: "south-sinai", x: 82, y: 36, w: 12, h: 16 },
  { id: "fayoum", x: 40, y: 52, w: 10, h: 8 },
  { id: "beni-suef", x: 48, y: 54, w: 10, h: 8 },
  { id: "minya", x: 46, y: 64, w: 12, h: 8 },
  { id: "assiut", x: 48, y: 74, w: 12, h: 8 },
  { id: "sohag", x: 50, y: 84, w: 12, h: 7 },
  { id: "qena", x: 54, y: 92, w: 10, h: 7 },
  { id: "luxor", x: 52, y: 100, w: 8, h: 6 },
  { id: "aswan", x: 50, y: 108, w: 10, h: 8 },
  { id: "red-sea", x: 68, y: 56, w: 12, h: 40 },
  { id: "new-valley", x: 24, y: 70, w: 18, h: 36 },
];

function governorateLabel(id, locale) {
  const row = EGYPT_GOVERNORATES.find((item) => item.id === id);
  return row ? t(row, locale) : id;
}

export default function EgyptDistributorMap({ teaser = false }) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const [activeId, setActiveId] = useState("");
  const query = useQuery({
    queryKey: ["cms", "distributors"],
    queryFn: getDistributors,
    staleTime: 1000 * 60 * 10,
  });

  const distributors = query.data || [];
  const byGov = useMemo(() => {
    const map = new Map();
    for (const item of distributors) {
      const key = item.governorateId || slugifyLabel(t(item.governorateLabel, locale));
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  }, [distributors, locale]);

  const activeList = activeId ? byGov.get(activeId) || [] : [];

  if (!distributors.length) return null;

  return (
    <section className={teaser ? "bg-surface py-14 lg:py-16" : "bg-page py-14 lg:py-20"}>
      <div className="container mx-auto px-4 lg:px-8">
        <MonoLabel className="mb-3 text-brand-lime/80">DISTRIBUTORS</MonoLabel>
        <h2 className="mb-8 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {teaser ? t(UI.distributorsTeaser, locale) : t(UI.distributorsTitle, locale)}
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <svg
              viewBox="0 0 100 120"
              className="h-auto w-full max-w-xl border border-line/12 bg-page p-3"
              role="img"
              aria-label={t(UI.distributorsTitle, locale)}
            >
              {MAP_CELLS.map((cell) => {
                const has = byGov.has(cell.id);
                const selected = activeId === cell.id;
                return (
                  <rect
                    key={cell.id}
                    x={cell.x}
                    y={cell.y}
                    width={cell.w}
                    height={cell.h}
                    rx={0.6}
                    tabIndex={has ? 0 : -1}
                    role={has ? "button" : "presentation"}
                    aria-label={governorateLabel(cell.id, locale)}
                    aria-pressed={selected}
                    onClick={() => has && setActiveId(cell.id)}
                    onKeyDown={(event) => {
                      if (!has) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveId(cell.id);
                      }
                    }}
                    fill={
                      has
                        ? selected
                          ? "#88c43c"
                          : "rgba(136,196,60,0.55)"
                        : "rgba(24,16,96,0.35)"
                    }
                    stroke={has ? "#88c43c" : "rgba(255,255,255,0.1)"}
                    strokeWidth="0.35"
                    className={has ? "cursor-pointer" : undefined}
                    style={{ outline: "none" }}
                  />
                );
              })}
            </svg>
          </div>

          <div className="lg:col-span-5">
            {!activeId ? (
              <p className="text-sm leading-7 text-ink/60">
                {t(UI.distributorsTeaser, locale)}
              </p>
            ) : (
              <motion.div
                key={activeId}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <p className="mb-4 font-mono text-[11px] tracking-[0.18em] text-brand-lime">
                  {governorateLabel(activeId, locale)}
                </p>
                {activeList.length ? (
                  <ul className="space-y-3">
                    {activeList.map((item) => {
                      const name = t(item.name, locale);
                      const phone = item.phone;
                      const address = t(item.address, locale);
                      const tel = toTelHref(phone);
                      const wa = toWhatsAppHref(item.whatsapp || phone);
                      return (
                        <li
                          key={item.id}
                          className="border border-line/12 bg-surface p-4"
                        >
                          <p className="text-base font-extrabold text-ink">{name}</p>
                          {address ? (
                            <p className="mt-1 text-sm text-ink/60">{address}</p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                            {tel ? (
                              <a href={tel} className="text-brand-lime hover:underline" dir="ltr">
                                <LtrText>{phone}</LtrText>
                              </a>
                            ) : null}
                            {wa ? (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ink underline-offset-4 hover:text-brand-lime hover:underline"
                              >
                                WhatsApp
                              </a>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-ink/60">
                    {t(UI.distributorsEmptyGov, locale)}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
