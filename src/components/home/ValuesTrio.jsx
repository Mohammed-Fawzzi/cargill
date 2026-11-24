import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function ValuesTrio() {
  const { locale } = useLocale();
  const { contact } = useSiteData();

  const cards = useMemo(() => {
    return [
      {
        id: "about",
        title: t(UI.whoWeAre, locale),
        body: t(contact?.about, locale),
        tag: t(UI.valuesTagField, locale),
      },
      {
        id: "vision",
        title: t(UI.ourVision, locale),
        body: t(contact?.vision, locale),
        tag: t(UI.valuesTagVision, locale),
      },
      {
        id: "mission",
        title: t(UI.ourMission, locale),
        body: t(contact?.mission, locale),
        tag: t(UI.valuesTagMission, locale),
      },
    ].filter((item) => item.body);
  }, [contact?.about, contact?.vision, contact?.mission, locale]);

  if (!cards.length) return null;

  return (
    <section className="relative overflow-hidden bg-surface-muted py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 max-w-2xl lg:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-moss">
            {t(UI.valuesEyebrow, locale)}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            {t(UI.valuesTitle, locale)}
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="h-full"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, ease: easeOut, delay: index * 0.05 }}
            >
              <TiltCard className="h-full" maxTilt={5}>
                <article className="group flex h-full flex-col rounded-[1.5rem] border border-brand-ink/5 bg-white p-6 shadow-[0_12px_32px_rgba(24,16,96,0.06)] sm:p-7">
                  <div
                    className="mb-4 h-1 w-10 bg-brand-lime"
                    aria-hidden="true"
                  />
                  <h3 className="mb-3 text-xl font-extrabold text-brand-ink sm:text-2xl">
                    {card.title}
                  </h3>
                  <p className="mb-5 line-clamp-5 flex-1 text-sm leading-8 text-text-muted">
                    {card.body}
                  </p>
                  <span className="inline-flex w-fit rounded-full bg-brand-lime/15 px-3 py-1.5 text-xs font-bold text-brand-moss">
                    {card.tag}
                  </span>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-8">
          <Link
            to="/about"
            className="inline-flex cursor-pointer text-sm font-bold text-brand-ink transition-colors hover:text-brand-lime"
          >
            {t(UI.learnMoreAbout, locale)} →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
