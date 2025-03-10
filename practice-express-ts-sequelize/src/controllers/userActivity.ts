import { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import { sequelize } from "../config/database";

const getWorks = async (req: Request, res: Response) => {
  const works = await req.currentUser.getWorks();

  res.json({ message: "Got user's works", works });
};

const findWorkById = async (req: Request, res: Response) => {
  const workId = req.params.workId;
  const work = await req.currentUser.getWorks({ where: { id: workId } });
  if (!work) {
    res.status(404).json({ message: "Work no found" });
  }

  res.json({ message: "Got user's work", work: work[0] });
};

const createWork = async (req: Request, res: Response) => {
  const work = await req.currentUser.createWork({
    title: faker.book.title(),
    content: faker.word.words(20),
  });

  res.status(201).json({ message: "Work created", work });
};

const getCart = async (req: Request, res: Response) => {
  const cart = await req.currentUser.getCart();
  const cartItems = await cart.getWorks();

  res.json({ message: "Got users's cart", cartItems });
};

const addWorkToCart = async (req: Request, res: Response) => {
  const workId = req.params.workId;

  const userCart = await req.currentUser.getCart();
  const existingCartItem = await userCart.getWorks({
    where: { id: workId },
  });

  if (existingCartItem.length > 0 && existingCartItem[0].CartItem) {
    await userCart.addWork(workId, {
      through: { quantity: existingCartItem[0].CartItem.quantity + 1 },
    });
    res.json({ message: "The quantity of work in cart has been update" });
    return;
  }

  await userCart.addWork(workId, { through: { quantity: 1 } });
  res.json({ message: "Work added to user cart" });
};

const removeWorkFromCart = async (req: Request, res: Response) => {
  const workId = req.params.workId;

  const userCart = await req.currentUser.getCart();
  const existingCartItem = await userCart.getWorks({
    where: { id: workId },
  });

  if (existingCartItem.length === 0) {
    res.status(400).json({ message: "Work not in cart" });
    return;
  } else if (existingCartItem[0].CartItem) {
    if (existingCartItem[0].CartItem.quantity > 1) {
      await userCart.addWork(workId, {
        through: { quantity: existingCartItem[0].CartItem.quantity - 1 },
      });
      res.json({ message: "Work has been decreased" });
      return;
    } else {
      await userCart.removeWork(workId);
    }
  }
  res.json({ message: "Work has been removed" });
};

const checkoutOrder = async (req: Request, res: Response) => {
  const userCart = await req.currentUser.getCart();
  const cartItems = await userCart.getWorks();
  if (cartItems.length <= 1) {
    res.json({ message: "User doesn't have any work in cart" });
    return;
  }

  const newOrder = await req.currentUser.createOrder();
  // [WARN] For now sequelize v6, it's not work for modify though table with addX method. Watting for v7 support TypeScript
  // const newOrderItems = cartItems.map((item) => {
  //   const copyItem = { ...item.CartItem };
  //   item.OrderItem = copyItem;
  //   return item;
  // });
  // await newOrder.addWorks(newOrderItems);

  const t = await sequelize.transaction();
  try {
    for (const item of cartItems) {
      await newOrder.addWork(item, {
        through: { quantity: item.CartItem!.quantity },
        transaction: t,
      });
    }
    await t.commit();
    await userCart.setWorks([]);

    res.json({ message: "Order created" });
  } catch (err) {
    console.error(err);
    t.rollback();
  }
};

const getOrders = async (req: Request, res: Response) => {
  const orders = await req.currentUser.getOrders({
    include: ["Works"],
  });

  res.json({ message: "Got users's cart", orders });
};

export default {
  getWorks,
  findWorkById,
  createWork,
  getCart,
  addWorkToCart,
  removeWorkFromCart,
  checkoutOrder,
  getOrders,
};
