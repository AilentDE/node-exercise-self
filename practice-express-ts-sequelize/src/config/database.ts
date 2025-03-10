import mysql from "mysql2";
import { Sequelize } from "sequelize";

import { databaseSettings } from "./settings";

const pool = mysql.createPool({ ...databaseSettings });

export const sequelize = new Sequelize(
  databaseSettings.database as string,
  databaseSettings.user as string,
  databaseSettings.password as string,
  {
    dialect: "mysql",
    host: databaseSettings.host,
    // logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30 * 1000,
      idle: 10 * 1000,
    },
  }
);

export default pool.promise();
