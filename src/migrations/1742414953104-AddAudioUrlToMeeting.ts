import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAudioUrlToMeetings1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "Meetings"
            SET "audioUrl" = CONCAT('https://api.echonotes.com/meetings/', id, '/audio')
            WHERE "audioPath" IS NOT NULL AND "audioUrl" IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "Meetings"
            SET "audioUrl" = NULL
            WHERE "audioUrl" LIKE 'https://api.echonotes.com/meetings/%';
        `);
    }
}
