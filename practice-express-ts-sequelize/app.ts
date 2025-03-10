import express from "express";

import { initJob } from "./init";
import userRouter from "./src/routes/user";
import userActivityRouter from "./src/routes/userActivity";

initJob();

const port = 3000;
const app = express();

declare global {
  namespace Express {
    interface Request {
      requestedAt?: Date;
    }
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const startTime = Date.now();
  const nowDateTime = new Date();
  console.info(`[${nowDateTime.toISOString()}] - ${req.method} - ${req.url}`);
  req.requestedAt = nowDateTime;

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.info(`[Request duration] - ${duration}ms`);
  });

  next();
});

app.use("/users", userRouter);
app.use("/userActivity", userActivityRouter);

app.get("/", (req, res) => {
  res.send("The server is working!");
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
