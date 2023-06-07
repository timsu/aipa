import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import axios from "axios";
import {
  ComponentType,
  PropsWithChildren,
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";

export type CommandItemProps<T> = {
  item: T;
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
};

interface CommandListProps<T> extends SuggestionProps {
  items: T[];
}

interface PropsWithComponent<T> extends CommandListProps<T> {
  WrapperComponent: ComponentType<PropsWithChildren<{}>>;
  ItemComponent: ComponentType<CommandItemProps<T>>;
}

interface CommandListActions {
  onKeyDown: (props: SuggestionKeyDownProps) => void;
}

type VirtualElement = {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
};

function CommandListInner<T>(
  { clientRect, command, ItemComponent, WrapperComponent, items }: PropsWithComponent<T>,
  ref: Ref<CommandListActions>
) {
  const referenceEl: VirtualElement | null = useMemo(
    () => (clientRect ? ({ getBoundingClientRect: clientRect } as VirtualElement) : null),
    [clientRect]
  );

  const handleCommand = (index: number) => {
    const selected = items[index];
    command(selected);
  };

  const [hoverIndex, setHoverIndex] = useState(0);
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      const { key } = event;

      if (key === "ArrowUp") {
        setHoverIndex((prev) => {
          const beforeIndex = prev - 1;
          return beforeIndex >= 0 ? beforeIndex : 0;
        });
        return true;
      }

      if (key === "ArrowDown") {
        setHoverIndex((prev) => {
          const afterIndex = prev + 1;
          const itemCount = items.length - 1 ?? 0;
          return afterIndex < itemCount ? afterIndex : itemCount;
        });
        return true;
      }

      if (key === "Enter") {
        handleCommand(hoverIndex);
        return true;
      }

      return false;
    },
  }));

  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceEl, el, {
    placement: "bottom-start",
  });

  return createPortal(
    <div ref={setEl} className="commandMenu" style={styles.popper} {...attributes.popper}>
      <WrapperComponent>
        {items.map((item, index) => (
          <ItemComponent
            key={index}
            item={item}
            index={index}
            isActive={index === hoverIndex}
            onMouseEnter={() => setHoverIndex(index)}
            onClick={() => handleCommand(index)}
          />
        ))}
      </WrapperComponent>
    </div>,
    document.body
  );
}

export default function createCommandMenu<T>(
  WrapperComponent: ComponentType<PropsWithChildren<{}>>,
  ItemComponent: ComponentType<CommandItemProps<T>>
) {
  const componentWithRender = (props: CommandListProps<T>, ref: React.Ref<CommandListActions>) => {
    return CommandListInner({ ...props, WrapperComponent, ItemComponent }, ref);
  };
  return forwardRef<CommandListActions, CommandListProps<T>>(componentWithRender);
}
