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
      - `total_amount` (decimal, required)
      - `exchange_rate` (decimal, optional)
      - `payment_status` (text, default 'Pendiente')
      - `remaining` (decimal, default 0)
      - `payment_method_1` to `payment_method_4` (text, optional)
      - `payment_amount_1` to `payment_amount_4` (decimal, optional)
      - `payment_reference_1` to `payment_reference_4` (text, optional)
      - `comments` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `medical_records` table
    - Add policy for public access (for this demo)

  3. Indexes
    - Add indexes for common queries
*/

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
  total_amount decimal(10,2) NOT NULL,
  exchange_rate decimal(10,2),
  payment_status text NOT NULL DEFAULT 'Pendiente',
  remaining decimal(10,2) DEFAULT 0,
  payment_method_1 text,
  payment_amount_1 decimal(10,2),
  payment_reference_1 text,
  payment_method_2 text,
  payment_amount_2 decimal(10,2),
  payment_reference_2 text,
  payment_method_3 text,
  payment_amount_3 decimal(10,2),
  payment_reference_3 text,
  payment_method_4 text,
  payment_amount_4 decimal(10,2),
  payment_reference_4 text,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Allow public access for inserting and reading records
CREATE POLICY "Allow public access to medical records"
  ON medical_records
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_id_number ON medical_records(id_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_branch ON medical_records(branch);