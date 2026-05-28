CREATE TABLE "_AdopterToAnimal" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

CREATE UNIQUE INDEX "_AdopterToAnimal_AB_unique" ON "_AdopterToAnimal"("A", "B");
CREATE INDEX "_AdopterToAnimal_B_index" ON "_AdopterToAnimal"("B");

ALTER TABLE "_AdopterToAnimal"
    ADD CONSTRAINT "_AdopterToAnimal_A_fkey"
    FOREIGN KEY ("A") REFERENCES "adopters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_AdopterToAnimal"
    ADD CONSTRAINT "_AdopterToAnimal_B_fkey"
    FOREIGN KEY ("B") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migra vínculos existentes (animal_id único → join table)
INSERT INTO "_AdopterToAnimal" ("A", "B")
SELECT id, animal_id FROM adopters WHERE animal_id IS NOT NULL;

ALTER TABLE "adopters" DROP COLUMN "animal_id";
