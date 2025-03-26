import { Types, Document, Model } from "mongoose";

// User
interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

interface ICart {
  items: ICartItem[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  avatarUrl: string;
  cart?: ICart | null;
}

// Product
export interface IProduct extends Document {
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId: Types.ObjectId;
}

export interface IProductWithId extends IProduct {
  _id: Types.ObjectId;
}

// Methods
export interface IUserMethods {
  addToCart(product: IProductWithId): void;
}

export type UserModelType = Model<IUser, {}, IUserMethods>;
