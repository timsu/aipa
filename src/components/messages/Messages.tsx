import MessageBubble from "@/components/messages/MessageBubble";
import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";

export function Messages() {
  const messages = useStore(issueStore.messages);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {messages.map((message, i) => (
        <MessageBubble key={i}>{message.content}</MessageBubble>
      ))}
    </div>
  );
}
