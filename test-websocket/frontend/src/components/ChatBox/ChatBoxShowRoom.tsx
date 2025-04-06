import { useEffect } from "react";
// import { useChatUserCtx, useChatMessageCtx } from "./context";
import { chatCtxs } from "./useChatCtx";

const ChatBoxShowRoom = ({ chatIndex }: { chatIndex: number }) => {
  const { useChatUserCtx, useChatMessageCtx } = chatCtxs[chatIndex];

  const user = useChatUserCtx();
  const { messages } = useChatMessageCtx();

  useEffect(() => {
    const chatBoxes = document.querySelectorAll(".chat-box");
    chatBoxes[chatIndex].scrollTo(0, chatBoxes[chatIndex].scrollHeight);
  }, [chatIndex, messages]);

  return (
    <div className="flex flex-col justify-start p-1 size-full bg-gray-800/80 rounded-lg overflow-y-auto chat-box">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`px-1 text-sm ${
            message.senderId === user.id ? "text-end" : "text-start"
          }`}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
};

export default ChatBoxShowRoom;
