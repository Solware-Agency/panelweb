/*
  # Create medical records table

  1. New Tables
    - `medical_records`
      - `id` (uuid, primary key)
      - `full_name` (text) - Nombre completo del paciente
      - `id_number` (text) - Número de cédula
      - `phone` (text) - Teléfono
      - `age` (text) - Edad (permite letras y números)
      - `email` (text, optional) - Correo electrónico
      - `exam_type` (text) - Tipo de examen
      - `origin` (text) - Procedencia
      - `treating_doctor` (text) - Médico tratante
      - `sample_type` (text) - Tipo de muestra
      - `number_of_samples` (integer) - Cantidad de muestras
      - `relationship` (text, optional) - Relación
      - `branch` (text) - Sede
      - `date` (timestamptz) - Fecha del examen
      - `total_amount` (decimal) - Monto total en USD
      - `exchange_rate` (decimal, optional) - Tasa de cambio BCV
      - `payment_status` (text) - Estado del pago
      - `remaining` (decimal) - Monto restante
      - `payment_method_1` (text, optional) - Método de pago 1
      - `payment_amount_1` (decimal, optional) - Monto de pago 1
      - `payment_reference_1` (text, optional) - Referencia de pago 1
      - `payment_method_2` (text, optional) - Método de pago 2
      - `payment_amount_2` (decimal, optional) - Monto de pago 2
      - `payment_reference_2` (text, optional) - Referencia de pago 2
      - `payment_method_3` (text, optional) - Método de pago 3
      - `payment_amount_3` (decimal, optional) - Monto de pago 3
      - `payment_reference_3` (text, optional) - Referencia de pago 3
      - `payment_method_4` (text, optional) - Método de pago 4
      - `payment_amount_4` (decimal, optional) - Monto de pago 4
      - `payment_reference_4` (text, optional) - Referencia de pago 4
      - `comments` (text, optional) - Comentarios adicionales
      - `created_at` (timestamptz) - Fecha de creación
      - `updated_at` (timestamptz) - Fecha de actualización

  2. Security
    - Enable RLS on `medical_records` table
    - Add policy for public access (since no authentication is required)
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

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_id_number ON medical_records(id_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_branch ON medical_records(branch);