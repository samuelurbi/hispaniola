import { useRef, useState } from 'react'
import { Footer } from '@/components/home/footer'
import { HeroInterna } from '@/components/internas/hero-interna'
import { CabeceraInterna } from '@/components/internas/cabecera-interna'
import { FamiliaHispaniola } from '@/components/flota/familia-hispaniola'
import { FlotaGrid } from '@/components/flota/flota-grid'
import { BannerCeroPlastico } from '@/components/flota/banner-cero-plastico'
import { CocinaFlotantePremium } from '@/components/flota/cocina-flotante-premium'
import { useTimelineHistoria } from '@/components/nosotros/use-timeline-historia'
import { useCascadaNosotros } from '@/components/nosotros/use-cascada-nosotros'
import { useDevFlag } from '@/dev/use-dev-flag'
import { Meta } from '@/components/seo/meta'

// Página Flota (/flota) — correcciones v2, plan 04.
//
// La flota deja de ser una sección de /nosotros y pasa a página propia, porque
// el menú nuevo la pone como destino («Nosotros → Tripulación · Instalaciones ·
// Flota», reunión del 07-24).
//
// ⚠️ NO hay teaser en /nosotros: esa página DESAPARECE. El cliente lo confirmó
// en la reunión (29:02): «no va a haber una página única de nosotros, sino
// estas tres cosas». `/nosotros` redirige aquí desde App.tsx — la ruta vieja no
// devuelve 404 porque está indexada.
//
// ── ITERACIÓN v2 (2026-07-28) ────────────────────────────────────────────
//
// La primera versión de esta página era el grid heredado + la línea de tiempo
// + el banner de arrecife: de las 10 slides que el PDF dedica a /flota solo
// estaba aplicado el «sale a página propia». Samuel pidió aplicar el resto.
// El ORDEN de arriba abajo lo dictó él («la presentación de la familia […]
// agregar aquí el tema del dueño y el recorrido de años, luego las cards de
// los botes […] luego el resto de card y el banner»):
//
//   1. FamiliaHispaniola   — presentación + dueño + recorrido de años (slides
//                            26-27). Reemplaza a `NuestraHistoria`, cuyo panel
//                            de la cita se absorbe aquí (ver ese componente).
//   2. FlotaGrid           — las cards nuevas: vídeo por defecto, mini-galería,
//                            360º y ficha técnica en modal (slide 28).
//   3. BannerCeroPlastico  — el banner de cierre, reenfocado (slide 30).
//                            Sustituye a `ArrecifeTeaser`: el CTA sigue
//                            llevando a /sostenibilidad, así que el enlace
//                            interno no se pierde, solo deja de ser el titular.
//   4. CocinaFlotantePremium — la cocina flotante y las 3 paradas en clave
//                            premium (slides 32-34).
//
// ⚠️ POR QUÉ EL BLOQUE PREMIUM VA FUERA DEL CONTENEDOR. Es la única sección
// A SANGRE de la página: su fondo tiene que llegar a los dos bordes del
// viewport para que se lea como un cambio de ambiente y no como una card
// negra muy grande. Por eso vive fuera del `mx-auto max-w-contenido` y se
// re-centra por dentro con el mismo ancho — mismo patrón que usa el hero.
//
// Va el ÚLTIMO, después del banner: cierra la página con la pieza de más peso
// visual en lugar de dejarla enterrada entre dos bloques claros, y de paso
// aterriza contra el footer (navy) sin un salto de blanco entre medias.
export function FlotaPage() {
  const contenidoRef = useRef<HTMLDivElement>(null)

  // [dev-mode] ?dev-flota=estatico congela los efectos de scroll en su estado
  // FINAL (línea de tiempo trazada, cards ya asentadas) → frame limpio para
  // Figma. Coincide con lo que ve quien tiene prefers-reduced-motion. Antes
  // este flag era `?dev-nosotros=estatico`, heredado de la página de la que
  // salió esta; se renombra porque /nosotros ya no existe y el nombre viejo
  // mandaba a leer una página retirada. Ver dev-registry.ts.
  const [estatico, setEstatico] = useState(false)
  useDevFlag('dev-flota', (v) => setEstatico(v === 'estatico')) // [dev-mode]
  useTimelineHistoria(contenidoRef, { activo: !estatico }) // [dev-mode] gate
  useCascadaNosotros(contenidoRef, { activo: !estatico }) // [dev-mode] gate

  return (
    <div>
      <Meta
        titulo="Nuestra flota"
        descripcion="Las embarcaciones de Hispaniola Aquatic Adventures: catamaranes de vela y motor, lanchas y el catamarán de eventos, con vídeo, galería y ficha técnica completa de cada una."
        ruta="/flota"
      />
      <HeroInterna ctaHref="/#tours">
        <CabeceraInterna
          eyebrow="Nuestra flota"
          titulo="Los barcos que hacen el día"
          lead="Catamaranes de vela y de motor, lanchas rápidas y nuestro catamarán de eventos. Todos propios, todos con cocina flotante a bordo."
        />
      </HeroInterna>

      <div ref={contenidoRef} className="mx-auto max-w-contenido px-5 py-12 sm:px-10 lg:py-16">
        <div className="flex flex-col gap-16 lg:gap-24">
          <FamiliaHispaniola />
          <FlotaGrid />
          <BannerCeroPlastico />
        </div>
      </div>

      <CocinaFlotantePremium />

      <Footer />
    </div>
  )
}
