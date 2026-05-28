ALTER TABLE "animals" ADD COLUMN "birth_date" DATE;

UPDATE "animals"
SET "birth_date" = (CURRENT_DATE - ("age_months" || ' months')::interval)::date;

ALTER TABLE "animals" ALTER COLUMN "birth_date" SET NOT NULL;

ALTER TABLE "animals" DROP COLUMN "age_months";
