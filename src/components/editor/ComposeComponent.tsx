import QuestionAttributes from "@/components/questions/QuestionAttributes";
import { classNames } from "@/lib/utils";
import { editFormStore } from "@/stores/editFormStore";
import { QuestionType } from "@/types";
import { useStore } from "@nanostores/react";
import { NodeViewProps, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";

type Props = {
  initialType: QuestionType;
  className: string;
  onFocusOut?: (contentElement: HTMLDivElement) => void;
} & NodeViewProps;

export function ComposeComponent(props: PropsWithChildren<Props>) {
  const { initialType, className, node, updateAttributes, children, onFocusOut } = props;
  const questionId = node.attrs.id;
  const ref = useRef<HTMLDivElement>(null);
  const question = useStore(editFormStore.questions)[questionId];

  useEffect(() => {
    if (!questionId) {
      editFormStore
        .addQuestion({
          type: initialType,
        })
        .then((question) => {
          updateAttributes({
            id: question.id,
          });
        });
    }
  }, [initialType, questionId, updateAttributes]);

  useEffect(() => {
    const div = ref.current;
    if (!div) return;
    const parentElement = div.closest(".react-renderer") || div.parentElement?.parentElement;

    let hasFocus = true;
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach((mutation) => {
        if (mutation.attributeName != "class") return;
        if ((mutation.target as HTMLElement).className.includes("has-focus")) {
          hasFocus = true;
          editFormStore.selectedQuestionId.set(question?.id);
        } else if (hasFocus) {
          hasFocus = false;
          const contentElement = div.children[0] as HTMLParagraphElement;
          onFocusOut?.(contentElement);
        }
      });
    });

    if (!parentElement) return;
    observer.observe(parentElement, { attributes: true, subtree: true });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  return (
    <NodeViewWrapper className={classNames("question", className)}>
      <div ref={ref}>
        <NodeViewContent />
      </div>
      {children}

      {question && <QuestionAttributes question={question} divRef={ref} />}
    </NodeViewWrapper>
  );
}
