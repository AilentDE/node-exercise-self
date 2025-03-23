import { ObjectId } from "mongodb";

import { getDb } from "../config/database";
import Product from "./product";

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
      throw new Error(`Fail to update user: ${err}`);
    }
  }

  async getCart() {
    const db = getDb();

    try {
      const items = (await db
        .collection("products")
        .find({ _id: { $in: this.cart.items.map((item) => item.productId) } })
        .toArray()) as Product[];

      if (items.length !== this.cart.items.length) {
        const updatedCart = { ...this.cart };
        updatedCart.items = updatedCart.items.filter((i) =>
          items.map((new_item) => new_item._id).includes(i.productId)
        );
        await db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
        this.cart = updatedCart;
      }

      return items.map((item) => ({
        ...item,
        quantity: this.cart.items.find(
          (i) => i.productId.toString() === item._id?.toString()
        )?.quantity,
      }));
    } catch (err) {
      throw new Error(`Fail th fetch user's cart: ${err}`);
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
        .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });

      this.cart = updatedCart;
    } catch (err) {
      throw new Error(
        `Fail to add Product ${productId} into user's cart: ${err}`
      );
    }
  }

  async removeProductFromCart(productId: string) {
    const db = getDb();

    const updatedCart = { ...this.cart };
    updatedCart.items = this.cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    try {
      await db
        .collection("users")
        .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });

      this.cart = updatedCart;
    } catch (err) {
      throw new Error(
        `Fail to remove Product ${productId} from user's cart: ${err}`
      );
    }
  }

  async checkoutOrder() {
    const db = getDb();

    const cartItems = await this.getCart();
    const order = {
      items: cartItems,
      user: { _id: this._id, name: this.name, dataType: "snapshot" },
    };

    try {
      await db.collection("orders").insertOne(order);
      this.cart.items = [];
      await db
        .collection("users")
        .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
    } catch (err) {
      throw new Error(`Fail to checkout the order: ${err}`);
    }
  }

  async getUserOrders() {
    const db = getDb();

    try {
      const orders = await db
        .collection("orders")
        .find({ "user._id": this._id })
        .sort({ _id: -1 })
        .toArray();

      return orders;
    } catch (err) {
      throw new Error(`Fail to fetch user's orders: ${err}`);
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
