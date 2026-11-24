import React from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

const MEDIA_TAGS = [UI.mediaTagField, UI.mediaTagUpdate, UI.mediaTagInsight];

export default function MediaStrip({ items = [] }) {
  const { locale } = useLocale();
  const rows = items.slice(0, 4);
  if (!rows.length) return null;

  return (
    <section className="relative overflow-hidden border-y border-brand-ink/5 bg-white py-14 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-brand-ink sm:text-3xl">
            {t(UI.mediaReleases, locale)}
          </h2>
          <MagneticButton>
            <Link
              to="/articles"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-brand-ink/15 px-5 text-sm font-bold text-brand-ink transition-all duration-300 hover:border-brand-lime hover:bg-brand-lime"
            >
              {t(UI.allMedia, locale)}
            </Link>
          </MagneticButton>
        </Reveal>

        <div className="divide-y divide-brand-ink/8 border-y border-brand-ink/8">
          {rows.map((item, index) => {
            const title = t(item.title, locale);
            const date = formatMillis(item.createdAt, locale);
            const tag = t(MEDIA_TAGS[index % MEDIA_TAGS.length], locale);
            return (
              <Link
                key={item.id}
                to={`/articles/${item.id}`}
                className="group grid cursor-pointer grid-cols-[5.5rem_1fr] items-center gap-3 py-4 transition-colors hover:bg-surface-muted/70 sm:grid-cols-[6.5rem_1fr_auto] sm:gap-5 sm:px-2 sm:py-5 lg:grid-cols-[7.5rem_6.5rem_8.5rem_1fr_auto]"
              >
                <div className="overflow-hidden rounded-xl bg-surface-muted">
                  {item.imageUrl ? (
                    <SafeImage
                      src={item.imageUrl}
                      alt={title}
                      className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-brand-forest-deep px-2 text-center text-xs font-bold text-brand-lime">
                      {tag}
                    </div>
                  )}
                </div>

                <div className="min-w-0 lg:contents">
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-lime lg:mb-0">
                    {tag}
                  </p>
                  <p className="mb-1 hidden text-sm font-bold text-brand-moss sm:mb-0 lg:block">
                    {date || "—"}
                  </p>
                  <h3 className="text-base font-extrabold leading-7 text-brand-ink transition-colors group-hover:text-brand-lime sm:text-lg">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-brand-moss lg:hidden">
                    {date || "—"}
                  </p>
                </div>

                <span className="col-span-2 text-sm font-bold text-brand-ink transition-all group-hover:text-brand-lime sm:col-span-1 sm:justify-self-end">
                  {t(UI.findOutMore, locale)} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
