import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

function splitLead(text) {
  const value = String(text || "").trim();
  if (!value) return { lead: "", rest: "" };
  const match = value.match(/^([\s\S]+?[.!?؟。])\s+([\s\S]*)$/);
  if (!match) return { lead: value, rest: "" };
  return { lead: match[1], rest: match[2] };
}

function SectionLabel({ number, label }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <p className="text-clip-safe shrink-0 text-[11px] font-bold tracking-[0.18em] text-brand-ink">
        {label}
      </p>
      <span className="h-px flex-1 bg-brand-ink/15" aria-hidden="true" />
      <p className="shrink-0 text-[11px] font-bold tracking-[0.2em] text-brand-ink/45">
        {number}
      </p>
    </div>
  );
}

export default function About() {
  const { locale } = useLocale();
  const { contact, isPending, isError } = useSiteData();

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const name = t(contact?.companyName, locale);
  const aboutHeading = t(contact?.aboutHeading, locale);
  const about = t(contact?.about, locale);
  const vision = t(contact?.vision, locale);
  const mission = t(contact?.mission, locale);
  const categories = categoriesQuery.data || [];
  const { lead, rest } = splitLead(about);

  const bannerTitle =
    aboutHeading || t(UI.aboutPageTitle, locale) || name || t(UI.nav.about, locale);

  const pillars = useMemo(
    () =>
      [
        {
          title: t(UI.valuesTagField, locale),
          body: t(UI.commitField, locale),
        },
        {
          title: t(UI.valuesTagVision, locale),
          body: t(UI.commitQuality, locale),
        },
        {
          title: t(UI.valuesTagMission, locale),
          body: t(UI.commitSupport, locale),
        },
      ].filter((item) => item.title && item.body),
    [locale],
  );

  const hasContent = Boolean(about || vision || mission || categories.length);

  return (
    <>
      <Seo
        title={bannerTitle}
        description={about || vision || mission}
        path="/about"
      />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState /> : null}
      {!isPending && !isError ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={bannerTitle}
            subtitle={t(UI.aboutIntro, locale)}
            imageUrl={contact?.bannerUrl || ""}
            label={UI.pageLabel.about}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.about, locale) },
            ]}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              {about ? (
                <section className="py-14 lg:py-20">
                  <div className="container mx-auto px-4 lg:px-8">
                    <Reveal>
                      <SectionLabel
                        number="01"
                        label={t(UI.whoWeAre, locale)}
                      />
                      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-7">
                          {lead ? (
                            <p className="mb-5 text-[1.35rem] font-extrabold leading-[1.7] text-brand-ink sm:text-[1.5rem]">
                              {lead}
                            </p>
                          ) : null}
                          {rest ? (
                            <p className="whitespace-pre-wrap text-[1.3125rem] font-medium leading-[1.9] text-brand-ink/85">
                              {rest}
                            </p>
                          ) : null}
                        </div>
                        <div className="lg:col-span-4 lg:col-start-9">
                          <div className="border-t border-brand-lime pt-4">
                            <p className="text-5xl font-extrabold tracking-tight text-brand-ink sm:text-6xl lg:text-7xl">
                              {t(UI.experienceYears, locale)}
                            </p>
                            <p className="mt-3 max-w-[14rem] text-sm leading-6 text-text-muted">
                              {t(UI.experienceBody, locale)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                </section>
              ) : null}

              {(vision || mission) && (
                <section className="border-t border-brand-ink/10 py-14 lg:py-20">
                  <div className="container mx-auto px-4 lg:px-8">
                    {vision ? (
                      <Reveal>
                        <div className="grid grid-cols-1 gap-6 border-b border-brand-ink/15 py-10 lg:grid-cols-12 lg:gap-8 lg:py-12">
                          <div className="lg:col-span-3">
                            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
                              02
                            </p>
                            <h2 className="text-[2.5rem] font-extrabold leading-none tracking-tight text-brand-ink">
                              {t(UI.ourVision, locale)}
                            </h2>
                          </div>
                          <div className="lg:col-span-9">
                            <p className="whitespace-pre-wrap text-[1.5rem] font-semibold leading-[1.7] text-brand-ink sm:text-[1.625rem]">
                              {vision}
                            </p>
                          </div>
                        </div>
                      </Reveal>
                    ) : null}
                    {mission ? (
                      <Reveal delay={0.05}>
                        <div className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-12 lg:gap-8 lg:py-12">
                          <div className="lg:col-span-3">
                            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
                              03
                            </p>
                            <h2 className="text-[2.5rem] font-extrabold leading-none tracking-tight text-brand-ink">
                              {t(UI.ourMission, locale)}
                            </h2>
                          </div>
                          <div className="lg:col-span-9">
                            <p className="whitespace-pre-wrap text-[1.5rem] font-semibold leading-[1.7] text-brand-ink sm:text-[1.625rem]">
                              {mission}
                            </p>
                          </div>
                        </div>
                      </Reveal>
                    ) : null}
                  </div>
                </section>
              )}

              {pillars.length === 3 ? (
                <section className="border-t border-brand-ink/10 py-14 lg:py-20">
                  <div className="container mx-auto px-4 lg:px-8">
                    <Reveal>
                      <SectionLabel
                        number="04"
                        label={t(UI.howWeWork, locale)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        {pillars.map((item, index) => (
                          <div
                            key={item.title}
                            className={`py-6 md:px-6 md:py-2 ${
                              index > 0
                                ? "border-t border-brand-ink/15 md:border-t-0 md:border-s"
                                : ""
                            }`}
                          >
                            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
                              {String(index + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mb-3 text-xl font-extrabold text-brand-ink">
                              {item.title}
                            </h3>
                            <p className="text-sm leading-7 text-text-muted">
                              {item.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Reveal>
                  </div>
                </section>
              ) : null}

              {categories.length > 0 ? (
                <section className="border-t border-brand-ink/10 py-14 lg:py-20">
                  <div className="container mx-auto px-4 lg:px-8">
                    <Reveal>
                      <SectionLabel
                        number="05"
                        label={t(UI.whatWeOffer, locale)}
                      />
                      <div className="flex flex-col gap-0 border-t border-brand-ink/15 sm:flex-row sm:flex-wrap">
                        {categories.map((item, index) => (
                          <Link
                            key={item.id}
                            to={`/products?section=${item.id}`}
                            className={`group flex flex-1 items-center justify-between gap-4 border-b border-brand-ink/15 py-6 sm:border-b-0 sm:border-e sm:px-5 sm:py-8 sm:last:border-e-0 ${
                              index === 0 ? "sm:ps-0" : ""
                            }`}
                          >
                            <span className="flex min-w-0 flex-col gap-2">
                              <span className="text-[11px] font-bold tracking-[0.18em] text-brand-lime">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="text-2xl font-extrabold tracking-tight text-brand-ink transition-colors group-hover:text-brand-lime sm:text-3xl">
                                {t(item.name, locale)}
                              </span>
                            </span>
                            <span
                              className="shrink-0 text-brand-ink transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </Reveal>
                  </div>
                </section>
              ) : null}

              <GrowTogetherBanner />
            </>
          )}
        </main>
      ) : null}
    </>
  );
}
