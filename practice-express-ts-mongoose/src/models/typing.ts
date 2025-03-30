import { Types, Document, Model } from "mongoose";

// User
interface ICartItem {
  productId: Types.ObjectId | IProduct;
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
  clearCart(): void;
}

export type UserModelType = Model<IUser, {}, IUserMethods>;

// Order

interface IOrderItem {
  product: IProductWithId;
  quantity: number;
}

interface IOrderUser {
  _id: Types.ObjectId;
  name: string;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  user: IOrderUser;
}

export type OrderModelType = Model<IOrder>;
