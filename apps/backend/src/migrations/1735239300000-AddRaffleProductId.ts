import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRaffleProductId1735239300000 implements MigrationInterface {
  name = 'AddRaffleProductId1735239300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "raffle" ADD COLUMN IF NOT EXISTS "productId" uuid`,
    );

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'FK_raffle_productId__product_id'
  ) THEN
    ALTER TABLE "raffle"
      ADD CONSTRAINT "FK_raffle_productId__product_id"
      FOREIGN KEY ("productId")
      REFERENCES "product"("id")
      ON DELETE SET NULL;
  END IF;
END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'FK_raffle_productId__product_id'
  ) THEN
    ALTER TABLE "raffle" DROP CONSTRAINT "FK_raffle_productId__product_id";
  END IF;
END $$;
    `);

    await queryRunner.query(`ALTER TABLE "raffle" DROP COLUMN "productId"`);
  }
}


