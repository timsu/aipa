import { useEffect, useRef } from "react";

import { Doc } from "@/components/editor/Doc";
import { EditorContent } from "@tiptap/react";
import useFormEditor from "@/components/editor/useFormEditor";
import { editorStore } from "@/stores/editorStore";
import useArrowKeyNavigation from "../hooks/useArrowKeyNavigation";

type Props = {
  doc: Doc | null;
};

function FormViewer({ doc }: Props) {
  const content = useRef<Doc>(doc);
  const editor = useFormEditor(content.current, true);

  useEffect(() => {
    if (!editor) return;
    editorStore.init(editor, true);
  }, [editor]);

  return (
    <div className={"w-full h-auto grow print:max-w-none print:p-0"}>
      <EditorContent editor={editor} />
    </div>
  );
}

export default FormViewer;
