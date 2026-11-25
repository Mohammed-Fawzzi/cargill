import React from "react";
import { IoLogoWhatsapp } from "react-icons/io5";
import { useSiteData } from "@/context/SiteDataContext";
import { useLocale } from "@/context/LocaleContext";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function FloatingCta() {
  const { contact } = useSiteData();
  const { locale } = useLocale();
  const phone = contact?.phones?.[0] || "";
  const waHref = toWhatsAppHref(phone, t(UI.askAgronomistMessage, locale));

  if (!waHref) return null;

  return (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(UI.whatsapp, locale)}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] left-[max(1rem,env(safe-area-inset-left,0px))] z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-lime text-brand-navy transition-transform hover:scale-[1.04] hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:h-12 sm:w-12"
    >
      <IoLogoWhatsapp className="text-xl" aria-hidden="true" />
    </a>
  );
}
