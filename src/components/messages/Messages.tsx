import TextField from "@/components/inputs/TextField";
import ChatInput from "@/components/messages/ChatInput";
import MessageBubble from "@/components/messages/MessageBubble";
import { issueStore } from "@/stores/issueStore";
import { messageStore } from "@/stores/messageStore";
import { workspaceStore } from "@/stores/workspaceStore";
import { UIMessage } from "@/types";
import { useStore } from "@nanostores/react";
import { Issue } from "@prisma/client";
import { useEffect, useState } from "react";

export function Messages({ issue }: { issue: Issue }) {
  const [editing, setEditing] = useState(false);
  const messages = useStore(messageStore.messages);

  useEffect(() => {
    messageStore.loadMessages(issue);
  }, [issue]);

  return (
    <div className="my-4">
      {editing ? (
        <ChatInput />
      ) : (
        <TextField
          className="text-base w-full border-gray-300"
          onClick={() => setEditing(true)}
          placeholder="Type a message..."
        />
      )}
      <div className="mt-4 flex flex-col-reverse gap-4">
        {messages.map((message, i) => (
          <Message key={i} message={message} />
        ))}
      </div>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const users = useStore(workspaceStore.users);
  const user = users[message.userId!];

  const from = user
    ? message.role == "assistant"
      ? `${user.name} (via assistant)`
      : user.name
    : "";

  return (
    <MessageBubble
      timestamp={message.createdAt}
      user={from}
      className={
        !message.id ? "bg-yellow-50" : message.role == "assistant" ? "bg-green-50" : "bg-blue-50"
      }
    >
      <MentionText text={message.content} />
    </MessageBubble>
  );
}

type PartType = {
  type: "text" | "mention";
  content: string;
};

function splitMentionText(mentionText: string): PartType[] {
  const pattern = /(@\[[\w\s]+\]\([\w\d]+\))|([^\@]+)/g;
  const parts = mentionText.match(pattern);
  if (!parts) return [{ type: "text", content: mentionText }];

  return parts.map((part) => {
    if (part.startsWith("@[")) {
      const mentionPattern = /@\[([\w\s]+)\]\([\w\d]+\)/;
      const name = part.replace(mentionPattern, "$1");
      return { type: "mention", content: name };
    } else {
      return { type: "text", content: part };
    }
  });
}

const MentionText: React.FC<{ text: string }> = ({ text }) => {
  const parts = splitMentionText(text);

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "mention") {
          return (
            <span key={i} className="font-semibold text-blue-600">
              @{part.content}
            </span>
          );
        } else {
          return <span key={i}>{part.content}</span>;
        }
      })}
    </>
  );
};
