const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

router.get("/", adminController.getAdminList);

router.post("/", adminController.createAdmin);

router.patch("/:id", adminController.modifyAdmin);

router.delete("/:id", adminController.deleteAdmin);

module.exports = router;
