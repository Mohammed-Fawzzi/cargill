import React from "react";
import { Link } from "react-router-dom";
import { IoCallOutline, IoLogoWhatsapp } from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function StickyLeadBar() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const phone = contact?.phones?.[0] || "";
  const telHref = toTelHref(phone);
  const waHref = toWhatsAppHref(phone);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 px-3 md:hidden"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-2 rounded-2xl border border-white/10 bg-brand-forest-deep/95 p-2 shadow-[0_16px_40px_rgba(24,16,96,0.35)] backdrop-blur-md">
        {telHref ? (
          <a
            href={telHref}
            aria-label={t(UI.phone, locale)}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
          >
            <IoCallOutline className="text-lg" aria-hidden="true" />
          </a>
        ) : null}
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(UI.whatsapp, locale)}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#25D366] text-white transition-opacity hover:opacity-90"
          >
            <IoLogoWhatsapp className="text-xl" aria-hidden="true" />
          </a>
        ) : null}
        <Link
          to="/contact"
          className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-brand-lime px-4 text-sm font-extrabold text-brand-ink transition-colors hover:bg-brand-lime-hover"
        >
          {t(UI.imInterested, locale)}
        </Link>
      </div>
    </div>
  );
}
