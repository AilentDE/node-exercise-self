import express from "express";

import { mongoConnect } from "./src/config/database";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const startTime = Date.now();
  const nowDateTime = new Date();
  console.info(`[${nowDateTime.toISOString()}] - ${req.method} - ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.info(`[Request duration] - ${duration}ms`);
  });

  next();
});

app.get("/", (req, res) => {
  res.send("The server is working!");
});

mongoConnect(() => {
  app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
  });
});
