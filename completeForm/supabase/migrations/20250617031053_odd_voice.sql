/*
  # Crear tabla limpia de registros médicos

  1. Nueva tabla `medical_records_clean`
    - Estructura optimizada y limpia
    - Todos los campos necesarios del formulario
    - Índices para mejor rendimiento
    - RLS habilitado para seguridad
    - Constraints de validación

  2. Seguridad
    - Enable RLS en la tabla
    - Política de acceso público para inserción y lectura
    - Triggers para timestamps automáticos

  3. Características
    - ID UUID automático
    - Timestamps de creación y actualización
    - Validaciones de datos
    - Índices optimizados
*/

-- Eliminar tabla anterior si existe
DROP TABLE IF EXISTS medical_records_clean CASCADE;

-- Crear nueva tabla limpia
CREATE TABLE medical_records_clean (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del paciente
  full_name text NOT NULL,
  id_number text NOT NULL,
  phone varchar(15) NOT NULL CHECK (char_length(phone) >= 1 AND char_length(phone) <= 15),
  age integer NOT NULL CHECK (age > 0 AND age <= 150),
  email text,
  
  -- Datos del servicio
  exam_type text NOT NULL,
  origin text NOT NULL,
  treating_doctor text NOT NULL,
  sample_type text NOT NULL,
  number_of_samples integer NOT NULL CHECK (number_of_samples > 0),
  relationship text,
  branch text NOT NULL,
  date timestamptz NOT NULL,
  
  -- Datos financieros
  total_amount numeric(10,2) NOT NULL CHECK (total_amount > 0),
  exchange_rate numeric(10,2),
  payment_status text NOT NULL DEFAULT 'Pendiente',
  remaining numeric(10,2) DEFAULT 0,
  
  -- Métodos de pago (hasta 4)
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
  
  -- Comentarios adicionales
  comments text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_medical_records_clean_created_at ON medical_records_clean (created_at DESC);
CREATE INDEX idx_medical_records_clean_id_number ON medical_records_clean (id_number);
CREATE INDEX idx_medical_records_clean_branch ON medical_records_clean (branch);
CREATE INDEX idx_medical_records_clean_payment_status ON medical_records_clean (payment_status);
CREATE INDEX idx_medical_records_clean_full_name ON medical_records_clean (full_name);
CREATE INDEX idx_medical_records_clean_phone ON medical_records_clean (phone);

-- Habilitar Row Level Security
ALTER TABLE medical_records_clean ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso público (para desarrollo)
CREATE POLICY "Allow public access to medical records clean"
  ON medical_records_clean
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_medical_records_clean_updated_at
    BEFORE UPDATE ON medical_records_clean
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en la tabla y columnas
COMMENT ON TABLE medical_records_clean IS 'Tabla limpia para registros médicos con estructura optimizada';
COMMENT ON COLUMN medical_records_clean.phone IS 'Número de teléfono del paciente (máximo 15 caracteres)';
COMMENT ON COLUMN medical_records_clean.age IS 'Edad del paciente en años';
COMMENT ON COLUMN medical_records_clean.total_amount IS 'Monto total en USD';
COMMENT ON COLUMN medical_records_clean.exchange_rate IS 'Tasa de cambio USD/VES al momento del registro';
COMMENT ON COLUMN medical_records_clean.remaining IS 'Monto restante por pagar en USD';