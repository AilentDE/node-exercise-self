import { ObjectId } from "mongodb";

import { getDb } from "../config/database";

type UserType = {
  id?: string;
  name: string;
  password: string;
  email: string;
  avatarUrl: string;
};

class User {
  id?: ObjectId;
  name: string;
  password: string;
  email: string;
  avatarUrl: string;

  constructor(userData: UserType) {
    if (userData.id) this.id = new ObjectId(userData.id);
    this.name = userData.name;
    this.password = userData.password;
    this.email = userData.email;
    this.avatarUrl = userData.avatarUrl;
  }

  async save() {
    const db = getDb();
    try {
      if (this.id) {
        await db
          .collection("users")
          .updateOne({ _id: this.id }, { $set: this });
      } else {
        const createdUser = await db.collection("users").insertOne(this);
        this.id = createdUser.insertedId;
      }

      return this;
    } catch (err) {
      throw Error(`Fail to update user: ${err}`);
    }
  }

  static fetchById = async (userId: string) => {
    const db = getDb();
    try {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return null;
      }

      return { ...user, id: user._id };
    } catch (err) {
      throw new Error(`Fail to fetch the user: ${err}`);
    }
  };
}

export default User;
