import { Schema, model } from "mongoose";

import { IOrder, OrderModelType } from "./typing";

// snapshot

const orderSchema = new Schema<IOrder, OrderModelType>({
  items: [
    {
      product: {
        _id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        imageUrl: {
          type: String,
          required: true,
        },
        userId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
  },
});

const OrderModel = model<IOrder, OrderModelType>("Order", orderSchema);

export default OrderModel;
