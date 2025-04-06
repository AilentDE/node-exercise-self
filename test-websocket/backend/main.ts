import express from "express";
import cors from "cors";

import customSocket from "./socket";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  })
);
app.get("/", (req, res) => {
  res.send("The server is working!");
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const runServer = () => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    const _ = customSocket.initializeSocket(server);

    // let count = 0;
    // setInterval(() => {
    //   io.emit("message", `Hello ${count}`);
    //   console.log(`Message sent: ${count}`);
    //   count++;
    // }, 5000);
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

runServer();
