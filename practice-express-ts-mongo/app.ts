import express from "express";
import cluster from "cluster";
import os from "os";

import { mongoConnect } from "./src/config/database";
import ProductRouter from "./src/routes/product";
import UserRouter from "./src/routes/user";

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

app.use("/product", ProductRouter);
app.use("/user", UserRouter);

app.get("/", (req, res) => {
  res.send("The server is working!");
});

mongoConnect(() => {
  app.listen(port, () => {
    console.info(
      `You can ${cluster.isPrimary ? "" : " not"}use ${os.cpus().length} core`
    );
    console.log(`server is listening on port ${port}`);
  });
});
