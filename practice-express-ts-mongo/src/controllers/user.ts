import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

import User from "../models/user";

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

export default { createUser, findUserById };
