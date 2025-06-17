/*
  # Clean up old medical_records table and policies
  
  1. Drop old table and policies
    - Remove the old `medical_records` table completely
    - This will also remove all associated policies, triggers, and constraints
  
  2. Ensure clean state
    - Remove any conflicting policies
    - Prepare for using only the new `medical_records_clean` table
*/

-- Drop the old medical_records table completely (this will also drop all its policies)
DROP TABLE IF EXISTS medical_records CASCADE;

-- Also drop any orphaned policies that might exist
DO $$
BEGIN
    -- Try to drop the policy if it exists on any table
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow public access to medical records'
    ) THEN
        -- This will handle any remaining policy references
        DROP POLICY IF EXISTS "Allow public access to medical records" ON medical_records;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if the policy or table doesn't exist
        NULL;
END $$;