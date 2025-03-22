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
  const userId = req.params.userId;
  const productId = req.params.productId;
  const user = await User.fetchById(userId);

  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  const userModel = new User({ ...user, id: user._id?.toString() });

  await userModel.addProductToCart(productId);

  res.json({ message: "Add product to cart successfully", user });
};

export default { createUser, findUserById, createProduct, addProductToCart };
