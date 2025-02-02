const express = require("express");
const baseRouter = require("./middlewares/base");
const adminRouter = require("./routes/admin");
const { notFoundPagePath } = require("./utils/path");

const port = 3000;

const app = express();
app.use(baseRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res) => {
  res.status(404).sendFile(notFoundPagePath);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
