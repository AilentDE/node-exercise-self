import express from "express";

import userActivituController from "../controllers/userActivity";
import { User } from "../models/user";

const router = express.Router();

declare global {
  namespace Express {
    interface Request {
      currentUser: User;
    }
  }
}

router.use("/:userId", async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findByPk(userId);
    if (user === null) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    req.currentUser = user;

    next();
  } catch (err) {
    next(err);
  }
});

router.get("/:userId/getWorks", userActivituController.getWorks);
router.get("/:userId/getWork/:workId", userActivituController.findWorkById);
router.post("/:userId/createWork", userActivituController.createWork);

router.get("/:userId/getCart", userActivituController.getCart);
router.post(
  "/:userId/addWorkToCart/:workId",
  userActivituController.addWorkToCart
);
router.delete(
  "/:userId/addWorkToCart/:workId",
  userActivituController.removeWorkFromCart
);

router.post("/:userId/checkoutOrder", userActivituController.checkoutOrder);
router.get("/:userId/getOrders", userActivituController.getOrders);

export default router;
