import { ObjectId } from "mongodb";

import { getDb } from "../config/database";

type CartItemType = {
  productId: ObjectId;
  quantity: number;
};

type UserCartType = {
  items: CartItemType[];
};

type UserType = {
  id?: string;
  name: string;
  password: string;
  email: string;
  avatarUrl: string;
  cart?: UserCartType;
};

class User {
  _id?: ObjectId;
  name: string;
  password: string;
  email: string;
  avatarUrl: string;
  cart: UserCartType;

  constructor(userData: UserType) {
    if (userData.id) this._id = new ObjectId(userData.id);
    this.name = userData.name;
    this.password = userData.password;
    this.email = userData.email;
    this.avatarUrl = userData.avatarUrl;
    this.cart = userData.cart ? userData.cart : { items: [] };
  }

  async save() {
    const db = getDb();
    try {
      if (this._id) {
        await db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        const createdUser = await db.collection("users").insertOne(this);
        this._id = createdUser.insertedId;
      }

      return this;
    } catch (err) {
      throw Error(`Fail to update user: ${err}`);
    }
  }

  async addProductToCart(productId: string) {
    const db = getDb();

    try {
      const isExit = this.cart.items.findIndex((prod) => {
        return prod.productId.toString() === productId;
      });
      // new ObjectId never equal

      const updatedCart = { ...this.cart };
      if (isExit > -1) {
        updatedCart.items[isExit].quantity += 1;
      } else {
        updatedCart.items.push({
          productId: new ObjectId(productId),
          quantity: 1,
        });
      }
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: updatedCart } }
        );

      this.cart = updatedCart;
    } catch (err) {
      throw new Error(
        `Fail to add Product ${productId} into user's cart: ${err}`
      );
    }
  }

  static fetchById = async (userId: string) => {
    const db = getDb();
    try {
      const user = await db
        .collection("users")
        .findOne<User>({ _id: new ObjectId(userId) });

      if (!user) {
        return null;
      }

      return { id: user._id, ...user };
    } catch (err) {
      throw new Error(`Fail to fetch the user: ${err}`);
    }
  };
}

export default User;
