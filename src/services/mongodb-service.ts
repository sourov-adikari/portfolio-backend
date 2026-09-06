import { MongoClient, type Db } from "mongodb";
import { config } from "../config.js";

let client: MongoClient | null = null;
let database: Db | null = null;

export const getDatabase = async (): Promise<Db> => {
  if (database) return database;

  if (!config.mongodb.uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  client ??= new MongoClient(config.mongodb.uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  database = client.db(config.mongodb.database || undefined);
  return database;
};

export const closeDatabase = async (): Promise<void> => {
  if (!client) return;
  await client.close();
  client = null;
  database = null;
};
