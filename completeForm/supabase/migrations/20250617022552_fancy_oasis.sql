/*
  # Crear tabla medical_records con manejo seguro de políticas

  1. Nueva tabla
    - `medical_records` con todos los campos necesarios
    - Tipos de datos corregidos (numeric en lugar de decimal)
    - Restricciones y valores por defecto apropiados

  2. Seguridad
    - Habilitar RLS solo si no está habilitado
    - Crear política solo si no existe
    - Manejo seguro de políticas existentes

  3. Índices
    - Índices para mejorar rendimiento en consultas frecuentes
    - Creación condicional para evitar errores

  4. Funciones y triggers
    - Función para actualizar updated_at automáticamente
    - Trigger para ejecutar la función en cada UPDATE
*/

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  id_number text NOT NULL,
  phone varchar(15) NOT NULL,
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

-- Agregar restricción para el teléfono si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_phone_length' 
    AND table_name = 'medical_records'
  ) THEN
    ALTER TABLE medical_records 
    ADD CONSTRAINT check_phone_length 
    CHECK (char_length(phone) <= 15 AND char_length(phone) >= 1);
  END IF;
END $$;

-- Agregar comentario al campo phone
COMMENT ON COLUMN medical_records.phone IS 'Número de teléfono del paciente (máximo 15 caracteres)';

-- Habilitar RLS solo si no está habilitado
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

-- Crear política solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medical_records' 
    AND policyname = 'Allow public access to medical records'
    AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Allow public access to medical records"
      ON medical_records
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_medical_records_branch 
  ON medical_records USING btree (branch);

CREATE INDEX IF NOT EXISTS idx_medical_records_id_number 
  ON medical_records USING btree (id_number);

CREATE INDEX IF NOT EXISTS idx_medical_records_created_at 
  ON medical_records USING btree (created_at DESC);

-- Crear función para actualizar updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_medical_records_updated_at'
  ) THEN
    CREATE TRIGGER update_medical_records_updated_at 
      BEFORE UPDATE ON medical_records 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;