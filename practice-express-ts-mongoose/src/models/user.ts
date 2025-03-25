import { Schema, model, Types, Document } from "mongoose";

interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

// 定義購物車的介面
interface ICart {
  items: ICartItem[];
}

// 定義使用者的介面
export interface IUser extends Document {
  name: string;
  email: string;
  avatarUrl: string;
  cart?: ICart | null;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
});

const UserModel = model("User", userSchema);

export default UserModel;
