import { MongoClient, type Db } from "mongodb";

import { databaseSettings } from "./settings";

const url = `mongodb://${databaseSettings.user}:${databaseSettings.password}@${databaseSettings.host}/?authSource=admin`;
const client = new MongoClient(url);

let _db: Db | undefined;

export const mongoConnect = async (callback: () => void) => {
  try {
    await client.connect();
    console.log("Mongodb connected!");
    _db = client.db();
    callback();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getDb = () => {
  if (_db) {
    return _db;
  }
  throw Error("No database found!");
};
