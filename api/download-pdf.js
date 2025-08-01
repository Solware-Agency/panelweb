import { createClient } from '@supabase/supabase-js'

// Función para verificar token
function isValidToken(token, caseId) {
  return token && caseId && token.length > 10
}

export default async function handler(req, res) {
  // Configurar CORS para Vercel
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const { caseId, token } = req.query

    if (!caseId || !token) {
      return res.status(400).json({ error: 'Parámetros faltantes: caseId y token son requeridos' })
    }

    if (!isValidToken(token, caseId)) {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Error de configuración del servidor - Variables de entorno faltantes' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 🔥 Ya no se usa .order()
    const { data, error: fetchError } = await supabase
      .from('medical_records_clean')
      .select('informepdf_url, full_name, code, token')
      .eq('id', caseId)
      .single()

    if (!data || data.token !== token) {
      return res.status(401).json({ error: 'Token no coincide' })
    }

    if (fetchError) {
      return res.status(500).json({
        error: 'Error al buscar el documento en la base de datos',
        details: fetchError.message
      })
    }

    if (!data || !data.informepdf_url) {
      return res.status(404).json({ error: 'Documento PDF no encontrado para este caso' })
    }

    const response = await fetch(data.informepdf_url)
    if (!response.ok) {
      return res.status(500).json({ error: 'Error al obtener el archivo PDF desde el servidor' })
    }

    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    const patientName = data.full_name || 'paciente'
    const caseCode = data.code || caseId
    const fileName = `caso_${caseCode}_${patientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('[DOWNLOAD-PDF] Error inesperado:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
