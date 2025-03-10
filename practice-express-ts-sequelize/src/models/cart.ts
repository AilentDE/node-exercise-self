import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManySetAssociationsMixin,
  DataTypes,
} from "sequelize";
import { sequelize } from "../config/database";
import { v7 as uuid7 } from "uuid";

import { Work } from "./work";

export class Cart extends Model<
  InferAttributes<Cart>,
  InferCreationAttributes<Cart>
> {
  declare id: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getWorks: BelongsToManyGetAssociationsMixin<Work>;
  declare addWork: BelongsToManyAddAssociationMixin<Work, string>;
  declare hasWork: BelongsToManyHasAssociationMixin<Work, string>;
  declare removeWork: BelongsToManyRemoveAssociationMixin<Work, string>;
  declare setWorks: BelongsToManySetAssociationsMixin<Work, string>;
}

Cart.init(
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
    tableName: "carts",
    sequelize,
  }
);
