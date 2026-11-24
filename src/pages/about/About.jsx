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
import SafeImage from "@/components/ui/SafeImage";
import ImpactStrip from "@/components/home/ImpactStrip";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getProducts } from "@/services/cms/products";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";

export default function About() {
  const { locale } = useLocale();
  const { contact, footer, isPending, isError } = useSiteData();
  const ctaQuery = useHomepageSection("company_cta");

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const name = t(contact?.companyName, locale);
  const about = t(contact?.about, locale);
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);
  const footerTitle = t(footer?.title, locale);
  const footerBody = t(footer?.body, locale);
  const ctaTitle = t(ctaQuery.data?.title, locale);
  const ctaBody = t(ctaQuery.data?.body, locale);
  const ctaLabel =
    t(ctaQuery.data?.cta?.label, locale) || t(UI.contactUsCta, locale);
  const ctaHref = ctaQuery.data?.cta?.href || "/contact";

  const heroImage = useMemo(() => {
    if (contact?.bannerUrl) return contact.bannerUrl;
    if (ctaQuery.data?.imageUrl) return ctaQuery.data.imageUrl;
    if (footer?.imageUrl) return footer.imageUrl;
    const products = productsQuery.data || [];
    return products.find((item) => item.imageUrl)?.imageUrl || "";
  }, [contact?.bannerUrl, ctaQuery.data?.imageUrl, footer?.imageUrl, productsQuery.data]);

  const bannerTitle = name || footerTitle || t(UI.nav.about, locale);
  const bannerSubtitle = about || footerBody || ctaBody || "";

  const hasContent = Boolean(
    name || about || contact?.logoUrl || address || phones.length || emails.length || footerBody,
  );

  return (
    <>
      <Seo
        title={bannerTitle}
        description={about || footerBody}
        path="/about"
      />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState /> : null}
      {!isPending && !isError ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={bannerTitle}
            subtitle={bannerSubtitle}
            imageUrl={heroImage}
            variant="editorial"
            eyebrow={footerTitle && footerTitle !== bannerTitle ? footerTitle : t(UI.nav.about, locale)}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              <section className="relative overflow-hidden py-16 lg:py-24">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
                    <Reveal>
                      <div className="relative overflow-hidden rounded-[2rem] bg-brand-forest-deep p-8 text-white shadow-[0_24px_60px_rgba(24,16,96,0.18)] sm:p-10">
                        {ctaQuery.data?.imageUrl ? (
                          <SafeImage
                            src={ctaQuery.data.imageUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover opacity-35"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative">
                          <div className="mb-8 inline-flex rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(24,16,96,0.08)]">
                            <SiteLogo
                              alt={name || bannerTitle}
                              className="h-20 w-auto max-w-full object-contain sm:h-24"
                            />
                          </div>
                          {name ? (
                            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                              {name}
                            </h2>
                          ) : null}
                          {footerTitle && footerTitle !== name ? (
                            <p className="mt-3 text-base font-semibold text-brand-lime">
                              {footerTitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Reveal>

                    <Reveal delay={0.08}>
                      {about ? (
                        <p className="whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg sm:leading-10">
                          {about}
                        </p>
                      ) : null}
                      {footerBody && footerBody !== about ? (
                        <p className="mt-6 whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg sm:leading-10">
                          {footerBody}
                        </p>
                      ) : null}
                      <MagneticButton className="mt-8 inline-flex">
                        <Link
                          to={ctaHref}
                          className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-forest-deep px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
                        >
                          {ctaLabel}
                        </Link>
                      </MagneticButton>
                    </Reveal>
                  </div>
                </div>
              </section>

              <ImpactStrip />

              {(ctaTitle || ctaBody) && ctaTitle !== bannerTitle ? (
                <section className="relative overflow-hidden bg-surface-muted py-16 lg:py-20">
                  <div className="container mx-auto px-4 text-center lg:px-8">
                    <Reveal className="mx-auto max-w-3xl">
                      {ctaTitle ? (
                        <h2 className="mb-4 text-3xl font-extrabold text-brand-ink sm:text-4xl">
                          {ctaTitle}
                        </h2>
                      ) : null}
                      {ctaBody ? (
                        <p className="mb-8 text-base leading-8 text-text-muted sm:text-lg">
                          {ctaBody}
                        </p>
                      ) : null}
                      <MagneticButton className="inline-flex">
                        <Link
                          to={ctaHref}
                          className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-lime px-7 py-3 text-sm font-extrabold text-brand-ink transition-all hover:bg-brand-lime-hover"
                        >
                          {ctaLabel}
                        </Link>
                      </MagneticButton>
                    </Reveal>
                  </div>
                </section>
              ) : null}

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
                                    className="transition-colors hover:text-brand-lime"
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
                                    className="transition-colors hover:text-brand-lime"
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
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-forest-deep text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
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
