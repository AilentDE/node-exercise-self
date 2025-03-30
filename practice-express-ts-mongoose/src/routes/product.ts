import { Router } from "express";

import ProductController from "../controllers/product";

const router = Router();

router.post("/", ProductController.createProduct);
router.get("/", ProductController.findProducts);
router.patch("/:productId", ProductController.updateProduct);
router.delete("/:productId", ProductController.deleteProduct);

export default router;
