import TextField from "@/components/inputs/TextField";
import ChatInput from "@/components/messages/ChatInput";
import MessageBubble from "@/components/messages/MessageBubble";
import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";

export function Messages() {
  const messages = useStore(issueStore.messages);

  return (
    <div className="mt-4 space-y-4">
      <ChatInput />

      {messages.map((message, i) => (
        <MessageBubble key={i}>{message.content}</MessageBubble>
      ))}
    </div>
  );
}
