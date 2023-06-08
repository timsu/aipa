import { EditorView } from "prosemirror-view";

import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { HorizontalRule } from "@/components/editor/HorizontalRule";
import LinkNode from "@/components/editor/LinkNode";
import { Doc } from "@/components/editor/Doc";
import { Extensions, useEditor } from "@tiptap/react";
import SlashExtension from "@/components/slashmenu/SlashExtension";
import { Callout } from "@/components/editor/Callout";
import { Section } from "@/components/editor/Section";
import { useEffect } from "react";

// Hack to prevent the matchesNode error on hot reloads
EditorView.prototype.updateState = function updateState(state) {
  if (!(this as any).docView) return;
  (this as any).updateStateInner(state, this.state.plugins != state.plugins);
};

// these extensions are shared among the read only & editable editors
export const STATIC_EXTENSIONS: Extensions = [
  StarterKit.configure({
    horizontalRule: false,
  }),
  HorizontalRule,
  LinkNode.configure({
    autolink: false,
    linkOnPaste: true,
  }),
  Callout,
  Section,
];

// hook to initialize the editor
// beware: this hook gets run all the time
let initial: any = null;

export default function useFormEditor(
  initialContent: Doc | null,
  readonly: boolean = false,
  placeholder: string = ""
) {
  const editor = useEditor({
    editable: !readonly,
    editorProps: {
      attributes: {
        className: "h-full doc",
      },
    },
    extensions: readonly
      ? STATIC_EXTENSIONS
      : [
          ...STATIC_EXTENSIONS,
          Placeholder.configure({
            placeholder,
          }),
          SlashExtension,
        ],
    autofocus: !!initialContent,
  });

  useEffect(() => {
    if (editor && initialContent) {
      setTimeout(() => {
        if (editor.state.doc.childCount <= 1) {
          editor.commands.setContent(initialContent);
        }
      }, 0);
    }
  }, [editor, initialContent]);

  return editor;
}

export function useReadonlyEditor(initialContent: Doc | null): ReturnType<typeof useFormEditor> {
  return useFormEditor(initialContent, true);
}
