import { useState, useRef, useEffect } from "react";
import openSocket, { Socket } from "socket.io-client";

import { Message } from "./typing";
import { chatCtxs } from "./useChatCtx";
import ChatBoxTitle from "./ChatBoxTitle";
import ChatBoxShowRoom from "./ChatBoxShowRoom";
import ChatBoxMessageSender from "./ChatBoxMessageSender";

const ChatBox = ({
  chatIndex,
  children,
}: {
  chatIndex: number;
  children: React.ReactNode;
}) => {
  const { UserCtx, useChatUserCtx, MessageCtx } = chatCtxs[chatIndex];

  const user = useChatUserCtx();
  console.log(user);
  const [messages, setMessages] = useState<Message[]>([]);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const ws = openSocket("http://localhost:3000");
    ws.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    socket.current = ws;
  }, []);

  const sendMessage = (message: Message) => {
    socket.current?.emit("message", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <UserCtx.Provider value={user}>
      <MessageCtx.Provider value={{ chatIndex, messages, sendMessage }}>
        <div className="w-64 h-96 bg-gray-500/50 rounded-lg p-4">
          <div className="flex flex-col justify-between h-full space-y-2">
            {children}
          </div>
        </div>
      </MessageCtx.Provider>
    </UserCtx.Provider>
  );
};

export default ChatBox;

ChatBox.Title = ChatBoxTitle;
ChatBox.ShowRoom = ChatBoxShowRoom;
ChatBox.MessageSender = ChatBoxMessageSender;
