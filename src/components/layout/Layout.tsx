import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import Footer from "./Footer";
import Header from "./Header";

import type { ReactNode } from "react";
import { Tooltip } from "react-tooltip";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full">
      <Header />
      <main>{children}</main>
      <Footer />
      <ToastContainer />
      <Tooltip id="tooltip" />
    </div>
  );
}
