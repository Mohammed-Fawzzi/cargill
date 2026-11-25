import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCta from "./FloatingCta";
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
          <Navbar />
          <PageTransition />
          <Footer />
          <FloatingCta />
        </div>
      </LenisProvider>
    </SiteDataProvider>
  );
}
