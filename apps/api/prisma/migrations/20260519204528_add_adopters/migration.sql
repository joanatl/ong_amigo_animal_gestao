-- CreateTable
CREATE TABLE "adopters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "address" VARCHAR(300) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "description" TEXT,
    "attachment_keys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "adopters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "adopters" ADD CONSTRAINT "adopters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
