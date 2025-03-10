import express from "express";
import userController from "../controllers/user";

const router = express.Router();

router.get("/", userController.getUserListV2);
router.post("/", userController.createUserV2);
router.get("/:userId", userController.findUserByIdV2);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

export default router;
