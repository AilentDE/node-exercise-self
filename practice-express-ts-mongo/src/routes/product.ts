import express from "express";

import ProductController from "../controllers/product";

const router = express.Router();

router.get("/", ProductController.listProducts);
router.post("/", ProductController.createProduct);
router.get("/:productId", ProductController.findProductById);
router.patch("/:productId", ProductController.updateProductById);
router.delete("/:productId", ProductController.deleteProductById);

export default router;
