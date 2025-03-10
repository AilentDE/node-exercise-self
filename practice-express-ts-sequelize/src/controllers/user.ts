import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { v7 as uuid7 } from "uuid";

import { type UserType, User } from "../models/user";
import db from "../config/database";

const getUserList = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const [results] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const users = results as UserType[];
    res.json({ message: "Get users successfully", users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while fetching users.", err });
  }
};
const getUserListV2 = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const users = await User.findAll({
      limit,
      offset,
    });
    res.json({ message: "Get users successfully", users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while fetching users.", err });
  }
};

const findUserById = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(422).json({ message: "User id is required" });
    return;
  }

  try {
    const [result] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    if (!result) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const user = result[0] as UserType;
    res.json({ message: "Got user", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while fetching users.", err });
  }
};
const findUserByIdV2 = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (!userId) {
    res.status(422).json({ message: "User id is required" });
    return;
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "Got user", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while fetching users.", err });
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, password, email } = req.body as UserType;
    if (!name || !password || !email) {
      res.status(422).json({ message: "Body not allowed" });
      return;
    }
    await db.execute(
      "INSERT INTO users (id, name, password, email) VALUES (?, ?, ?, ?)",
      [uuid7(), name, password, email]
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while creating user", err });
  }
};
const createUserV2 = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    if (!userData.name || !userData.password || !userData.email) {
      res.status(422).json({ message: "Body not allowed" });
      return;
    }
    const user = await User.create({ ...userData });
    await user.createCart();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error occurred while creating user", err });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const updatedName: string = req.body.name;
  const updatedPass: string = req.body.password;
  const updatedEmail: string = req.body.email;

  if (!userId) {
    res.status(422).json({ message: "User id is required" });
    return;
  }
  if (!updatedName || !updatedPass || !updatedEmail) {
    res.status(422).json({ message: "Body not allowed" });
    return;
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await user.update({
      name: updatedName,
      password: updatedPass,
      email: updatedEmail,
    });
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error occurred while updating user" });
  }
};
const updateUserV2 = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const updatedName: string = req.body.name;
  const updatedPass: string = req.body.password;
  const updatedEmail: string = req.body.email;
  if (!userId) {
    res.status(422).json({ message: "User id is required" });
    return;
  }
  if (!updatedName || !updatedPass || !updatedEmail) {
    res.status(422).json({ message: "Body not allowed" });
    return;
  }

  try {
    await User.update(
      {
        name: updatedName,
        password: updatedPass,
        email: updatedEmail,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred while updating user" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    await User.destroy({ where: { id: userId } });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred while deleting user" });
  }
};

export default {
  getUserList,
  getUserListV2,
  findUserById,
  findUserByIdV2,
  createUser,
  createUserV2,
  updateUser,
  updateUserV2,
  deleteUser,
};
