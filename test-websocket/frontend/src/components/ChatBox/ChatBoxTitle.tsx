// import { useChatUserCtx } from "./context";
import { chatCtxs } from "./useChatCtx";

const ChatBoxTitle = ({ chatIndex }: { chatIndex: number }) => {
  const { useChatUserCtx } = chatCtxs[chatIndex];

  const user = useChatUserCtx();

  return <h2>{user.name}</h2>;
};

export default ChatBoxTitle;
