import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCta from "./FloatingCta";
import BackToTop from "./BackToTop";
import TickerBar from "@/components/layout/TickerBar";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PageTransition from "@/components/layout/PageTransition";
import LenisProvider from "@/components/layout/LenisProvider";
import { SiteDataProvider } from "@/context/SiteDataContext";

export default function Layout() {
  return (
    <SiteDataProvider>
      <LenisProvider>
        <div className="App">
          <ScrollToTop />
          <ScrollProgress />
          <div className="fixed inset-x-0 top-0 z-50">
            <TickerBar />
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
