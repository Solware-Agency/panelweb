/*
  # Actualizar campo de teléfono a máximo 15 caracteres

  1. Cambios en la tabla
    - Modificar la columna `phone` para tener un límite de 15 caracteres
    - Agregar una restricción CHECK para validar la longitud

  2. Validación
    - Asegurar que todos los números de teléfono existentes cumplan con el nuevo límite
    - Agregar validación para futuros registros
*/

-- Modificar la columna phone para tener un límite de 15 caracteres
ALTER TABLE medical_records 
ALTER COLUMN phone TYPE varchar(15);

-- Agregar una restricción CHECK para validar la longitud del teléfono
ALTER TABLE medical_records 
ADD CONSTRAINT check_phone_length 
CHECK (char_length(phone) <= 15 AND char_length(phone) >= 1);

-- Agregar comentario para documentar el cambio
COMMENT ON COLUMN medical_records.phone IS 'Número de teléfono del paciente (máximo 15 caracteres)';