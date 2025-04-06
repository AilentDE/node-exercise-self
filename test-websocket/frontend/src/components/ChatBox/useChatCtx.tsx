import { createContext, useContext } from "react";
import { faker } from "@faker-js/faker";
import { v4 as uuid4 } from "uuid";

import { User, Message } from "./typing";

export const USERS = 4;

const useChatCtx = () => {
  const UserCtx = createContext<User>({
    name: faker.person.fullName(),
    id: uuid4(),
  });
  const useChatUserCtx = () => {
    const ctx = useContext(UserCtx);
    if (!ctx) {
      throw new Error("useChatUserCtx must be used within a ChatBox");
    }
    return ctx;
  };

  const MessageCtx = createContext({
    chatIndex: 0,
    messages: [] as Message[],
    sendMessage: (message: Message) => {
      console.log(message);
    },
  });
  const useChatMessageCtx = () => {
    const ctx = useContext(MessageCtx);
    if (!ctx) {
      throw new Error("useChatMessageCtx must be used within a ChatBox");
    }
    return ctx;
  };

  return { UserCtx, useChatUserCtx, MessageCtx, useChatMessageCtx };
};

export default useChatCtx;

export const chatCtxs = Array.from({ length: USERS }).map(useChatCtx);
