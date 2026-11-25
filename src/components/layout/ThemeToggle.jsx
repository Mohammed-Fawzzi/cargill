import React from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 ${className}`}
      aria-label={
        isDark ? t(UI.themeLight, locale) : t(UI.themeDark, locale)
      }
    >
      {isDark ? (
        <IoSunnyOutline className="text-lg" aria-hidden="true" />
      ) : (
        <IoMoonOutline className="text-lg" aria-hidden="true" />
      )}
    </button>
  );
}
