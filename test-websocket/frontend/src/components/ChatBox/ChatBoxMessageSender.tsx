import { useState } from "react";

// import { useChatUserCtx, useChatMessageCtx } from "./context";
import { chatCtxs } from "./useChatCtx";
import { Message } from "./typing";

const ChatBoxMessageSender = ({ chatIndex }: { chatIndex: number }) => {
  const { useChatUserCtx, useChatMessageCtx } = chatCtxs[chatIndex];

  const user = useChatUserCtx();
  const { sendMessage } = useChatMessageCtx();
  const [message, setMessage] = useState("");

  const handleSendMessage = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (
      event.nativeEvent instanceof KeyboardEvent &&
      event.nativeEvent.key !== "Enter"
    ) {
      return;
    }
    const userMessage: Message = {
      content: message,
      senderId: user.id,
    };

    sendMessage(userMessage);
    setMessage("");
  };

  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="message"
          placeholder="Message"
          className="w-2/3 border border-white rounded-lg p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleSendMessage}
        />
        <button className="w-1/3" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBoxMessageSender;
