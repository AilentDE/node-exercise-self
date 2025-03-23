import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

import Product from "../models/product";

const createProduct = async (req: Request, res: Response) => {
  const product = new Product({
    title: faker.book.title(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    description: faker.word.words(20),
    imageUrl: faker.image.url(),
  });
  await product.save();

  res.status(201).json({ message: "Product created", product });
};

const listProducts = async (req: Request, res: Response) => {
  const products = await Product.fetchAll();

  res.json({ message: "Products found products", products });
};

const findProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const product = await Product.fetchOne(productId);

  res.json({ message: "Success found the product", product });
};

const updateProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const updateData = req.body;
  if (updateData.hasOwnProperty("id")) delete updateData.id;

  const product = await Product.fetchOne(productId);
  const updatedProduct = new Product({ ...product, ...updateData });
  await updatedProduct.save();

  res.json({
    message: "Product was updated successfully",
    product: updatedProduct,
  });
};

const deleteProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  await Product.deleteOne(productId);

  res.json({ message: "Product was deleted successfully" });
};

export default {
  createProduct,
  listProducts,
  findProductById,
  updateProductById,
  deleteProductById,
};
