import express from "express";

import UserController from "../controllers/user";

const router = express.Router();

router.post("/", UserController.createUser);
router.get("/:userId", UserController.findUserById);

export default router;
