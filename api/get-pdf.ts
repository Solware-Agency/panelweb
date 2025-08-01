import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 1. Validación más estricta de variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(`
    Missing Supabase credentials. Ensure you have:
    - VITE_SUPABASE_URL or SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY
    configured in your environment variables.
  `);
}

// 2. Configuración mejorada de Supabase
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false, // Importante para funciones serverless
    autoRefreshToken: false
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 3. Headers de seguridad recomendados
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      allowedMethods: ['GET']
    });
  }

  // 4. Validación mejorada del token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Invalid authorization format',
      expectedFormat: 'Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.length < 50) { // Longitud mínima aproximada de un JWT
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 5. Sanitización del filename
  const { filename } = req.query;
  if (!filename || typeof filename !== 'string' || !/^[\w.-]+\.pdf$/i.test(filename)) {
    return res.status(400).json({ 
      error: 'Invalid filename',
      expectedFormat: 'Alphanumeric with .pdf extension'
    });
  }

  try {
    // 6. Validación adicional del token con Supabase
    const { error: authError } = await supabase.auth.getUser(token);
    if (authError) throw new Error('Invalid token');

    // 7. Generación de URL con tiempo ajustable según entorno
    const expiresIn = process.env.NODE_ENV === 'production' ? 30 : 120; // 30s prod, 2min dev
    const { data: signedUrlData, error } = await supabase.storage
      .from('assets')
      .createSignedUrl(`Informes/${filename}`, expiresIn);

    if (error || !signedUrlData?.signedUrl) {
      console.error('Supabase Storage Error:', error);
      throw error || new Error('Failed to generate signed URL');
    }

    // 8. Auditoría de acceso (opcional)
    console.log(`PDF accessed: ${filename} by user: ${token.substring(0, 8)}...`);

    // 9. Redirección con headers de seguridad
    return res
      .setHeader('X-Content-Type-Options', 'nosniff')
      .redirect(307, signedUrlData.signedUrl);

  } catch (error) {
    console.error('PDF Proxy Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : String(error)
        : undefined // No exponer detalles en producción
    });
  }
}