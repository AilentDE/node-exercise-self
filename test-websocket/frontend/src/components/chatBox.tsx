import { useEffect, useState, useRef } from "react";
import { faker } from "@faker-js/faker";
import { v4 as uuid4 } from "uuid";
import openSocket, { Socket } from "socket.io-client";

type Message = {
  content: string;
  senderId: string;
};

type User = {
  name: string;
  id: string;
};

const ChatBox = () => {
  const userName = useRef<User>({
    name: faker.person.fullName(),
    id: uuid4(),
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const ws = openSocket("http://localhost:3000");
    socket.current = ws;
    ws.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  useEffect(() => {
    const chatBoxes = document.querySelectorAll(".chat-box");
    chatBoxes.forEach((chatBox) => {
      chatBox.scrollTo(0, chatBox.scrollHeight);
    });
  }, [messages]);

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
      senderId: userName.current.id,
    };

    socket.current?.emit("message", userMessage);
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage("");
  };

  return (
    <div className="w-64 h-96 bg-gray-500/50 rounded-lg p-4">
      <div className="flex flex-col justify-between h-full space-y-2">
        <h2>{userName.current.name}</h2>
        <div className="flex flex-col justify-start p-1 size-full bg-gray-800/80 rounded-lg overflow-y-auto chat-box">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`px-1 text-sm ${
                message.senderId === userName.current.id
                  ? "text-end"
                  : "text-start"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
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
      </div>
    </div>
  );
};

export default ChatBox;
