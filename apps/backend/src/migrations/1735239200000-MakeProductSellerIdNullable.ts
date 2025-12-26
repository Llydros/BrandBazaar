import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeProductSellerIdNullable1735239200000
  implements MigrationInterface
{
  name = 'MakeProductSellerIdNullable1735239200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product'
      AND column_name = 'sellerId'
  ) THEN
    ALTER TABLE "product" ALTER COLUMN "sellerId" DROP NOT NULL;
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
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product'
      AND column_name = 'sellerId'
  ) THEN
    ALTER TABLE "product" ALTER COLUMN "sellerId" SET NOT NULL;
  END IF;
END $$;
    `);
  }
}


