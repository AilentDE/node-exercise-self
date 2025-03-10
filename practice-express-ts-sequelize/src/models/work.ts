import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  DataTypes,
} from "sequelize";
import { sequelize } from "../config/database";
import { v7 as uuid7 } from "uuid";

import { User } from "./user";
import { CartItem } from "./cartItem";
import { OrderItem } from "./orderItems";

export class Work extends Model<
  InferAttributes<Work>,
  InferCreationAttributes<Work>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare content: string;
  declare attachment: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare creatorId: ForeignKey<User["id"]>;

  // 添加 關聯屬性
  declare CartItem?: CartItem;
  declare OrderItem?: OrderItem | Object;
}

Work.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuid7,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachment: {
      type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "works",
    sequelize,
  }
);

// export const Work = sequelize.define("work", {
//   id: {
//     type: DataTypes.CHAR(36),
//     primaryKey: true,
//     allowNull: false,
//   },
//   title: {
//     type: DataTypes.STRING(128),
//     allowNull: false,
//   },
//   content: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   attachment: {
//     type: DataTypes.STRING,
//   },
// });
