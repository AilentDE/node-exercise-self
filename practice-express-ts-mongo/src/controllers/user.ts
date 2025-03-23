import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

import User from "../models/user";
import Product from "../models/product";

const createUser = async (req: Request, res: Response) => {
  const user = new User({
    name: faker.person.fullName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    avatarUrl: faker.image.avatar(),
  });
  await user.save();

  res.status(201).json({ message: "User created", user });
};

const findUserById = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const user = await User.fetchById(userId);

  res.json({ message: "Succes found the user", user });
};

const createProduct = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const product = new Product({
    title: faker.book.title(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    description: faker.word.words(20),
    imageUrl: faker.image.avatar(),
    userId,
  });
  await product.save();

  res.status(201).json({ message: "User's product created", product });
};

const addProductToCart = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  await req.currentUser.addProductToCart(productId);

  res.json({
    message: "Add product to cart successfully",
    user: req.currentUser,
  });
};

const removeProductFromCart = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  await req.currentUser.removeProductFromCart(productId);

  res.json({
    message: "Remove product from cart successfully",
    user: req.currentUser,
  });
};

const getCart = async (req: Request, res: Response) => {
  const cart = await req.currentUser.getCart();

  res.json({ message: "Got user's cart", cart });
};

export default {
  createUser,
  findUserById,
  createProduct,
  addProductToCart,
  removeProductFromCart,
  getCart,
};
