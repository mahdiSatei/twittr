import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { AuditLog } from "./entities/AuditLog";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "twitter",
  synchronize: false,
  logging: !isProduction,
  entities: [User, Post, AuditLog],
  migrations: [path.join(__dirname, "./migrations/*.{ts,js}")],
  subscribers: [],
});

export async function getDb(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}