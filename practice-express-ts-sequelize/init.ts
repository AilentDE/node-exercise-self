import { v7 as uuid7 } from "uuid";
import { faker } from "@faker-js/faker";
import db, { sequelize } from "./src/config/database";

import { User } from "./src/models/user";
import { Work } from "./src/models/work";
import { Cart } from "./src/models/cart";
import { CartItem } from "./src/models/cartItem";
import { Order } from "./src/models/order";
import { OrderItem } from "./src/models/orderItems";

const createUserTable = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.info("User table created successfully.");
  } catch (err) {
    console.error("Error creating user table:", err);
  }
};

const createTablesV2 = async () => {
  try {
    User.hasMany(Work);
    Work.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

    User.hasOne(Cart);
    Cart.belongsTo(User);

    Cart.belongsToMany(Work, { through: CartItem });
    Work.belongsToMany(Cart, { through: CartItem });

    User.hasMany(Order);
    Order.belongsTo(User);
    Order.belongsToMany(Work, { through: OrderItem });
    Work.belongsToMany(Order, { through: OrderItem });

    await sequelize.sync(); // or with { force: true }
    console.info("Table created successfully.");
  } catch (err) {
    console.error("Error creating user table:", err);
  }
};

const insertFakeUser = async () => {
  try {
    await db.execute(
      "INSERT INTO users (id, name, password, email) VALUES (?, ?, ?, ?)",
      [
        uuid7(),
        faker.internet.displayName(),
        faker.internet.password(),
        faker.internet.email(),
      ]
    );
    console.info("User inserted successfully.");
  } catch (err) {
    console.error("Error inserting user:", err);
  }
};

const insertFakeUserV2 = async () => {
  try {
    const user = await User.create({
      name: faker.internet.displayName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
    });
    console.info("User inserted successfully");
    await user.createCart();
    console.info("User's cart created successfully");
  } catch (err) {
    console.error("Error inserting user:", err);
  }
};

export const initJob = async () => {
  await createTablesV2();
  await insertFakeUserV2();
};
