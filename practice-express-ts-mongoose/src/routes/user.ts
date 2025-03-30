import { Router } from "express";

import UserController from "../controllers/user";
import UserModel from "../models/user";
import { IUser, IUserMethods } from "../models/typing";

const router = Router();
export const activityRouter = Router();

// User object
router.post("/", UserController.createUser);
router.get("/", UserController.findUsers);

// User action
declare global {
  namespace Express {
    interface Request {
      currentUser: IUser & IUserMethods;
    }
  }
}
activityRouter.use("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.currentUser = user;
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
activityRouter.get("/:userId/getCart", UserController.getCart);

export default router;
