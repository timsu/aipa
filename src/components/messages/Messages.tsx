import TextField from "@/components/inputs/TextField";
import ChatInput from "@/components/messages/ChatInput";
import MessageBubble from "@/components/messages/MessageBubble";
import { issueStore } from "@/stores/issueStore";
import { messageStore } from "@/stores/messageStore";
import { useStore } from "@nanostores/react";
import { Issue } from "@prisma/client";
import { useEffect } from "react";

export function Messages({ issue }: { issue: Issue }) {
  const messages = useStore(messageStore.messages);

  useEffect(() => {
    messageStore.loadMessages(issue);
  }, [issue]);

  return (
    <div className="my-4">
      <ChatInput />
      <div className="mt-4 flex flex-col-reverse gap-4">
        {messages.map((message, i) => (
          <MessageBubble
            key={i}
            timestamp={message.createdAt}
            className={message.id ? "" : "bg-yellow-50"}
          >
            <MentionText text={message.content} />
          </MessageBubble>
        ))}
      </div>
    </div>
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
