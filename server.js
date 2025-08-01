import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DOMAIN = process.env.DOMAIN || 'panel.solware.agency'

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Desarrollo
    'http://localhost:3000', // Desarrollo alternativo
    'https://panel.solware.agency', // Producción
    'https://www.panel.solware.agency' // Producción con www
  ],
  credentials: true
}))
app.use(express.json())

// Configurar Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Función para verificar token
function isValidToken(token, caseId) {
  return token && caseId && token.length > 10
}

// Endpoint para descarga de PDF
app.get('/api/download-pdf', async (req, res) => {
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
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })

    res.send(Buffer.from(buffer))

  } catch (error) {
    console.error('[DOWNLOAD-PDF] Error inesperado:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Servir archivos estáticos de React
app.use(express.static('dist'))

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const baseUrl = isProduction
    ? `https://${DOMAIN}`
    : `http://localhost:${PORT}`

  console.log(`🚀 Servidor corriendo en ${baseUrl}`)
  console.log(`📥 Endpoint de descarga: ${baseUrl}/api/download-pdf`)
  console.log(`🌍 Entorno: ${isProduction ? 'Producción' : 'Desarrollo'}`)
}) 