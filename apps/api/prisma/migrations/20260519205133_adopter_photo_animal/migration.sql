-- AlterTable
ALTER TABLE "adopters" ADD COLUMN     "animal_id" UUID,
ADD COLUMN     "photo_key" TEXT,
ADD COLUMN     "photo_url" TEXT;

-- AddForeignKey
ALTER TABLE "adopters" ADD CONSTRAINT "adopters_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
