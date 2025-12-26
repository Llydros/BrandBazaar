import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIsPublic1735239100000 implements MigrationInterface {
  name = 'AddProductIsPublic1735239100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "isPublic" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isPublic"`);
  }
}
