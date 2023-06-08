import { CommandItem } from "@/components/slashmenu/SlashExtension";
import {
  BackspaceIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  ListBulletIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { Editor } from "@tiptap/core";
import { isMacOS } from "@tiptap/react";

export default function slashMenuItems({ query, editor }: { query: string; editor: Editor }) {
  let items: CommandItem[] = [
    {
      title: "Section",
      description: "Sections can be collapsed",
      color: "bg-gray-800",
      icon: HashtagIcon,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertSection().run();
      },
    },
    {
      title: "Callout",
      description: "Highlight text for emphasis",
      color: "bg-orange-500",
      icon: ExclamationTriangleIcon,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertCallout().run();
      },
    },
  ];

  if (query) {
    items = items
      .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 10);
  }

  return items;
}
