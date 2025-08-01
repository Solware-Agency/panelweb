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

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { caseId, token } = req.query

    // Validaciones básicas
    if (!caseId || !token) {
      return res.status(400).json({
        error: 'Parámetros faltantes: caseId y token son requeridos'
      })
    }

    // Verificar token
    if (!isValidToken(token, caseId)) {
      return res.status(401).json({
        error: 'Token inválido o expirado'
      })
    }

    console.log(`[DOWNLOAD-PDF] Intentando descargar PDF para caso: ${caseId}`)

    // Configurar Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[DOWNLOAD-PDF] Variables de entorno de Supabase no configuradas')
      return res.status(500).json({
        error: 'Error de configuración del servidor'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar el PDF en la base de datos usando el caseId
    const { data, error } = await supabase
      .from('medical_records_clean')
      .select('informepdf_url, full_name, code')
      .eq('id', caseId)
      .single()

    if (error) {
      console.error('[DOWNLOAD-PDF] Error en Supabase:', error)
      return res.status(500).json({
        error: 'Error al buscar el documento en la base de datos'
      })
    }

    if (!data?.informepdf_url) {
      console.log(`[DOWNLOAD-PDF] No se encontró PDF para caso: ${caseId}`)
      return res.status(404).json({
        error: 'Documento PDF no encontrado para este caso'
      })
    }

    console.log(`[DOWNLOAD-PDF] PDF encontrado, descargando desde: ${data.informepdf_url}`)

    // Descargar el PDF desde la URL de Supabase
    const response = await fetch(data.informepdf_url)

    if (!response.ok) {
      console.error(`[DOWNLOAD-PDF] Error al descargar PDF: ${response.status}`)
      return res.status(500).json({
        error: 'Error al obtener el archivo PDF desde el servidor'
      })
    }

    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    // Generar nombre del archivo
    const patientName = data.full_name || 'paciente'
    const caseCode = data.code || caseId
    const fileName = `caso_${caseCode}_${patientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    console.log(`[DOWNLOAD-PDF] Descarga exitosa, archivo: ${fileName}`)

    // Devolver el PDF para descarga directa
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    res.send(Buffer.from(buffer))

  } catch (error) {
    console.error('[DOWNLOAD-PDF] Error inesperado:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
} 