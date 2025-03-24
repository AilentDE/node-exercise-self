import { connect } from "mongoose";

import { databaseSettings } from "./settings";

const url = `mongodb://${databaseSettings.user}:${databaseSettings.password}@${databaseSettings.host}/?authSource=admin`;

export const connectDB = async () => {
  await connect(url);
};
