import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRaffleWinnerColumns1735239400000 implements MigrationInterface {
  name = 'AddRaffleWinnerColumns1735239400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "raffle" ADD COLUMN IF NOT EXISTS "winnerSelectionStartedAt" TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle" ADD COLUMN IF NOT EXISTS "currentWinnerId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "raffle" ADD COLUMN IF NOT EXISTS "winnerPurchaseDeadline" TIMESTAMPTZ`,
    );

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'FK_raffle_currentWinnerId__users_id'
  ) THEN
    ALTER TABLE "raffle"
      ADD CONSTRAINT "FK_raffle_currentWinnerId__users_id"
      FOREIGN KEY ("currentWinnerId")
      REFERENCES "users"("id")
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
    WHERE conname = 'FK_raffle_currentWinnerId__users_id'
  ) THEN
    ALTER TABLE "raffle" DROP CONSTRAINT "FK_raffle_currentWinnerId__users_id";
  END IF;
END $$;
    `);

    await queryRunner.query(
      `ALTER TABLE "raffle" DROP COLUMN "winnerPurchaseDeadline"`,
    );
    await queryRunner.query(`ALTER TABLE "raffle" DROP COLUMN "currentWinnerId"`);
    await queryRunner.query(
      `ALTER TABLE "raffle" DROP COLUMN "winnerSelectionStartedAt"`,
    );
  }
}


