import { ComposeComponent } from "@/components/editor/ComposeComponent";
import QuestionAttributes from "@/components/questions/QuestionAttributes";
import QuestionField from "@/components/questions/QuestionField";
import { editFormStore } from "@/stores/editFormStore";
import { editorStore } from "@/stores/editorStore";
import { fillFormStore } from "@/stores/fillFormStore";
import { QuestionType } from "@/types";
import { useStore } from "@nanostores/react";
import { mergeAttributes, Node } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewProps,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import { useEffect, useRef } from "react";

interface Options {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    signature: {
      /**
       * Comments will be added to the autocomplete.
       */
      insertSignature: () => ReturnType;
    };
  }
}

export const Signature = Node.create<Options>({
  name: "signature",

  group: "block",

  content: "inline*",

  draggable: true,

  addAttributes() {
    return {
      id: {
        default: undefined,
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => ({
          "data-id": attributes.id || "",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
        priority: 51,
      },
    ];
  },

  addCommands() {
    return {
      insertSignature:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.type.name,
            content: [
              {
                type: "text",
                text: "Sign Here",
              },
            ],
          });
        },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});

function Component(props: NodeViewProps) {
  const { node } = props;
  const questionId = node.attrs.id;
  const readonly = useStore(editorStore.readonly);
  const question = useStore(fillFormStore.questions)[questionId];

  if (!readonly) {
    const onFocusOut = async (contentElement: HTMLDivElement) => {
      const content = node.toJSON();
      editFormStore.saveQuestion(content);
    };

    return (
      <ComposeComponent
        initialType={QuestionType.SIGNATURE}
        className="border-b pt-8 text-gray-500 my-2"
        onFocusOut={onFocusOut}
        {...props}
      />
    );
  }
  if (!question) return null;

  return (
    <NodeViewWrapper className="">
      <QuestionField question={question} />
    </NodeViewWrapper>
  );
}
