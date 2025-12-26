import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLastSeenAt1735239000000 implements MigrationInterface {
  name = 'AddUserLastSeenAt1735239000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMPTZ`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastSeenAt"`);
  }
}
