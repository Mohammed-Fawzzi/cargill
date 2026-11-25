import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_BG = "#0A0820";

export default function ScrollBackground() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    if (isHome) return undefined;
    const app = document.querySelector(".App");
    if (!app) return undefined;
    app.style.setProperty("--page-bg", DEFAULT_BG);
    app.style.setProperty("--page-bg-transition", "none");
    document.documentElement.style.setProperty("--site-scroll-bg", DEFAULT_BG);
    return undefined;
  }, [isHome, pathname]);

  return null;
}
