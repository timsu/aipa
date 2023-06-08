import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";

export function Messages() {
  const messages = useStore(issueStore.messages);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {messages.map((message, i) => (
        <div key={i}>
          <div className="inline-block bg-blue-100 rounded-md p-2">{message.content}</div>
        </div>
      ))}
    </div>
  );
}
