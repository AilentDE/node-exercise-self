import { createBrowserRouter } from "react-router";

import Home from "./pages/home";
import ChatRoomPage from "./pages/chatroom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/chatroom",
    element: <ChatRoomPage />,
  },
]);

export default router;
