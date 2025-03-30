import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

import ProductModel from "../models/product";

const createProduct = async (req: Request, res: Response) => {
  const product = new ProductModel({
    title: faker.book.title(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    description: faker.word.words(20),
    imageUrl: faker.image.url(),
  });
  await product.save();

  res.status(201).json({ message: "Product created successfully", product });
};

const findProducts = async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;
  const products = await ProductModel.find({}).skip(skip).limit(limit);

  res.json({ message: "Products found", products });
};

const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const updateData = req.body;
  const product = await ProductModel.findByIdAndUpdate(
    productId,
    { $set: updateData },
    { new: true }
  );

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.status(200).json({ message: "Product updated successfully", product });
};

const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const product = await ProductModel.findByIdAndDelete(productId);

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.status(200).json({ message: "Product deleted successfully", product });
};

export default { createProduct, findProducts, updateProduct, deleteProduct };
