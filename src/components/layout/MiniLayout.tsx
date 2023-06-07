import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import type { ReactNode } from "react";
import { Tooltip } from "react-tooltip";
import MiniHeader from "@/components/layout/MiniHeader";

export default function MiniLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full">
      <main>{children}</main>
      <ToastContainer />
      <Tooltip id="tooltip" />
    </div>
  );
}
