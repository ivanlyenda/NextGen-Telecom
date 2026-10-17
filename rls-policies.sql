-- =========================================================
-- NEXGEN-TELECOM: ROW LEVEL SECURITY (RLS)
-- PostgreSQL / Supabase
-- Cada técnico solo accede a sus propios diagnósticos
-- =========================================================

-- -------------------------------------------------------
-- TABLA: diagnosticos
-- Almacena los reportes de diagnóstico de cada técnico
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnosticos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tecnico_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('latencia', 'fibra', 'bandwidth', 'cmd', 'subnet')),
    resultado JSONB NOT NULL DEFAULT '{}',
    ip_cliente INET,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por técnico (performance)
CREATE INDEX IF NOT EXISTS idx_diagnosticos_tecnico ON diagnosticos(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_tipo ON diagnosticos(tipo);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_fecha ON diagnosticos(created_at DESC);

-- -------------------------------------------------------
-- ACTIVAR ROW LEVEL SECURITY
-- -------------------------------------------------------
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para el dueño de la tabla
ALTER TABLE diagnosticos FORCE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- POLÍTICAS RLS
-- -------------------------------------------------------

-- 1. SELECT: Cada técnico solo ve SUS diagnósticos
CREATE POLICY "tecnico_select_own"
ON diagnosticos
FOR SELECT
USING (auth.uid() = tecnico_id);

-- 2. INSERT: Solo puede crear diagnósticos con su propio ID
CREATE POLICY "tecnico_insert_own"
ON diagnosticos
FOR INSERT
WITH CHECK (auth.uid() = tecnico_id);

-- 3. UPDATE: Solo puede editar sus propios diagnósticos
CREATE POLICY "tecnico_update_own"
ON diagnosticos
FOR UPDATE
USING (auth.uid() = tecnico_id)
WITH CHECK (auth.uid() = tecnico_id);

-- 4. DELETE: Solo puede eliminar sus propios diagnósticos
CREATE POLICY "tecnico_delete_own"
ON diagnosticos
FOR DELETE
USING (auth.uid() = tecnico_id);

-- -------------------------------------------------------
-- TABLA: historial_comandos
-- Registra los comandos CMD ejecutados por cada técnico
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial_comandos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tecnico_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comando VARCHAR(255) NOT NULL,
    resultado TEXT,
    ip_objetivo INET,
    exitoso BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE historial_comandos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_comandos FORCE ROW LEVEL SECURITY;

CREATE POLICY "tecnico_historial_select"
ON historial_comandos FOR SELECT
USING (auth.uid() = tecnico_id);

CREATE POLICY "tecnico_historial_insert"
ON historial_comandos FOR INSERT
WITH CHECK (auth.uid() = tecnico_id);

-- -------------------------------------------------------
-- FUNCIÓN: Actualizar timestamp automáticamente
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_diagnosticos_updated
    BEFORE UPDATE ON diagnosticos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------------
-- NOTAS DE SEGURIDAD:
-- 
-- 1. Las políticas RLS garantizan que auth.uid() siempre
--    coincida con tecnico_id, previniendo acceso cruzado.
--
-- 2. En Supabase, auth.uid() se inyecta automáticamente
--    desde el JWT del usuario autenticado.
--
-- 3. El tipo de diagnóstico está validado con CHECK constraint
--    para prevenir inyección de datos arbitrarios.
--
-- 4. INET para IPs valida formato automáticamente.
--
-- 5. JSONB para resultados permite flexibilidad sin
--    sacrificar la capacidad de consulta indexada.
-- -------------------------------------------------------
