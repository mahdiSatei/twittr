import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogsAndRoles1710000000001 implements MigrationInterface {
  name = "AddAuditLogsAndRoles1710000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying(20) NOT NULL DEFAULT 'USER';
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying(50) NOT NULL,
        "targetType" character varying(50) NOT NULL,
        "targetId" character varying(255),
        "userId" uuid,
        "metadata" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action" ON "audit_logs" ("action");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs";`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role";`);
  }
}