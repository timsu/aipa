import QuestionField from "@/components/questions/QuestionField";
import { editorStore } from "@/stores/editorStore";
import { fillFormStore } from "@/stores/fillFormStore";
import { useStore } from "@nanostores/react";
import { mergeAttributes, Node } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewProps,
  NodeViewWrapper,
  getNodeType,
  getSplittedAttributes,
  CommandProps,
  KeyboardShortcutCommand,
} from "@tiptap/react";
import { ComposeComponent } from "./ComposeComponent";
import { classNames } from "@/lib/utils";
import { questionMeta, QuestionType } from "@/types";
import { editFormStore } from "@/stores/editFormStore";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

import { Fragment, Node as ProseMirrorNode, NodeType, Slice } from "@tiptap/pm/model";
import { canSplit } from "@tiptap/pm/transform";
import { TextSelection } from "@tiptap/pm/state";

interface Options {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    choiceList: {
      /**
       * Comments will be added to the autocomplete.
       */
      insertChoiceList: () => ReturnType;
    };
  }
}

const optionName = "choiceOption";

export const ChoiceList = Node.create<Options>({
  name: "choiceList",

  group: "block list",

  content: optionName + "+",

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
      Enter: exitChoiceList(this.name),
    };
  },

  addCommands() {
    return {
      insertChoiceList:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.type.name,
            content: [{ type: optionName }],
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
  const { node, updateAttributes } = props;
  const questionId = node.attrs.id;
  const readonly = useStore(editorStore.readonly);
  let question = useStore(readonly ? fillFormStore.questions : editFormStore.questions)[questionId];

  if (!readonly) {
    const onFocusOut = async () => {
      if (!question) {
        question = await editFormStore.addQuestion({
          type: QuestionType.CHECKBOXES,
        });
        updateAttributes({ id: question.id });
      }

      setTimeout(() => {
        const content = node.toJSON();
        console.log("focus out", content, node.childCount);
        editFormStore.saveQuestion(content);
      }, 0);
    };
    const freeText = questionMeta(question).freeText;
    return (
      <ComposeComponent
        initialType={QuestionType.CHECKBOXES}
        className={"my-2 w-80"}
        onFocusOut={onFocusOut}
        {...props}
      >
        {freeText && (
          <div
            contentEditable={false}
            className={"p-2 border rounded-md bg-gray-100 text-gray-500 mb-2 flex items-center"}
          >
            {freeText}
          </div>
        )}
      </ComposeComponent>
    );
  }
  if (!question) return null;

  return (
    <NodeViewWrapper className="">
      <QuestionField question={question} />
    </NodeViewWrapper>
  );
}

const exitChoiceList =
  (typeOrName: string): KeyboardShortcutCommand =>
  ({ editor }): boolean => {
    const { state } = editor;

    const type = getNodeType(typeOrName, state.schema);
    const { $from, $to } = state.selection;

    // @ts-ignore
    // eslint-disable-next-line
    const node: ProseMirrorNode = state.selection.node;

    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
      return false;
    }

    const grandParent = $from.node(-1);

    if (grandParent.type !== type) {
      return false;
    }

    if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
      // In an empty block, time to leave
      if (
        $from.depth === 2 ||
        $from.node(-3).type !== type ||
        $from.index(-2) !== $from.node(-2).childCount - 1
      ) {
        editor.chain().deleteCurrentNode().run();
        return true;
      }
    }

    return false;
  };
