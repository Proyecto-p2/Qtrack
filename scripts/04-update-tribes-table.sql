-- Script para actualizar la tabla tribes con FK a usuarios
USE qtrack;

-- 1. Agregar nueva columna para el FK
ALTER TABLE tribes ADD COLUMN lead_user_id CHAR(36);

-- 2. Agregar la foreign key constraint
ALTER TABLE tribes ADD CONSTRAINT fk_tribes_lead_user 
  FOREIGN KEY (lead_user_id) REFERENCES usuarios(id);

-- 3. Opcionalmente mantener leadName por compatibilidad pero marcarlo como deprecated
-- ALTER TABLE tribes MODIFY COLUMN leadName VARCHAR(255) COMMENT 'DEPRECATED: Use lead_user_id instead';

-- 4. Actualizar registros existentes (mapear nombres a IDs si es posible)
-- UPDATE tribes SET lead_user_id = (SELECT id FROM usuarios WHERE nombre = tribes.leadName LIMIT 1);
