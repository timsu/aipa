import { useEffect } from "react";

const isMac = typeof window !== "undefined" && window.navigator.platform.match("Mac");

// use memo on callback to prevent rerendering
export default function useShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  withMeta = true
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((!withMeta || (isMac && e.metaKey) || (!isMac && e.ctrlKey)) && keys.includes(e.key)) {
        e.preventDefault();
        callback(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback, withMeta]);
}

/* WARNING! this is not available with SSR. If you get errors, put it in a useEffect */
export const ctrlOrMeta = isMac ? "⌘+" : "Ctrl+";
