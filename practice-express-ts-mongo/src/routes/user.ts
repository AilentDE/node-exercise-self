import express from "express";

import UserController from "../controllers/user";
import User from "../models/user";

const router = express.Router();

declare global {
  namespace Express {
    interface Request {
      currentUser: User;
    }
  }
}

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
    req.currentUser = new User({ ...user, id: user._id?.toString() });

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

activityRouter.post(
  "/:userId/removeProductFromCart/:productId",
  UserController.removeProductFromCart
);

activityRouter.post("/:userId/checkoutOrder", UserController.checkoutOrder);

activityRouter.get("/:userId/getCart", UserController.getCart);

activityRouter.get("/:userId/orders", UserController.getOrders);
