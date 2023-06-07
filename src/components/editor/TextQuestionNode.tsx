import QuestionField from "@/components/questions/QuestionField";
import { editorStore } from "@/stores/editorStore";
import { fillFormStore } from "@/stores/fillFormStore";
import { useStore } from "@nanostores/react";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ComposeComponent } from "./ComposeComponent";
import { classNames } from "@/lib/utils";
import { QuestionType } from "@/types";
import { editFormStore } from "@/stores/editFormStore";

interface Options {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textQuestion: {
      /**
       * Comments will be added to the autocomplete.
       */
      insertTextQuestion: () => ReturnType;
    };
  }
}

export const TextQuestion = Node.create<Options>({
  name: "textQuestion",

  group: "block",

  content: "inline*",

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

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        return this.editor.chain().insertContent({ type: this.type.name }).focus().run();
      },
    };
  },

  addCommands() {
    return {
      insertTextQuestion:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.type.name,
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
  const question = useStore(readonly ? fillFormStore.questions : editFormStore.questions)[
    questionId
  ];

  if (!readonly) {
    const onFocusOut = async (contentElement: HTMLDivElement) => {
      const content = node.toJSON();
      editFormStore.saveQuestion(content);
    };

    return (
      <ComposeComponent
        initialType={QuestionType.SHORT_ANSWER}
        className={classNames(
          "rounded-md p-2 text-gray-500 border my-2 w-full",
          question?.type == QuestionType.LONG_ANSWER ? "min-h-[5rem]" : "min-h-[2.3rem]"
        )}
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
