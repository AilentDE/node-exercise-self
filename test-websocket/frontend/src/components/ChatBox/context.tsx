import { createContext, useContext } from "react";
import { faker } from "@faker-js/faker";
import { v4 as uuid4 } from "uuid";

import { User, Message } from "./typing";

export const UserCtx = createContext<User>({
  name: faker.person.fullName(),
  id: uuid4(),
});
export const useChatUserCtx = () => {
  const ctx = useContext(UserCtx);
  if (!ctx) {
    throw new Error("useChatUserCtx must be used within a ChatBox");
  }
  return ctx;
};

export const MessageCtx = createContext({
  chatIndex: 0,
  messages: [] as Message[],
  sendMessage: (message: Message) => {
    console.log(message);
  },
});
export const useChatMessageCtx = () => {
  const ctx = useContext(MessageCtx);
  if (!ctx) {
    throw new Error("useChatMessageCtx must be used within a ChatBox");
  }
  return ctx;
};
