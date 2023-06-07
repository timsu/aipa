import { mergeAttributes, Node } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewProps,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import { useEffect } from "react";

interface Options {
  HTMLAttributes: Record<string, any>;
}

export const ChoiceOption = Node.create<Options>({
  name: "choiceOption",

  content: "inline*",

  defining: true,

  addAttributes() {
    return {
      index: {
        default: undefined,
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute("data-index"),
        renderHTML: (attributes) => ({
          "data-index": attributes.id || "",
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

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});

function Component(props: NodeViewProps) {
  const { editor, node, getPos, updateAttributes } = props;
  const index = node.attrs.index || "";

  useEffect(() => {
    let pos = getPos();
    if (!pos || isNaN(pos)) return;

    const { state } = editor;
    // get parent
    const resolved = state.doc.resolve(pos);
    const parent = resolved.parent;
    if (!parent) return;
    const offset = resolved.parentOffset;
    const actualIndex = parent.childAfter(offset).index;
    if (index !== actualIndex) {
      setTimeout(() => updateAttributes({ index: actualIndex.toString() }), 0);
    }
  }, [index, editor, getPos, updateAttributes]);

  const indexLabel = String.fromCharCode(65 + parseInt(index || 0));

  return (
    <NodeViewWrapper className={"p-2 border rounded-md bg-gray-100 mb-2 flex items-center"}>
      <div
        contentEditable={false}
        className="bg-gray-200 px-2 rounded-md mr-4 font-bold text-gray-500 "
      >
        {indexLabel}
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}
