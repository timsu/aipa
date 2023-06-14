import { issueStore } from "@/stores/issueStore";
import { messageStore } from "@/stores/messageStore";
import { workspaceStore } from "@/stores/workspaceStore";
import { useStore } from "@nanostores/react";
import { KeyboardEvent, useState } from "react";
import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions";

export default function ChatInput() {
  const [value, setValue] = useState("");
  const users: SuggestionDataItem[] = useStore(workspaceStore.userList).map((u) => ({
    id: u.id,
    display: u.name || "User",
  }));

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("send message", value);
      messageStore.postMessage("user", value);
      setValue("");
    }
  };

  return (
    <MentionsInput
      value={value}
      onChange={(e, newValue) => setValue(newValue)}
      allowSpaceInQuery
      onKeyDown={onKeyDown}
      style={{
        input: {
          borderRadius: "0.375rem",
          border: "1px solid rgb(209,213,219)",
        },
        suggestions: {
          list: {
            backgroundColor: "white",
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: 14,
          },
          item: {
            padding: "5px 15px",
            borderBottom: "1px solid rgba(0,0,0,0.15)",
            "&focused": {
              backgroundColor: "#cee4e5",
            },
          },
        },
      }}
    >
      <Mention trigger="@" data={users} />
    </MentionsInput>
  );
}
