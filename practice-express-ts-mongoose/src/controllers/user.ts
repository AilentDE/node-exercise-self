import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

import UserModel from "../models/user";
import ProductModel from "../models/product";

const createUser = async (req: Request, res: Response) => {
  const user = new UserModel({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatarUrl: faker.image.avatar(),
    cart: { items: [] },
  });

  await user.save();
  res.status(201).json({ message: "User created successfully", user });
};

const findUsers = async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;
  const users = await UserModel.find({}).skip(skip).limit(limit);

  res.json({ message: "Users found", users });
};

const createProduct = async (req: Request, res: Response) => {
  const product = new ProductModel({
    title: faker.book.title(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    description: faker.word.words(20),
    imageUrl: faker.image.url(),
    userId: req.currentUser,
  });
  await product.save();

  res.status(201).json({ message: "Product created successfully", product });
};

export default { createUser, findUsers, createProduct };
