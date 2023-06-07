import {
  Node,
  NodeViewContent,
  NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
} from "@tiptap/react";

function SectionComponent(props: NodeViewProps) {
  return (
    <NodeViewWrapper className="text-2xl font-bold py-2 border-b">
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
    section: {
      /**
       * Comments will be added to the autocomplete.
       */
      insertSection: () => ReturnType;
    };
  }
}

export const Section = Node.create<Options>({
  name: "section",

  group: "block",

  content: "inline*",

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
      insertSection:
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
    return ReactNodeViewRenderer(SectionComponent);
  },
});
