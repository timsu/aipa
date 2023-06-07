import { useEffect, useRef } from "react";

import { Doc } from "@/components/editor/Doc";
import useFormEditor from "@/components/editor/useFormEditor";
import { editFormStore } from "@/stores/editFormStore";
import { logger } from "@/lib/logger";
import { EditorContent } from "@tiptap/react";
import { editorStore } from "@/stores/editorStore";

type Props = {
  id: string;
  doc: Doc | null;
};

function FormEditor({ id, doc }: Props) {
  const content = useRef<Doc>(doc);
  const editor = useFormEditor(content.current);

  useEffect(() => {
    if (!editor) return;
    editorStore.init(editor, false);
    editorStore.autosave(id, editor, (contents) => content.current);
  }, [id, editor]);

  return (
    <div className={"w-full h-auto grow pb-20 print:max-w-none print:p-0"}>
      <EditorContent editor={editor} />
    </div>
  );
}

export default FormEditor;
