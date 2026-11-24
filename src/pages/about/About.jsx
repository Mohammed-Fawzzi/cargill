import React, { createElement, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import SiteLogo from "@/components/ui/SiteLogo";
import MagneticButton from "@/components/ui/MagneticButton";
import ImpactStrip from "@/components/home/ImpactStrip";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getProducts } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";

export default function About() {
  const { locale } = useLocale();
  const { contact, isPending, isError } = useSiteData();

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const name = t(contact?.companyName, locale);
  const aboutHeading = t(contact?.aboutHeading, locale);
  const about = t(contact?.about, locale);
  const vision = t(contact?.vision, locale);
  const mission = t(contact?.mission, locale);
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);

  const heroImage = useMemo(() => {
    if (contact?.bannerUrl) return contact.bannerUrl;
    const products = productsQuery.data || [];
    return products.find((item) => item.imageUrl)?.imageUrl || "";
  }, [contact?.bannerUrl, productsQuery.data]);

  const bannerTitle = aboutHeading || name || t(UI.nav.about, locale);
  const bannerSubtitle = t(UI.aboutIntro, locale);

  const hasContent = Boolean(
    name ||
      aboutHeading ||
      about ||
      vision ||
      mission ||
      contact?.logoUrl ||
      address ||
      phones.length ||
      emails.length,
  );

  return (
    <>
      <Seo title={bannerTitle} description={about || vision || mission} path="/about" />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState /> : null}
      {!isPending && !isError ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={bannerTitle}
            subtitle={bannerSubtitle}
            imageUrl={heroImage}
            variant="editorial"
            eyebrow={t(UI.nav.about, locale)}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              {(about || contact?.logoUrl || name) && (
                <section className="relative overflow-hidden py-16 lg:py-24">
                  <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                      <Reveal>
                        <div className="relative overflow-hidden rounded-[2rem] bg-brand-forest-deep p-8 text-white shadow-[0_24px_60px_rgba(24,16,96,0.18)] sm:p-10">
                          <div className="relative">
                            <div className="mb-8 inline-flex rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(24,16,96,0.08)]">
                              <SiteLogo
                                alt={name || bannerTitle}
                                className="h-20 w-auto max-w-full object-contain sm:h-24"
                              />
                            </div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-lime">
                              {t(UI.whoWeAre, locale)}
                            </p>
                            {name ? (
                              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                                {name}
                              </h2>
                            ) : null}
                          </div>
                        </div>
                      </Reveal>

                      <Reveal delay={0.08}>
                        {aboutHeading && aboutHeading !== name ? (
                          <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
                            {aboutHeading}
                          </h2>
                        ) : null}
                        {about ? (
                          <p className="whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg sm:leading-10">
                            {about}
                          </p>
                        ) : null}
                        <MagneticButton className="mt-8 inline-flex">
                          <Link
                            to="/contact"
                            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md bg-brand-forest-deep px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
                          >
                            {t(UI.contactUsCta, locale)}
                          </Link>
                        </MagneticButton>
                      </Reveal>
                    </div>
                  </div>
                </section>
              )}

              {(vision || mission) && (
                <section className="relative overflow-hidden bg-surface-muted py-16 lg:py-20">
                  <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
                      {vision ? (
                        <Reveal>
                          <article className="h-full rounded-[1.75rem] border border-brand-ink/8 bg-white p-7 sm:p-8">
                            <h2 className="mb-4 text-2xl font-extrabold text-brand-ink sm:text-3xl">
                              {t(UI.ourVision, locale)}
                            </h2>
                            <p className="whitespace-pre-wrap text-sm leading-8 text-text-muted sm:text-base sm:leading-9">
                              {vision}
                            </p>
                          </article>
                        </Reveal>
                      ) : null}
                      {mission ? (
                        <Reveal delay={0.06}>
                          <article className="h-full rounded-[1.75rem] border border-brand-ink/8 bg-white p-7 sm:p-8">
                            <h2 className="mb-4 text-2xl font-extrabold text-brand-ink sm:text-3xl">
                              {t(UI.ourMission, locale)}
                            </h2>
                            <p className="whitespace-pre-wrap text-sm leading-8 text-text-muted sm:text-base sm:leading-9">
                              {mission}
                            </p>
                          </article>
                        </Reveal>
                      ) : null}
                    </div>
                  </div>
                </section>
              )}

              <ImpactStrip title={aboutHeading || name} eyebrow={t(UI.cultivateEvolve, locale)} />

              {address || phones.length || emails.length || socials.length ? (
                <section className="border-t border-black/5 bg-white py-14 lg:py-16">
                  <div className="container mx-auto px-4 lg:px-8">
                    <Reveal className="mb-8">
                      <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                        {t(UI.contactInfo, locale)}
                      </h2>
                    </Reveal>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {address ? (
                        <Reveal>
                          <div className="h-full rounded-2xl border border-black/5 bg-surface-muted p-6 transition-shadow hover:shadow-[0_16px_40px_rgba(24,16,96,0.08)]">
                            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                              <MdLocationOn className="text-xl" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 font-extrabold text-brand-ink">
                              {t(UI.address, locale)}
                            </h3>
                            <p className="text-sm leading-7 text-text-muted">{address}</p>
                          </div>
                        </Reveal>
                      ) : null}

                      {phones.length ? (
                        <Reveal delay={0.05}>
                          <div className="h-full rounded-2xl border border-black/5 bg-surface-muted p-6 transition-shadow hover:shadow-[0_16px_40px_rgba(24,16,96,0.08)]">
                            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                              <FaMobile className="text-lg" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 font-extrabold text-brand-ink">
                              {t(UI.phone, locale)}
                            </h3>
                            <ul className="space-y-1 text-sm leading-7 text-text-muted">
                              {phones.map((phone) => (
                                <li key={phone}>
                                  <a
                                    href={`tel:${phone.replace(/\s+/g, "")}`}
                                    dir="ltr"
                                    className="cursor-pointer transition-colors hover:text-brand-lime"
                                  >
                                    {phone}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Reveal>
                      ) : null}

                      {emails.length ? (
                        <Reveal delay={0.1}>
                          <div className="h-full rounded-2xl border border-black/5 bg-surface-muted p-6 transition-shadow hover:shadow-[0_16px_40px_rgba(24,16,96,0.08)]">
                            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                              <MdEmail className="text-xl" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 font-extrabold text-brand-ink">
                              {t(UI.email, locale)}
                            </h3>
                            <ul className="space-y-1 text-sm leading-7 text-text-muted">
                              {emails.map((email) => (
                                <li key={email}>
                                  <a
                                    href={`mailto:${email}`}
                                    className="cursor-pointer transition-colors hover:text-brand-lime"
                                  >
                                    {email}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Reveal>
                      ) : null}
                    </div>

                    {socials.length ? (
                      <Reveal delay={0.12} className="mt-8 flex flex-wrap gap-3">
                        {socials.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={item.label}
                            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-brand-forest-deep text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
                          >
                            {createElement(item.Icon, {
                              className: "text-base",
                              "aria-hidden": true,
                            })}
                          </a>
                        ))}
                      </Reveal>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </main>
      ) : null}
    </>
  );
}
