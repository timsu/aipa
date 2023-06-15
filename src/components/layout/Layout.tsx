import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

import Footer from "./Footer";
import Header from "./Header";

import { useRef, type ReactNode, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useStore } from "@nanostores/react";
import { uiStore } from "@/stores/uiStore";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

export default function Layout({ children }: { children: ReactNode }) {
  const showSidebar = useStore(uiStore.sidebarVisible);
  return (
    <div className="flex w-full h-full relative">
      {showSidebar && (
        <>
          <div
            onClick={() => uiStore.toggleSidebar()}
            className="fixed bg-gray-500/50 h-full w-full z-10 lg:hidden"
          />
          <div className="fixed h-full bg-white w-72 z-20 lg:relative lg:z-0 border-r">
            <Sidebar />
          </div>
        </>
      )}
      <Header />
      <main className="flex-1 overflow-scroll flex">{children}</main>
      <Tooltip id="tooltip" className="hidden sm:block" />
      <ToastContainer />
    </div>
  );
}
