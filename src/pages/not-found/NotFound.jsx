import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import OrganicFloat from "@/components/ui/OrganicFloat";
import MagneticButton from "@/components/ui/MagneticButton";
import SiteLogo from "@/components/ui/SiteLogo";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function NotFound() {
  const { locale } = useLocale();
  const { contact, footer } = useSiteData();
  const company =
    t(contact?.companyName, locale) || t(footer?.title, locale) || "";
  const body =
    t(footer?.body, locale) || t(UI.notFoundBody, locale);

  return (
    <>
      <Seo title="404" path="/404" noindex />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-forest-deep px-4 pt-navbar text-center">
        <OrganicFloat className="opacity-50 mix-blend-screen" />
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <div className="mb-8 inline-flex rounded-2xl bg-white/95 px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
            <SiteLogo className="h-12 w-auto object-contain" />
          </div>
          {company ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-brand-lime">
              {company}
            </p>
          ) : (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-brand-lime">
              404
            </p>
          )}
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">
            {t(UI.notFoundTitle, locale)}
          </h1>
          <p className="mb-8 max-w-md text-lg text-white/75">{body}</p>
          <MagneticButton className="inline-flex">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-brand-lime px-7 py-3 font-bold text-brand-lime transition-all hover:bg-brand-lime hover:text-brand-ink"
            >
              {t(UI.backHome, locale)}
            </Link>
          </MagneticButton>
        </motion.div>
      </main>
    </>
  );
}
