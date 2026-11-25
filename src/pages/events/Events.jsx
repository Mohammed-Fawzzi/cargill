import React, { useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import AccentHeading from "@/components/ui/AccentHeading";
import LogoTriangle from "@/components/ui/LogoTriangle";
import EventAgendaRow from "@/components/events/EventAgendaRow";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvents } from "@/services/cms/events";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { eventDayKey } from "@/lib/time";
import { resolveCompanySocial } from "@/utils/social";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const FILTERS = [
  ["all", UI.allEvents],
  ["upcoming", UI.upcoming],
  ["ended", UI.ended],
];

function sortUpcoming(list) {
  return [...list].sort((a, b) => {
    const byDate = eventDayKey(a.date).localeCompare(eventDayKey(b.date));
    return byDate !== 0 ? byDate : (a.createdAt || 0) - (b.createdAt || 0);
  });
}

function sortPast(list) {
  return [...list].sort((a, b) => {
    const byDate = eventDayKey(b.date).localeCompare(eventDayKey(a.date));
    return byDate !== 0 ? byDate : (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export default function Events() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const sectionQuery = useHomepageSection("events");
  const [params, setParams] = useSearchParams();
  const filter = params.get("status") || "all";

  const eventsQuery = useQuery({
    queryKey: ["cms", "events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 2,
  });

  const events = useMemo(() => eventsQuery.data || [], [eventsQuery.data]);

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([key, value]) => {
        const clear = !value || (key === "status" && value === "all");
        if (clear) next.delete(key);
        else next.set(key, value);
      });
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((item) => item.status === filter);
  }, [events, filter]);

  const upcomingItems = useMemo(
    () => sortUpcoming(filtered.filter((item) => item.status === "upcoming")),
    [filtered],
  );
  const pastItems = useMemo(
    () => sortPast(filtered.filter((item) => item.status === "ended")),
    [filtered],
  );

  const setFilter = (nextFilter) => {
    updateParams({ status: nextFilter });
  };

  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.events, locale),
    fallbackSubtitle: t(UI.eventsIntro, locale),
    fallbackImage: events.find((item) => item.imageUrl)?.imageUrl || "",
  });

  const facebook = resolveCompanySocial(contact?.social).find(
    (item) => item.id === "facebook",
  );

  const emptyMessage =
    filter === "upcoming"
      ? t(UI.noUpcomingEvents, locale)
      : filter === "ended"
        ? t(UI.noPastEvents, locale)
        : t(UI.noEvents, locale);

  const pending = eventsQuery.isPending;
  const error = eventsQuery.isError;
  const showSplit = filter === "all";

  return (
    <>
      <Seo title={hero.title} description={hero.subtitle} path="/events" />
      {pending ? <Loading /> : null}
      {!pending && error ? (
        <ErrorState
          onRetry={() => {
            eventsQuery.refetch();
            sectionQuery.refetch();
          }}
        />
      ) : null}
      {!pending && !error ? (
        <main className="min-h-screen bg-[#0A0820] text-white">
          <header className="mx-auto max-w-[1320px] px-6 pb-14 pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)] md:pb-[56px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+4.5rem)]">
            <div className="flex items-center gap-4 text-[14px] text-white/62">
              <nav aria-label="Breadcrumb" className="shrink-0">
                <ol className="flex flex-wrap items-center gap-x-2">
                  <li>
                    <Link to="/" className="transition-colors hover:text-brand-lime">
                      {t(UI.nav.home, locale)}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>{t(UI.nav.events, locale)}</li>
                </ol>
              </nav>
              <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden py-[0.1em]">
                  <motion.div
                    initial={reducedMotion ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.65, ease: easeOut }}
                  >
                    <AccentHeading
                      as="h1"
                      text={hero.title}
                      className="max-w-full break-words font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-black leading-[1.1] text-white"
                    />
                  </motion.div>
                </div>
                {hero.subtitle ? (
                  <p className="mt-[22px] max-w-[560px] text-[18px] leading-[1.7] text-white/72 md:text-[20px]">
                    {hero.subtitle}
                  </p>
                ) : null}
              </div>
              <div
                className="flex items-center gap-2.5 font-mono text-[13px] tracking-[3px] text-white/70"
                dir="ltr"
              >
                <LogoTriangle className="h-3 w-3.5" />
                {UI.pageLabel.events}
              </div>
            </div>
          </header>

          <div className="border-b border-white/12">
            <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-[30px] gap-y-1 px-6 text-[16px]">
              {FILTERS.map(([key, label]) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`border-b-2 py-4 transition-colors ${
                      active
                        ? "border-brand-lime font-semibold text-white"
                        : "border-transparent font-normal text-white/65 hover:text-white"
                    }`}
                  >
                    {t(label, locale)}
                  </button>
                );
              })}
              <span className="py-4 text-[13px] text-white/55">
                {filtered.length} {t(UI.resultsCount, locale)}
              </span>
            </div>
          </div>

          <section className="mx-auto max-w-[1320px] px-6 pb-[100px] pt-14">
            {filtered.length === 0 ? (
              <div className="space-y-4">
                <EmptyState message={emptyMessage} />
                {filter === "upcoming" && facebook?.url ? (
                  <a
                    href={facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex border-b border-brand-lime pb-0.5 text-white transition-colors hover:text-brand-lime"
                  >
                    {t(UI.followFacebook, locale)}
                  </a>
                ) : null}
              </div>
            ) : showSplit ? (
              <>
                {upcomingItems.map((item) => (
                  <EventAgendaRow key={item.id} item={item} />
                ))}

                <div className="mt-10 flex items-center gap-4 text-[14px] text-white/55">
                  <span>{t(UI.pastEventsLabel, locale)}</span>
                  <span className="h-px flex-1 bg-white/12" aria-hidden="true" />
                </div>

                {pastItems.length > 0 ? (
                  pastItems.map((item) => (
                    <EventAgendaRow key={item.id} item={item} />
                  ))
                ) : (
                  <p className="mt-6 text-[17px] text-white/60">
                    {t(UI.noPastEvents, locale)}
                    {facebook?.url ? (
                      <>
                        {" "}
                        <a
                          href={facebook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-lime"
                        >
                          {t(UI.followFacebook, locale)}
                        </a>
                      </>
                    ) : null}
                  </p>
                )}
              </>
            ) : (
              (filter === "upcoming" ? upcomingItems : pastItems).map((item) => (
                <EventAgendaRow key={item.id} item={item} />
              ))
            )}
          </section>

          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
