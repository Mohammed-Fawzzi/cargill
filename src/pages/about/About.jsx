import React, { createElement, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getProducts } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";

export default function About() {
  const { locale } = useLocale();
  const { contact, footer, isPending, isError } = useSiteData();

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

  const heroImage = useMemo(() => {
    if (footer?.imageUrl) return footer.imageUrl;
    const products = productsQuery.data || [];
    return products.find((item) => item.imageUrl)?.imageUrl || "";
  }, [footer?.imageUrl, productsQuery.data]);

  const hasContent = Boolean(
    name || about || contact?.logoUrl || address || phones.length || emails.length,
  );

  return (
    <>
      <Seo
        title={t(UI.nav.about, locale)}
        description={about}
        path="/about"
      />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState /> : null}
      {!isPending && !isError ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={t(UI.nav.about, locale)}
            subtitle={t(UI.aboutIntro, locale)}
            imageUrl={heroImage}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              <section className="container mx-auto px-4 py-14 lg:px-8 lg:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                  <Reveal>
                    <div className="overflow-hidden rounded-3xl border border-black/5 bg-surface-muted p-8 sm:p-10">
                      {contact?.logoUrl ? (
                        <img
                          src={contact.logoUrl}
                          alt={name || t(UI.nav.about, locale)}
                          className="mb-8 h-24 w-auto max-w-full object-contain sm:h-28"
                        />
                      ) : (
                        <div className="mb-8 inline-flex rounded-2xl bg-brand-forest-deep px-5 py-4 text-lg font-extrabold text-brand-lime">
                          {name || t(UI.nav.about, locale)}
                        </div>
                      )}
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-moss">
                        {t(UI.ourCompany, locale)}
                      </p>
                      {name ? (
                        <h2 className="mt-3 text-3xl font-extrabold leading-tight text-brand-ink sm:text-4xl">
                          {name}
                        </h2>
                      ) : null}
                      {footerTitle && footerTitle !== name ? (
                        <p className="mt-3 text-base font-semibold text-brand-ink/70">
                          {footerTitle}
                        </p>
                      ) : null}
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
                    <Link
                      to="/contact"
                      className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-brand-forest-deep px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-lime hover:text-brand-black"
                    >
                      {t(UI.contactUsCta, locale)}
                    </Link>
                  </Reveal>
                </div>
              </section>

              {address || phones.length || emails.length || socials.length ? (
                <section className="border-t border-black/5 bg-surface-muted py-14 lg:py-16">
                  <div className="container mx-auto px-4 lg:px-8">
                    <Reveal className="mb-8">
                      <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                        {t(UI.contactInfo, locale)}
                      </h2>
                    </Reveal>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {address ? (
                        <Reveal>
                          <div className="h-full rounded-2xl border border-black/5 bg-white p-6">
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
                          <div className="h-full rounded-2xl border border-black/5 bg-white p-6">
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
                          <div className="h-full rounded-2xl border border-black/5 bg-white p-6">
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
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-forest-deep text-white transition-colors hover:bg-brand-lime hover:text-brand-black"
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
