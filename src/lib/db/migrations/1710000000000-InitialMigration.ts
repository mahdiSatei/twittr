import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1710000000000 implements MigrationInterface {
  name = "InitialMigration1710000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(30) NOT NULL,
        "email" character varying(255) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "displayName" character varying(50),
        "avatarUrl" character varying(500),
        "bio" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_username" UNIQUE ("username"),
        CONSTRAINT "UQ_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_username" ON "users" ("username");
      CREATE INDEX "IDX_users_email" ON "users" ("email");
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" character varying(280) NOT NULL,
        "authorId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_posts_createdAt" ON "posts" ("createdAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_posts_createdAt";`);
    await queryRunner.query(`DROP TABLE "posts";`);
    await queryRunner.query(`DROP INDEX "IDX_users_email";`);
    await queryRunner.query(`DROP INDEX "IDX_users_username";`);
    await queryRunner.query(`DROP TABLE "users";`);
  }
}