-- Create explicit join table with adoption_date
CREATE TABLE "adopter_animals" (
  "adopter_id" UUID NOT NULL,
  "animal_id" UUID NOT NULL,
  "adoption_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT "adopter_animals_pkey" PRIMARY KEY ("adopter_id", "animal_id")
);

-- Migrate existing data from implicit M2M table
INSERT INTO "adopter_animals" ("adopter_id", "animal_id", "adoption_date")
SELECT "A", "B", CURRENT_DATE FROM "_AdopterToAnimal";

-- Add foreign key constraints
ALTER TABLE "adopter_animals" ADD CONSTRAINT "adopter_animals_adopter_id_fkey"
  FOREIGN KEY ("adopter_id") REFERENCES "adopters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "adopter_animals" ADD CONSTRAINT "adopter_animals_animal_id_fkey"
  FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old implicit M2M table
DROP TABLE "_AdopterToAnimal";
