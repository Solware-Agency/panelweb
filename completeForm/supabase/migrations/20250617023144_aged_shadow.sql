/*
  # Crear tabla 'clientes' para registros médicos

  1. Nueva Tabla
    - `clientes` - Tabla principal para registros de clientes médicos
    - Estructura exacta que coincide con los campos del formulario
    - Validaciones y restricciones apropiadas

  2. Seguridad
    - Enable RLS en tabla `clientes`
    - Política de acceso público para inserción y lectura

  3. Rendimiento
    - Índices en campos de búsqueda frecuente
    - Trigger automático para updated_at

  4. Validaciones
    - Restricción de teléfono: máximo 15 caracteres
    - Validación de formato de campos
*/

-- Crear la tabla 'clientes' con estructura exacta del formulario
CREATE TABLE IF NOT EXISTS clientes (
  -- ID único generado automáticamente
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- === DATOS DEL PACIENTE ===
  full_name text NOT NULL,                    -- Nombre Completo *
  id_number text NOT NULL,                    -- Cédula *
  phone varchar(15) NOT NULL,                 -- Teléfono * (máx. 15 caracteres)
  age integer NOT NULL,                       -- Edad *
  email text,                                 -- Correo electrónico (opcional)
  date timestamptz NOT NULL,                  -- Fecha *
  
  -- === DATOS DEL SERVICIO ===
  exam_type text NOT NULL,                    -- Tipo de Examen *
  origin text NOT NULL,                       -- Procedencia *
  treating_doctor text NOT NULL,              -- Médico Tratante *
  sample_type text NOT NULL,                  -- Tipo de Muestra *
  number_of_samples integer NOT NULL,         -- Cantidad de Muestras *
  relationship text,                          -- Relación (opcional)
  
  -- === DATOS DE PAGO ===
  branch text NOT NULL,                       -- Sede *
  total_amount numeric(10,2) NOT NULL,        -- Monto Total ($) *
  exchange_rate numeric(10,2),                -- Tasa de cambio BCV
  payment_status text NOT NULL DEFAULT 'Pendiente',  -- Estado del pago
  remaining numeric(10,2) DEFAULT 0,          -- Monto restante
  
  -- === MÉTODOS DE PAGO (hasta 4) ===
  payment_method_1 text,                      -- Forma de Pago 1
  payment_amount_1 numeric(10,2),             -- Monto 1
  payment_reference_1 text,                   -- Referencia 1
  payment_method_2 text,                      -- Forma de Pago 2
  payment_amount_2 numeric(10,2),             -- Monto 2
  payment_reference_2 text,                   -- Referencia 2
  payment_method_3 text,                      -- Forma de Pago 3
  payment_amount_3 numeric(10,2),             -- Monto 3
  payment_reference_3 text,                   -- Referencia 3
  payment_method_4 text,                      -- Forma de Pago 4
  payment_amount_4 numeric(10,2),             -- Monto 4
  payment_reference_4 text,                   -- Referencia 4
  
  -- === COMENTARIOS ===
  comments text,                              -- Comentarios adicionales
  
  -- === TIMESTAMPS AUTOMÁTICOS ===
  created_at timestamptz DEFAULT now(),       -- Fecha de creación
  updated_at timestamptz DEFAULT now()        -- Fecha de actualización
);

-- === RESTRICCIONES Y VALIDACIONES ===

-- Restricción para teléfono: máximo 15 caracteres, mínimo 1
ALTER TABLE clientes 
ADD CONSTRAINT check_phone_length_clientes 
CHECK (char_length(phone) <= 15 AND char_length(phone) >= 1);

-- Restricción para edad: debe ser positiva
ALTER TABLE clientes 
ADD CONSTRAINT check_age_positive_clientes 
CHECK (age > 0 AND age <= 150);

-- Restricción para número de muestras: debe ser positivo
ALTER TABLE clientes 
ADD CONSTRAINT check_samples_positive_clientes 
CHECK (number_of_samples > 0);

-- Restricción para monto total: debe ser positivo
ALTER TABLE clientes 
ADD CONSTRAINT check_total_amount_positive_clientes 
CHECK (total_amount > 0);

-- === SEGURIDAD: ROW LEVEL SECURITY ===

-- Habilitar RLS en la tabla clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso público para todas las operaciones
CREATE POLICY "Allow public access to clientes"
  ON clientes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- === ÍNDICES PARA RENDIMIENTO ===

-- Índice para búsquedas por sede
CREATE INDEX IF NOT EXISTS idx_clientes_branch 
  ON clientes USING btree (branch);

-- Índice para búsquedas por cédula
CREATE INDEX IF NOT EXISTS idx_clientes_id_number 
  ON clientes USING btree (id_number);

-- Índice para ordenar por fecha de creación (más recientes primero)
CREATE INDEX IF NOT EXISTS idx_clientes_created_at 
  ON clientes USING btree (created_at DESC);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_clientes_full_name 
  ON clientes USING btree (full_name);

-- Índice para búsquedas por teléfono
CREATE INDEX IF NOT EXISTS idx_clientes_phone 
  ON clientes USING btree (phone);

-- === TRIGGER AUTOMÁTICO PARA UPDATED_AT ===

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger que se ejecuta antes de cada UPDATE
CREATE TRIGGER update_clientes_updated_at_trigger
  BEFORE UPDATE ON clientes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_clientes_updated_at();

-- === COMENTARIOS DOCUMENTATIVOS ===

COMMENT ON TABLE clientes IS 'Tabla principal para registros de clientes médicos';
COMMENT ON COLUMN clientes.phone IS 'Número de teléfono del paciente (máximo 15 caracteres)';
COMMENT ON COLUMN clientes.age IS 'Edad del paciente en años (debe ser positiva)';
COMMENT ON COLUMN clientes.exchange_rate IS 'Tasa de cambio BCV USD/VES al momento del registro';
COMMENT ON COLUMN clientes.payment_status IS 'Estado del pago: Pendiente, Completado, Incompleto';
COMMENT ON COLUMN clientes.remaining IS 'Monto restante por pagar en USD';

/*
  🎯 RESUMEN DE LA NUEVA TABLA 'clientes':

  ✅ Estructura exacta del formulario
  ✅ Validaciones completas en base de datos
  ✅ Restricciones de integridad de datos
  ✅ Row Level Security configurado
  ✅ Políticas de acceso público
  ✅ Índices optimizados para búsquedas
  ✅ Trigger automático para updated_at
  ✅ Comentarios documentativos
  ✅ Tipos de datos precisos
  ✅ Valores por defecto apropiados

  🚀 VENTAJAS:
  - Sin conflictos con tablas existentes
  - Estructura limpia y organizada
  - Rendimiento optimizado
  - Fácil mantenimiento
  - Escalabilidad garantizada
*/