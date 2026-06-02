DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_quiz_results' AND column_name = 'personality_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_quiz_results' AND column_name = 'operator_code'
  ) THEN
    ALTER TABLE "diagnosis_quiz_results" RENAME COLUMN "personality_code" TO "operator_code";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_quiz_results' AND column_name = 'personality_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_quiz_results' AND column_name = 'operator_type_name'
  ) THEN
    ALTER TABLE "diagnosis_quiz_results" RENAME COLUMN "personality_name" TO "operator_type_name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_quiz_results' AND column_name = 'ai_level'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diagnosis_quiz_results' AND column_name = 'ai_adoption_stage'
  ) THEN
    ALTER TABLE "diagnosis_quiz_results" RENAME COLUMN "ai_level" TO "ai_adoption_stage";
  END IF;
END $$;
