import { useState } from "react";
import {
  Node,
  NodeViewContent,
  NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
} from "@tiptap/react";
import { editorStore } from "@/stores/editorStore";
import { useStore } from "@nanostores/react";

const values = {
  warning: {
    icon: "⚠️",
    backgroundColor: "#fbf3db",
  },
  info: {
    icon: "ℹ️",
    backgroundColor: "#ddebf1",
  },
  success: {
    icon: "✅",
    backgroundColor: "#ddedea",
  },
  error: {
    icon: "❌",
    backgroundColor: "#fbe4e4",
  },
} as const;

const valueList = Object.keys(values) as (keyof typeof values)[];

function CalloutComponent(props: NodeViewProps) {
  const storedType = props.node.attrs.value;
  const [type, setType] = useState<keyof typeof values>(storedType || "warning");
  const value = values[type];

  const switchType = () => {
    const index = valueList.indexOf(type);
    const nextIndex = (index + 1) % valueList.length;
    setType(valueList[nextIndex]);
    props.updateAttributes({
      value: valueList[nextIndex],
    });
  };

  const readonly = useStore(editorStore.readonly);

  return (
    <NodeViewWrapper className="rounded-md p-4 flex" style={{ background: value.backgroundColor }}>
      {readonly ? (
        <div className="mr-4" contentEditable={false}>
          {value.icon}
        </div>
      ) : (
        <div
          className="mr-4 cursor-pointer"
          contentEditable={false}
          onClick={switchType}
          data-tooltip-content="Switch callout type"
          data-tooltip-id="tooltip"
        >
          {value.icon}
        </div>
      )}

      <NodeViewContent className="" />
    </NodeViewWrapper>
  );
}

// --- extension

interface Options {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Comments will be added to the autocomplete.
       */
      insertCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create<Options>({
  name: "callout",

  group: "block",

  content: "inline*",

  addAttributes() {
    return {
      value: {
        default: "warning",
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute("data-value"),
        renderHTML: (attributes) => ({
          "data-value": attributes.id || "",
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
      insertCallout:
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
    return ReactNodeViewRenderer(CalloutComponent);
  },
});
