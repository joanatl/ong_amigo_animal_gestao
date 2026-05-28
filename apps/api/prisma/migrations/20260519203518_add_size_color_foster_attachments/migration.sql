-- CreateEnum
CREATE TYPE "AnimalSize" AS ENUM ('small', 'medium', 'large');

-- AlterTable
ALTER TABLE "animals" ADD COLUMN     "attachment_keys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "color" VARCHAR(50),
ADD COLUMN     "foster_home" VARCHAR(200),
ADD COLUMN     "size" "AnimalSize";
