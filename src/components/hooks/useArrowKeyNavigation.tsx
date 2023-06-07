import { useEffect, useRef } from "react";

type Props = {
  selectors: string;
};

// from https://github.com/dealroom/react-arrow-key-navigation-hook/
// added ts types

/**
 * A react hook to enable arrow key navigation on a component.
 * @param props selectors: a string of selectors to apply to the parent node
 * @returns a useRef, which can be applied to a component
 */
export default function useArrowKeyNavigation<T extends HTMLElement>(props: Props) {
  const { selectors } = props || {};
  const parentNode = useRef<T | null>(null);

  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      handleEvents({ event: event, parentNode: parentNode.current, selectors });
    };
    document.addEventListener("keydown", eventHandler);
    return () => document.removeEventListener("keydown", eventHandler);
  }, [selectors]);

  return parentNode;
}

// --- event handling

function handleEnter({
  event,
  currentIndex,
  activeElement,
}: {
  event: KeyboardEvent;
  currentIndex: number;
  activeElement: HTMLElement;
}) {
  if (currentIndex === -1) return;

  activeElement.click();
  event.preventDefault();
}

function handleArrowKey({
  event,
  currentIndex,
  availableElements,
}: {
  event: KeyboardEvent;
  currentIndex: number;
  availableElements: NodeListOf<HTMLElement>;
}) {
  // If the focus isn't in the container, focus on the first thing
  if (currentIndex === -1) availableElements[0].focus();

  // Move the focus up or down
  let nextElement;
  if (event.key === "ArrowDown") {
    nextElement = availableElements[currentIndex + 1];
  }

  if (event.key === "ArrowUp") {
    nextElement = availableElements[currentIndex - 1];
  }

  nextElement && nextElement.focus();
  event.preventDefault();
}

/**
 * Implement arrow key navigation for the given parentNode
 * @param {object}  options
 * @param {Event}   options.e          Keydown event
 * @param {DOMNode} options.parentNode The parent node to operate on. Arrow keys won't navigate outside of this node
 * @param {String}  options.selectors  Selectors for elements we want to be able to key through
 */
function handleEvents({
  event,
  parentNode,
  selectors = "a,button,input",
}: {
  event: KeyboardEvent;
  parentNode: HTMLElement | null;
  selectors: string;
}) {
  if (!parentNode) return;

  const key = event.key;
  if (!["ArrowUp", "ArrowDown", "Enter"].includes(key)) {
    return;
  }

  const activeElement = document.activeElement as HTMLElement;
  if (!activeElement) return;

  // If we're not inside the container, don't do anything
  if (!parentNode.contains(activeElement)) return;

  // Get the list of elements we're allowed to scroll through
  const availableElements = parentNode.querySelectorAll(selectors) as NodeListOf<HTMLElement>;

  // No elements are available to loop through.
  if (!availableElements.length) return;

  // Which index is currently selected
  const currentIndex = Array.from(availableElements).findIndex(
    (availableElement) => availableElement === activeElement
  );

  if (key === "Enter") {
    handleEnter({ event, currentIndex, activeElement });
  }
  handleArrowKey({ event, currentIndex, availableElements });
}
