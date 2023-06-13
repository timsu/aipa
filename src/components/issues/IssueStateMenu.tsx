import { classNames } from "@/lib/utils";
import { issueStore } from "@/stores/issueStore";
import { IssueState, stateLabels } from "@/types";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Issue } from "@prisma/client";
import { useState } from "react";
import { usePopper } from "react-popper";

const states = [
  IssueState.DRAFT,
  IssueState.TODO,
  IssueState.BACKLOG,
  IssueState.IN_PROGRESS,
  IssueState.REVIEW,
  IssueState.DONE,
  IssueState.WONT_FIX,
];

export default function IssueStateMenu({
  issue,
  buttonClass,
}: {
  issue: Issue;
  buttonClass: string;
}) {
  const [open, setOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
  });

  const transition = (state: IssueState) => {
    setOpen(false);
    issueStore.transitionIssue(issue, state);
  };

  return (
    <>
      <div ref={setReferenceElement} className={buttonClass} onClick={() => setOpen((o) => !o)}>
        {stateLabels[issue.state]}
      </div>
      {open && (
        <div
          ref={setPopperElement}
          className="overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="px-2 py-2">Transition to:</div>
          {states.map((state) => {
            const selected = issue.state == state;

            return (
              <div
                key={state}
                className={classNames(
                  selected ? "bg-indigo-600 text-white" : "text-gray-900 hover:bg-gray-200",
                  "relative cursor-pointer select-none py-2 pl-8 pr-4"
                )}
                onClick={() => transition(state)}
              >
                <span
                  className={classNames(
                    selected ? "font-semibold" : "font-normal",
                    "block truncate"
                  )}
                >
                  {stateLabels[state]}
                </span>

                {selected ? (
                  <span
                    className={classNames(
                      "text-white, absolute inset-y-0 left-0 flex items-center pl-1.5"
                    )}
                  >
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
