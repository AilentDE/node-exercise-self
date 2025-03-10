import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  DataTypes,
} from "sequelize";
import { sequelize } from "../config/database";
import { v7 as uuid7 } from "uuid";

import { Work } from "./work";

export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
  declare id: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getWorks: BelongsToManyGetAssociationsMixin<Work>;
  declare addWork: BelongsToManyAddAssociationMixin<Work, string>;
  declare addWorks: BelongsToManyAddAssociationsMixin<Work, string>;
  declare hasWork: BelongsToManyHasAssociationMixin<Work, string>;
  declare removeWork: BelongsToManyRemoveAssociationMixin<Work, string>;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuid7,
      primaryKey: true,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "orders",
    sequelize,
  }
);
