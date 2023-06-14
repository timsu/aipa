import { JSONContent } from "@tiptap/react";

export type Doc = {
  type: "doc";
  content: JSONContent[];
};

export const textContent = (block: JSONContent, prefix: string = ""): string => {
  return (
    (block.text ? prefix + block.text : "") +
    (block.content || [])
      .map((block) => {
        if (block.type == "bulletList") {
          return textContent(block, prefix ? "  " + prefix : "* ");
        } else if (block.type == "orderedList") {
          return textContent(block, prefix ? "  " + prefix : "#. ");
        }
        return textContent(block, prefix);
      })
      .join("\n")
  );
};
