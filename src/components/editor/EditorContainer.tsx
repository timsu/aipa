import { useEffect, useRef } from "react";

import { Doc } from "@/components/editor/Doc";
import useFormEditor from "@/components/editor/useFormEditor";
import { EditorContent } from "@tiptap/react";
import { editorStore } from "@/stores/editorStore";
import { twMerge } from "tailwind-merge";

type Props = {
  content?: Doc | null;
  readonly?: boolean;
  className?: string;
  placeholder?: string;
};

function EditorContainer({ content: initialContent, readonly, className, placeholder }: Props) {
  const content = useRef<Doc>(initialContent || null);
  const editor = useFormEditor(content.current, readonly, placeholder);

  useEffect(() => {
    if (!editor) return;
    editorStore.init(editor, false);
  }, [editor]);

  return (
    <div className={twMerge("w-full h-auto grow pb-20 print:max-w-none print:p-0", className)}>
      <EditorContent editor={editor} />
    </div>
  );
}

export default EditorContainer;
