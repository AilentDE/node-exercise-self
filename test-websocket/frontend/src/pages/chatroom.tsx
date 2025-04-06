import ChatBox from "../components/ChatBox/ChatBox";
import { USERS } from "../components/ChatBox/useChatCtx";

const ChatRoomPage = () => {
  return (
    <div className="grid grid-cols-2 gap-8 h-screen">
      {Array.from({ length: USERS }).map((_, index) => (
        <ChatBox chatIndex={index} key={index}>
          <ChatBox.Title chatIndex={index} />
          <ChatBox.ShowRoom chatIndex={index} />
          <ChatBox.MessageSender chatIndex={index} />
        </ChatBox>
      ))}
    </div>
  );
};

export default ChatRoomPage;
