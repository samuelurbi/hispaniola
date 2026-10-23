// MODO REVISIÓN (solo la rama `revision-eventos`, el entorno de vista previa en
// Vercel para enviar a revisión). Se ejecuta DESPUÉS del build (ver vercel.json,
// `buildCommand`). 2026-10-23, pedido de Samuel: una copia de la web para
// revisar NO puede indexarse, ni contar visitas en analítica real, ni hablar
// con el Odoo de producción. Mismo patrón que la vista previa de Food & Bar.
//
//   1. noindex: robots.txt con Disallow total + <meta robots> (y la cabecera
//      X-Robots-Tag, en vercel.json).
//   2. Sin analítica: fuera GTM (2 contenedores), gtag y Clarity del index.html.
//   3. Sin backend: comprueba que el bundle NO contiene el dominio del Odoo de
//      producción (VITE_API_URL se fuerza a un host inválido en vercel.json,
//      que gana al `.env.production` del repo). Si lo contiene, el build FALLA:
//      mejor sin vista previa que una que pueda cobrar.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = join(dist, 'index.html')
let html = readFileSync(indexPath, 'utf8')

const antes = html.length
html = html
  .replace(/<script\b[^>]*googletagmanager\.com[^>]*><\/script>/g, '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (b) => (/googletagmanager|gtag\(|clarity/i.test(b) ? '' : b))
  .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/g, (b) => (/googletagmanager/i.test(b) ? '' : b))
// Los comentarios que documentan esos bloques (con los IDs a la vista) también fuera.
html = html.replace(/<!--[\s\S]*?-->/g, (b) => (/googletagmanager|gtag|GTM-|clarity|G-M99L0GE3VK/i.test(b) ? '' : b))
html = html.replace('<head>', '<head>\n    <meta name="robots" content="noindex, nofollow, noarchive" />')
writeFileSync(indexPath, html)
writeFileSync(join(dist, 'robots.txt'), '# Entorno de revisión: no indexar.\nUser-agent: *\nDisallow: /\n')
console.log(`modo-revision: index.html ${antes} → ${html.length} bytes, sin analítica; robots.txt Disallow total`)

// Ni rastro de analítica en lo que queda.
if (/googletagmanager|gtag\(|G-M99L0GE3VK|GTM-/i.test(html)) {
  console.error('modo-revision: FALLO — queda analítica en index.html')
  process.exit(1)
}

// El bundle no puede apuntar al Odoo de producción.
const PROD = 'sistemashispaniola.com'
const stack = [dist]
let hallazgos = 0
while (stack.length) {
  const d = stack.pop()
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) {
      if (e.name !== 'fotos' && e.name !== 'video') stack.push(p)
    } else if (/\.(js|html|css|json|txt|xml)$/.test(e.name) && readFileSync(p, 'utf8').includes(PROD)) {
      hallazgos++
      console.error('⚠️ contiene el Odoo de producción:', p)
    }
  }
}
if (hallazgos) {
  console.error('modo-revision: FALLO — el bundle apunta a producción')
  process.exit(1)
}
console.log('modo-revision: ✅ el bundle no contiene el dominio del Odoo de producción ni analítica')
