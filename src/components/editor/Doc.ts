import { JSONContent } from "@tiptap/react";

export type Doc = {
  type: "doc";
  content: JSONContent[];
};

export const textContent = (block: JSONContent): string => {
  return (block.text || "") + (block.content || []).map(textContent).join("");
};
