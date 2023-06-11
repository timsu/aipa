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
  const router = useRouter();
  const lastSidebarPath = useRef("");

  useEffect(() => {
    if (
      showSidebar &&
      document.body.clientWidth < 640 &&
      router.pathname !== lastSidebarPath.current
    ) {
      uiStore.sidebarVisible.set(false);
    }
    lastSidebarPath.current = router.pathname;
  }, [router.pathname, showSidebar]);

  return (
    <div className="flex w-full h-full relative">
      {showSidebar && (
        <div className="hidden md:block fixed bg-white w-56 xl:w-72 z-20 sm:relative sm:z-0 border-r">
          <Sidebar />
        </div>
      )}
      {!showSidebar && (
        <div className="fixed top-24 -left-1 z-10 bg-white p-2 border shadow rounded-tr-md rounded-br-md">
          <ChevronDoubleRightIcon
            className="w-4 h-4 text-gray-500 cursor-pointer"
            onClick={() => uiStore.toggleSidebar()}
          />
        </div>
      )}
      <Header />
      <main className="flex-1 overflow-scroll flex">{children}</main>
      <Tooltip id="tooltip" />
      <ToastContainer />
    </div>
  );
}
