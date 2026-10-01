import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSocialAndPrivacyFeatures1710000000002 implements MigrationInterface {
  name = "AddSocialAndPrivacyFeatures1710000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ۱. افزودن ستون isPrivate
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isPrivate" boolean NOT NULL DEFAULT false;
    `);

    // ۲. جدول ریپلای‌ها
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "replies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" character varying(280) NOT NULL,
        "authorId" uuid NOT NULL,
        "postId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_replies" PRIMARY KEY ("id"),
        CONSTRAINT "FK_replies_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_replies_post" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
      );
    `);

    // ۳. جدول لایک‌ها
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "likes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "postId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_likes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_post_like" UNIQUE ("userId", "postId"),
        CONSTRAINT "FK_likes_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_likes_post" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
      );
    `);

    // ۴. جدول فالوها
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "follows" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "followerId" uuid NOT NULL,
        "followingId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follows" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_follower_following" UNIQUE ("followerId", "followingId"),
        CONSTRAINT "FK_follows_follower" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_follows_following" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "follows";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "replies";`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "isPrivate";`);
  }
}