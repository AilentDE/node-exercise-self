const express = require("express");
const router = express.Router();
const { publicPath } = require("../utils/path");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(publicPath));

router.use((req, res, next) => {
  console.info(`${new Date().toISOString()} - ${req.method} - ${req.url}`);
  next();
});

module.exports = router;
