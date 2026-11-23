import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCta from "./FloatingCta";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { SiteDataProvider } from "@/context/SiteDataContext";

export default function Layout() {
  return (
    <SiteDataProvider>
      <div className="App">
        <ScrollToTop />
        <Navbar />
        <Outlet />
        <Footer />
        <FloatingCta />
      </div>
    </SiteDataProvider>
  );
}
