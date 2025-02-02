const path = require("path");

module.exports = {
  dataPath: path.join(__dirname, "..", "data", "data.json"),
  notFoundPagePath: path.join(__dirname, "..", "views", "not-found.html"),
  publicPath: path.join(__dirname, "..", "public"),
};
