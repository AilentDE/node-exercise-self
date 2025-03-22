import express from "express";

import UserController from "../controllers/user";
import User from "../models/user";

const router = express.Router();

router.post("/", UserController.createUser);
router.get("/:userId", UserController.findUserById);

export default router;

export const activityRouter = express.Router();

activityRouter.use("/:userId", async (req, resizeBy, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.fetchById(userId);

    console.log(user);
    if (!user) {
      resizeBy.status(404).json({ message: "User not found" });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
});

activityRouter.post("/:userId/createProduct", UserController.createProduct);

activityRouter.post(
  "/:userId/addProductToCart/:productId",
  UserController.addProductToCart
);
