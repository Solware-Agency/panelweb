/*
  # Create medical records table

  1. New Tables
    - `medical_records`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `id_number` (text, required)
      - `phone` (text, required)
      - `age` (text, required)
      - `email` (text, optional)
      - `exam_type` (text, required)
      - `origin` (text, required)
      - `treating_doctor` (text, required)
      - `sample_type` (text, required)
      - `number_of_samples` (integer, required)
      - `relationship` (text, optional)
      - `branch` (text, required)
      - `date` (timestamptz, required)
      - `total_amount` (numeric, required)
      - `exchange_rate` (numeric, optional)
      - `payment_status` (text, default 'Pendiente')
      - `remaining` (numeric, default 0)
      - `payment_method_1-4` (text, optional)
      - `payment_amount_1-4` (numeric, optional)
      - `payment_reference_1-4` (text, optional)
      - `comments` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `medical_records` table
    - Add policy for public access (if not exists)

  3. Indexes
    - Index on created_at for sorting
    - Index on id_number for searching
    - Index on branch for filtering
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  id_number text NOT NULL,
  phone text NOT NULL,
  age text NOT NULL,
  email text,
  exam_type text NOT NULL,
  origin text NOT NULL,
  treating_doctor text NOT NULL,
  sample_type text NOT NULL,
  number_of_samples integer NOT NULL,
  relationship text,
  branch text NOT NULL,
  date timestamptz NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  exchange_rate numeric(10,2),
  payment_status text NOT NULL DEFAULT 'Pendiente',
  remaining numeric(10,2) DEFAULT 0,
  payment_method_1 text,
  payment_amount_1 numeric(10,2),
  payment_reference_1 text,
  payment_method_2 text,
  payment_amount_2 numeric(10,2),
  payment_reference_2 text,
  payment_method_3 text,
  payment_amount_3 numeric(10,2),
  payment_reference_3 text,
  payment_method_4 text,
  payment_amount_4 numeric(10,2),
  payment_reference_4 text,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'medical_records'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policy if it exists, then create new one
DO $$
BEGIN
  -- Drop the policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medical_records' 
    AND policyname = 'Allow public access to medical records'
  ) THEN
    DROP POLICY "Allow public access to medical records" ON medical_records;
  END IF;
  
  -- Create the policy
  CREATE POLICY "Allow public access to medical records"
    ON medical_records
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_id_number ON medical_records(id_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_branch ON medical_records(branch);