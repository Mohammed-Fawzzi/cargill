import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCta from "./FloatingCta";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PageTransition from "@/components/layout/PageTransition";
import { SiteDataProvider } from "@/context/SiteDataContext";

export default function Layout() {
  return (
    <SiteDataProvider>
      <div className="App pb-24 md:pb-8">
        <ScrollToTop />
        <Navbar />
        <PageTransition />
        <Footer />
        <FloatingCta />
      </div>
    </SiteDataProvider>
  );
}
