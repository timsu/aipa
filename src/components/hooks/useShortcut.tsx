import { useEffect } from "react";

// use memo on callback to prevent rerendering
export default function useShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  withMeta = true
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((!withMeta || e.metaKey || e.ctrlKey) && keys.includes(e.key)) {
        e.preventDefault();
        callback(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback, withMeta]);
}

const isMac = typeof window !== "undefined" && window.navigator.platform.match("Mac");

/* WARNING! this is not available with SSR. If you get errors, put it in a useEffect */
export const ctrlOrMeta = isMac ? "⌘+" : "Ctrl+";
