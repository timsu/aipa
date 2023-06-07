import { deepEqual } from "fast-equals";
import { atom } from "nanostores";

import API from "@/lib/api";
import { debounce, DebounceStyle } from "@/lib/debounce";
import { logger } from "@/lib/logger";
import { Editor } from "@tiptap/core";
import { Transaction } from "prosemirror-state";
import { isChangeOrigin } from "@tiptap/extension-collaboration";
import { Doc } from "@/components/editor/Doc";
import { JSONContent } from "@tiptap/react";

const SAVE_INTERVAL = 5000;

class EditorStore {
  // --- services
  editor: Editor | null = null;

  readonly = atom<boolean>(true);

  dirty = atom<boolean>(false);

  // --- document

  init(editor: Editor, readonly: boolean) {
    this.editor = editor;
    this.dirty.set(false);
    this.readonly.set(readonly);
  }

  pendingSaveFn: (() => Promise<void>) | undefined;

  previousContent: Doc | undefined;

  // hook to autosave when doc is modified
  autosave(id: string, editor: Editor | null, onSave: (content: Doc) => void) {
    if (!editor) return;

    const textChangeHandler = ({
      editor,
      transaction,
    }: {
      editor: Editor;
      transaction: Transaction;
    }) => {
      // ignore non-local changes
      if (transaction && isChangeOrigin(transaction)) return;

      this.dirty.set(true);
      this.pendingSaveFn = async () => {
        const contents = editor.getJSON() as Doc;
        if (deepEqual(contents, this.previousContent)) return;
        this.dirty.set(false);
        await API.saveContents(id, contents);
        logger.info("saved contents", contents);
        this.pendingSaveFn = undefined;
        this.previousContent = contents;
        onSave(contents);
      };

      debounce("save-doc", () => this.pendingSaveFn?.(), SAVE_INTERVAL, DebounceStyle.IGNORE_NEW);
    };
    editor.on("update", textChangeHandler);
    window.onbeforeunload = () => {
      if (this.pendingSaveFn) {
        this.pendingSaveFn();
        return "Changes have not been saved yet. Still leave?";
      }
    };

    return () => {
      editor.off("update", textChangeHandler);
      this.pendingSaveFn?.();
      window.onbeforeunload = null;
    };
  }

  saveNow = async () => {
    if (this.pendingSaveFn) {
      await this.pendingSaveFn();
    }
  };

  focus = () => {
    if (!this.editor) return;
    this.editor.commands.focus();
  };

  triggerSlashMenu = () => {
    const editor = this.editor;
    if (!editor) return;
    const lastPos = editor.state.doc.nodeSize;

    editor.chain().setTextSelection(lastPos).openSlashMenu().run();
  };

  getDoc = () => {
    return (this.editor?.getJSON() as Doc) || { type: "doc", content: [] };
  };
}

declare global {
  interface Window {
    editorStore: EditorStore;
  }
}

export const editorStore = new EditorStore();
if (typeof window !== "undefined" && process.env.NODE_ENV == "development")
  window.editorStore = editorStore;

export const textContent = (block: JSONContent): string => {
  return (block.text || "") + (block.content || []).map(textContent).join("");
};
