import express from "express";

import { connectDB } from "./src/config/database";
import middleWareBase from "./src/middlewares/base";
import middleWareTimer from "./src/middlewares/timer";

import routerProduct from "./src/routes/product";
import routerUser, { activityRouter } from "./src/routes/user";

const app = express();
const port = 3000;

app.use(middleWareBase);
app.use(middleWareTimer);

app.use("/product", routerProduct);
app.use("/user", routerUser);
app.use("/user", activityRouter);

app.get("/", (req, res) => {
  res.send("The server is working!");
});

const run = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`server is listening on ${port} !!!`);
  });
};

try {
  run();
} catch (err) {
  console.error(err);
}
