import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import AccentHeading from "@/components/ui/AccentHeading";
import MonoLabel from "@/components/ui/MonoLabel";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function StoryCard({ item, index, locale, reducedMotion }) {
  const title = t(item.title, locale) || t(item.name, locale);
  const crop = t(item.crop, locale);
  const problem = t(item.problem, locale);
  const program = t(item.program, locale);
  const result = t(item.result, locale);
  const href = item.href || item.link || (item.productId ? `/products/${item.productId}` : "");
  const products = Array.isArray(item.products) ? item.products : [];

  if (!title && !problem && !result) return null;

  return (
    <motion.article
      className="grid grid-cols-1 overflow-hidden border border-line/12 bg-surface md:grid-cols-12"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeOut }}
    >
      <div className="relative aspect-[4/3] bg-brand-navy md:col-span-5 md:aspect-auto md:min-h-[280px]">
        {item.imageUrl ? (
          <SafeImage
            src={item.imageUrl}
            alt={title}
            width={800}
            className="cinema-grade absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-brand-navy/35 mix-blend-multiply" />
      </div>

      <div className="flex flex-col justify-center p-6 md:col-span-7 md:p-8 lg:p-10">
        <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-brand-lime">
          № {String(index + 1).padStart(2, "0")}
          {crop ? ` — ${crop}` : ""}
        </p>
        {title ? (
          <h3 className="mb-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {title}
          </h3>
        ) : null}

        <dl className="space-y-3 text-sm leading-7">
          {problem ? (
            <div>
              <dt className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-lime">
                {t(UI.caseProblem, locale)}
              </dt>
              <dd className="text-ink/70">{problem}</dd>
            </div>
          ) : null}
          {program ? (
            <div>
              <dt className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-lime">
                {t(UI.caseProgram, locale)}
              </dt>
              <dd className="text-ink/70">{program}</dd>
            </div>
          ) : null}
          {result ? (
            <div>
              <dt className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-lime">
                {t(UI.caseResult, locale)}
              </dt>
              <dd className="text-ink/70">{result}</dd>
            </div>
          ) : null}
        </dl>

        {products.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {products.map((product) => {
              const label = t(product?.name, locale) || product?.label || product;
              if (!label) return null;
              return (
                <span
                  key={String(label)}
                  className="border border-line/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-ink/65"
                >
                  {label}
                </span>
              );
            })}
          </div>
        ) : null}

        {href ? (
          <Link
            to={href}
            className="mt-6 inline-flex w-fit items-center gap-2 border-b border-brand-lime pb-0.5 text-sm font-bold text-ink transition-colors hover:text-brand-lime"
          >
            <span>{t(UI.readTheStory, locale)}</span>
            <span aria-hidden="true">←</span>
          </Link>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function FieldStories({ items: itemsProp, section } = {}) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const items = (itemsProp || section?.items || []).filter(Boolean);

  if (!items.length) return null;

  const heading =
    t(section?.data?.title, locale) || t(UI.fieldStoriesTitle, locale);

  return (
    <section className="relative overflow-hidden bg-surface py-[4.5rem] lg:py-[7rem]">
      <AmbientGlow tone="navy" className="-start-20 bottom-0 h-80 w-80" />
      <div className="relative container mx-auto px-4 lg:px-8">
        <MonoLabel index={5} className="mb-4 text-brand-lime/80">
          FIELD CASES
        </MonoLabel>
        <AccentHeading
          text={heading}
          className="text-clip-safe mb-10 max-w-4xl text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.1] tracking-tight text-ink sm:mb-14"
        />
        <div className="space-y-5">
          {items.map((item, index) => (
            <StoryCard
              key={item.id || index}
              item={item}
              index={index}
              locale={locale}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
