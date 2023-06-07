import { PluginKey } from "prosemirror-state";

import slashMenuItems from "@/components/slashmenu/slashMenuItems";
import { Editor, Extension, Range } from "@tiptap/core";
import Suggestion, {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from "@tiptap/suggestion";
import createCommandMenu, { CommandItemProps } from "@/components/slashmenu/CommandMenu";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { Component, FC, HTMLAttributes, PropsWithChildren } from "react";
import SlashCommandItem from "@/components/slashmenu/SlashCommandItem";

export type CommandItem = {
  title: string;
  description: string;
  color: string;
  icon: FC<HTMLAttributes<SVGSVGElement>>;
  shortcut?: string;
  command: (args: { editor: Editor; range: Range }) => void;
};

type ExtensionOptions = {
  suggestion: Partial<SuggestionOptions<CommandItem>>;
};

const pluginKey = new PluginKey("slashmenu");

function SlashMenuWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <div className="max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
      {children}
    </div>
  );
}

const SlashMenu = createCommandMenu<CommandItem>(SlashMenuWrapper, SlashCommandItem);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    slashmenu: {
      /**
       * Comments will be added to the autocomplete.
       */
      openSlashMenu: () => ReturnType;
    };
  }
}

const SlashExtension = Extension.create<ExtensionOptions>({
  name: "slashmenu",

  addCommands() {
    return {
      openSlashMenu:
        () =>
        ({ commands }) => {
          return commands.insertContent("/");
        },
    };
  },

  addOptions() {
    return {
      ...this.parent?.(),
      suggestion: {
        char: "/",
        startOfLine: true,
        items: slashMenuItems,
        render: () => {
          let reactRenderer: ReactRenderer;

          return {
            onStart: (props: SuggestionProps) => {
              reactRenderer = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              });
            },

            onUpdate(props: SuggestionProps) {
              reactRenderer?.updateProps(props);
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                reactRenderer?.destroy();
                return true;
              }

              return (reactRenderer?.ref as any)?.onKeyDown(props);
            },

            onExit() {
              reactRenderer.destroy();
            },
          };
        },
        command: ({ editor, range, props }) => {
          props?.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey,
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashExtension;
