-- Script de inicialización para PostgreSQL
-- Se ejecuta automáticamente al crear el contenedor por primera vez

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda de texto
CREATE EXTENSION IF NOT EXISTS "earthdistance"; -- Para búsqueda geográfica
CREATE EXTENSION IF NOT EXISTS "cube"; -- Requerido por earthdistance

-- Crear usuario adicional si es necesario (opcional)
-- CREATE USER viajero_app WITH PASSWORD 'change_in_production';
-- GRANT ALL PRIVILEGES ON DATABASE viajero_conectado TO viajero_app;

-- Configuración inicial
SET timezone = 'America/Bogota';
SET TIME ZONE 'America/Bogota';

-- Mensaje de confirmación
SELECT 'Base de datos Viajero Conectado inicializada correctamente' AS mensaje;
