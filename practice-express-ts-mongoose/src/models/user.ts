import { Schema, model } from "mongoose";

import { IUser, IProductWithId, IUserMethods, UserModelType } from "./typing";

const userSchema = new Schema<IUser, UserModelType, IUserMethods>({
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
userSchema.method("addToCart", function addToCart(product: IProductWithId) {
  const cartProductIndex = this.cart!.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );

  if (cartProductIndex >= 0) {
    this.cart!.items[cartProductIndex].quantity += 1;
  } else {
    this.cart!.items.push({
      productId: product._id,
      quantity: 1,
    });
  }

  return this.save();
});

const UserModel = model<IUser, UserModelType>("User", userSchema);

export default UserModel;
