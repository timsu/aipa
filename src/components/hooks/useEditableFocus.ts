import { useEffect, useState } from "react";

// I think this is the only way to detect when a child of the contenteditable loses focus
// has-focused is supplied by @tiptap/extension-focus
export default function useEditableFocus(div: HTMLElement | null) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!div) return;
    return onFocusListener(div, setFocused);
  }, [div]);

  return focused;
}

export function onFocusListener(div: HTMLElement, setFocused: (focused: boolean) => void) {
  const parent = div.closest("[data-content-type]");
  if (!parent) {
    console.log("useEditableFocus could not find focusable parent", div);
    return;
  }
  console.log("useEditableFocus found focusable parent", parent);

  let hasFocus = false;
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.attributeName != "class") return;
      console.log("mutato", (mutation.target as HTMLElement).className);
      if ((mutation.target as HTMLElement).className.includes("has-focus")) {
        hasFocus = true;
        setFocused(true);
      } else if (hasFocus) {
        hasFocus = false;
        setFocused(false);
      }
    });
  });

  observer.observe(parent, { attributes: true, subtree: true });

  return () => observer.disconnect();
}
