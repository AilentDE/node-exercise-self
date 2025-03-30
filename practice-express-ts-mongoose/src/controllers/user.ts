import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

import UserModel from "../models/user";
import ProductModel from "../models/product";
import OrderModel from "../models/orer";
import { IProduct } from "../models/typing";

const createUser = async (req: Request, res: Response) => {
  const user = new UserModel({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatarUrl: faker.image.avatar(),
    cart: { items: [] },
  });

  await user.save();
  res.status(201).json({ message: "User created successfully", user });
};

const findUsers = async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;
  const users = await UserModel.find({}).skip(skip).limit(limit);

  res.json({ message: "Users found", users });
};

const createProduct = async (req: Request, res: Response) => {
  const product = new ProductModel({
    title: faker.book.title(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    description: faker.word.words(20),
    imageUrl: faker.image.url(),
    userId: req.currentUser,
  });
  await product.save();

  res.status(201).json({ message: "Product created successfully", product });
};

const addProductToCart = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const product = await ProductModel.findById(productId);

  if (!product) {
    res.status(404).json({ message: "Product not found", productId });
    return;
  }

  await req.currentUser.addToCart(product);
  res.json({ message: "Added product to cart", cart: req.currentUser.cart });
};

const getCart = async (req: Request, res: Response) => {
  const cart = await req.currentUser.populate("cart.items.productId");

  res.json({ message: "Cart", cart: cart.cart });
};

const deleteProductFromCart = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const updatedCart = req.currentUser.cart!.items.filter(
    (p) => p.productId.toString() !== productId
  );
  req.currentUser.cart = { items: updatedCart };
  await req.currentUser.save();

  const cart = await req.currentUser.populate("cart.items.productId");

  res.json({
    message: "Product deleted from cart",
    cart: cart.cart,
  });
};

const checkoutOrder = async (req: Request, res: Response) => {
  const cart = await req.currentUser.populate("cart.items.productId");

  if (cart.cart?.items.length === 0) {
    res.status(400).json({ message: "Cart is empty" });
    return;
  }

  const order = new OrderModel({
    user: {
      _id: req.currentUser._id,
      name: req.currentUser.name,
    },
    items: cart.cart!.items.map((item) => {
      const product = item.productId as IProduct;
      return {
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          description: product.description,
          imageUrl: product.imageUrl,
          userId: product.userId,
        },
        quantity: item.quantity,
      };
    }),
  });

  await order.save();

  await req.currentUser.clearCart();

  res.json({ message: "Order created successfully", order });
};

const getOrders = async (req: Request, res: Response) => {
  const orders = await OrderModel.find({ "user._id": req.currentUser._id });

  const populatedOrders = await OrderModel.populate(orders, {
    path: "items.product.userId",
    select: "-cart -email",
  });

  res.json({ message: "User orders", orders: populatedOrders });
};

export default {
  createUser,
  findUsers,
  createProduct,
  addProductToCart,
  getCart,
  deleteProductFromCart,
  checkoutOrder,
  getOrders,
};
