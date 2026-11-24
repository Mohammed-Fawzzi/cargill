import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function PageTransition() {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      className="flex min-h-0 flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <Outlet />
    </motion.div>
  );
}
