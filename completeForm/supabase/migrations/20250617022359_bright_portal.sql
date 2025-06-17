/*
  # Create medical_records table

  1. New Tables
    - `medical_records`
      - `id` (uuid, primary key, auto-generated)
      - `full_name` (text, required) - Patient's full name
      - `id_number` (text, required) - Patient's ID number
      - `phone` (text, required) - Patient's phone number
      - `age` (text, required) - Patient's age
      - `email` (text, optional) - Patient's email address
      - `exam_type` (text, required) - Type of medical examination
      - `origin` (text, required) - Origin/source of the patient
      - `treating_doctor` (text, required) - Name of treating doctor
      - `sample_type` (text, required) - Type of medical sample
      - `number_of_samples` (integer, required) - Number of samples taken
      - `relationship` (text, optional) - Patient relationship info
      - `branch` (text, required) - Medical facility branch
      - `date` (timestamptz, required) - Date of examination
      - `total_amount` (numeric, required) - Total amount to be paid
      - `exchange_rate` (numeric, optional) - Currency exchange rate
      - `payment_status` (text, default 'Pendiente') - Payment status
      - `remaining` (numeric, default 0) - Remaining amount to pay
      - Payment method fields (1-4) for multiple payment options
      - `comments` (text, optional) - Additional comments
      - `created_at` (timestamptz, auto-generated) - Record creation time
      - `updated_at` (timestamptz, auto-generated) - Record update time

  2. Security
    - Enable RLS on `medical_records` table
    - Add policy for public access (as configured in your types)

  3. Indexes
    - Primary key on `id`
    - Index on `branch` for filtering by branch
    - Index on `id_number` for patient lookup
    - Index on `created_at` for chronological sorting
*/

-- Create the medical_records table
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

-- Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (matching your current configuration)
CREATE POLICY "Allow public access to medical records"
  ON medical_records
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_branch 
  ON medical_records USING btree (branch);

CREATE INDEX IF NOT EXISTS idx_medical_records_id_number 
  ON medical_records USING btree (id_number);

CREATE INDEX IF NOT EXISTS idx_medical_records_created_at 
  ON medical_records USING btree (created_at DESC);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medical_records_updated_at 
  BEFORE UPDATE ON medical_records 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();