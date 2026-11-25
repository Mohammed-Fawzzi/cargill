import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCta from "./FloatingCta";
import BackToTop from "./BackToTop";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ScrollBackground from "@/components/layout/ScrollBackground";
import PageTransition from "@/components/layout/PageTransition";
import LenisProvider from "@/components/layout/LenisProvider";
import { SiteDataProvider } from "@/context/SiteDataContext";

export default function Layout() {
  return (
    <SiteDataProvider>
      <LenisProvider>
        <div className="App">
          <ScrollBackground />
          <ScrollToTop />
          <ScrollProgress />
          <div className="site-chrome fixed inset-x-0 top-0 z-50">
            <Navbar />
          </div>
          <PageTransition />
          <Footer />
          <FloatingCta />
          <BackToTop />
        </div>
      </LenisProvider>
    </SiteDataProvider>
  );
}
