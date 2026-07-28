import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { COCINA_PREMIUM } from '@/data/flota'
import { COCINA_FLOTANTE, EXPERIENCIA_ABORDO } from '@/data/nosotros'

// LA COCINA FLOTANTE Y LAS 3 PARADAS, EN CLAVE PREMIUM (slides 32-34).
//
// Slide 32, nota del cliente: «Además destacar esta sección dado que ser la
// única cocina flotante de Punta Cana hay que destacarlo». Slide 33 es la
// maqueta de Samuel de esa misma sección en oscuro. Slide 34, las 3 paradas.
//
// ⚠️ EL TEMA OSCURO NO ES EL ENCARGO. Samuel, literal: «cuando lo pone así en
// tema oscuro es porque quiere darle una estética premium, lujosa; podemos
// usar colores oscuros pero es primordial que esté bien pesado y que se vea
// elegante y premium, NO SOLO TEMA OSCURO, ya que el sentimiento a transmitir
// es eso, premium».
//
// Poner el fondo en negro es media hora; que se lea caro es lo otro. Lo que
// separa una cosa de la otra, y que es lo que se ha aplicado aquí:
//
//   1. EL AIRE. La banda respira el doble que cualquier sección clara del
//      sitio (py-20 → py-32 en desktop, contra los ~7rem de --spacing-seccion).
//      El lujo se lee primero en el espacio vacío y solo después en el color:
//      una sección oscura apretada parece una alerta, no una boutique.
//   2. EL ORO, CON CUENTAGOTAS Y SOLO EN LO CORTO. Va en el eyebrow, en UNA
//      palabra del titular, en las cifras y en los numerales de las paradas.
//      Nunca en párrafos: --color-premium-oro sobre el fondo da 6,4:1 —pasa
//      AA— pero a 16px y en texto corrido cansa la vista en dos líneas. Los
//      párrafos van en --color-premium-texto-suave, que es lo que ese token
//      existe para hacer.
//   3. HAIRLINES, NO BORDES. --color-premium-borde es oro al 22%: separa sin
//      dibujar una reja. Cuatro cajas con contorno visible sobre negro es
//      exactamente el aspecto de panel de administración que hay que evitar.
//   4. LAS FOTOS MANDAN. Son lo ÚNICO saturado del bloque y van en mosaico de
//      alturas distintas, no en una rejilla regular. Sobre un fondo casi
//      negro, una foto de comida a la parrilla es la que hace el trabajo.
//   5. NADA DE CORAL AQUÍ DENTRO salvo el CTA. El coral es el color de
//      «reservar» en todo el sitio y quitárselo al botón lo escondería; pero
//      un segundo elemento coral dentro de la banda rompería la unidad de la
//      paleta premium.
//
// ── DE DÓNDE SALEN LOS TOKENS ────────────────────────────────────────────
// La familia --color-premium-* nació en las correcciones v2 para el paquete
// Premium de la ficha de tour (widget, comparador y menú). Su comentario en
// tokens.css avisa: «ES UN MODO DE PRODUCTO, NO UNA PALETA DE MARCA. Vive
// SOLO donde se vende Premium». Esta banda es la SEGUNDA superficie que los
// usa y el motivo es el mismo —vender lo caro—, así que el token no se
// desvirtúa; pero conviene saber que ya no es exclusivo de la ficha. Si
// mañana la paleta premium se retoca, esta sección se entera.
//
// ── EL COPY NO SE DUPLICA ────────────────────────────────────────────────
// `COCINA_FLOTANTE` y `EXPERIENCIA_ABORDO` se importan de data/nosotros.ts:
// son los mismos textos que pinta /instalaciones en su versión clara. Aquí
// solo vive lo que el formato premium AÑADE (la palabra de acento, las 3
// cifras, la tira de fotos), en data/flota.ts §5.
//
// ⚠️ DUPLICACIÓN A RESOLVER CON SAMUEL: /instalaciones monta hoy
// `nosotros/experiencia-abordo.tsx`, que cuenta la cocina flotante y las 3
// paradas en claro. El copy es el mismo (fuente única), pero el visitante que
// pase por las dos páginas lo verá dos veces. Hay que decidir cuál se queda
// con la sección; no se toca /instalaciones aquí porque no estaba en el
// encargo.
export function CocinaFlotantePremium() {
  // El titular se parte en tres para poder dorar una sola palabra. Se parte
  // aquí y no con markup en el dato para que `COCINA_FLOTANTE.titulo` siga
  // siendo texto plano y reutilizable por la versión clara.
  const acento = COCINA_PREMIUM.palabraAcento
  const [antes, ...resto] = COCINA_FLOTANTE.titulo.split(acento)
  const despues = resto.join(acento)

  return (
    <section className="relative overflow-hidden bg-premium-fondo">
      {/* Halo de oro muy rebajado detrás del bloque de texto. Es lo que impide
          que el fondo se lea como un rectángulo negro plano: una superficie
          cara siempre tiene algo de luz cayendo sobre ella. Va en `style` y no
          en una clase porque es una relación con el token, no un valor suelto
          (mismo criterio que el degradado de home/eco-friendly.tsx). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 75% 0%, var(--color-premium-oro-suave), transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex max-w-contenido flex-col gap-16 px-5 py-20 sm:px-10 lg:gap-24 lg:py-32">
        {/* ── LÍNEA DE APERTURA ────────────────────────────────────────────
            El slide 33 abre con una frase suelta y centrada arriba del todo.
            Va sobre hairline de oro: es el gesto más barato que existe para
            decir «aquí empieza otra cosa» sin cambiar de página. */}
        <p className="border-t border-premium-borde pt-6 text-center text-sm text-premium-texto-suave">
          Lo que vives con nosotros no lo vives en cualquier excursión.
        </p>

        {/* ── LA COCINA FLOTANTE ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* MOSAICO. Tamaños distintos a propósito (una grande arriba a todo
              el ancho + dos apaisadas debajo): una rejilla regular de 3 fotos
              iguales se lee como un catálogo, y esto tiene que leerse como una
              portada.
              ⚠️ LA GRANDE VA APAISADA, NO VERTICAL. El primer montaje seguía
              la maqueta al pie (columna alta a la izquierda) y quedaba mal por
              el ARCHIVO, no por el diseño: `cocina-flotante.webp` es 600×419 y
              tiene la comida en la mitad inferior, así que un recorte 3/4 se
              queda con los torsos de los dos huéspedes y tira la bandeja de
              mariscos fuera de cuadro — justo lo contrario de «premium». En
              apaisado entra la escena entera, que es la foto que vende. */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <figure className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-card ring-1 ring-premium-borde">
              <img
                src={`/fotos/${COCINA_FLOTANTE.foto}.webp`}
                alt={COCINA_FLOTANTE.fotoAlt}
                loading="lazy"
                className="size-full object-cover"
              />
              {/* Badge en oro sobre relleno translúcido, no en blanco: es el
                  único elemento de UI encima de la foto y tiene que pertenecer
                  a la paleta de la banda. */}
              <figcaption className="absolute left-3 top-3 rounded-chip bg-premium-fondo/85 px-3 py-1 text-xs font-semibold text-premium-oro ring-1 ring-premium-borde backdrop-blur-sm">
                {COCINA_FLOTANTE.badge}
              </figcaption>
            </figure>
            <figure className="aspect-[4/3] overflow-hidden rounded-card ring-1 ring-premium-borde">
              <img
                src="/fotos/cocina-flotante-plataforma.webp"
                alt="La plataforma de la cocina flotante vista desde el agua"
                loading="lazy"
                className="size-full object-cover"
              />
            </figure>
            <figure className="aspect-[4/3] overflow-hidden rounded-card ring-1 ring-premium-borde">
              <img
                src="/fotos/bar-flotante.webp"
                alt="El bar flotante durante el servicio de bebidas"
                loading="lazy"
                className="size-full object-cover"
              />
            </figure>
          </div>

          <div>
            {/* Eyebrow con guion de oro delante. NO usa `ui/etiqueta.tsx`: ese
                componente solo conoce dos contextos (papel y foto/navy) y aquí
                el acento no es el aqua de marca sino el oro del modo premium.
                Meterle una tercera variante lo convertiría en el sitio donde
                vive la paleta premium, que es justo lo que tokens.css pide que
                no pase. */}
            <p className="flex items-center gap-3 text-eyebrow font-semibold uppercase tracking-[0.18em] text-premium-oro">
              <span aria-hidden="true" className="h-px w-8 bg-premium-oro/60" />
              {COCINA_FLOTANTE.eyebrow}
            </p>

            <h2 className="mt-5 max-w-xl text-balance font-display text-h2 font-semibold text-premium-texto">
              {antes}
              <em className="not-italic text-premium-oro">{acento}</em>
              {despues}
            </h2>

            <p className="mt-5 max-w-xl text-lead text-premium-texto-suave">{COCINA_FLOTANTE.texto}</p>

            {/* LOS 3 PUNTOS. Sin check dentro de un círculo relleno (el patrón
                claro del sitio): sobre negro, tres discos de color se leen
                como semáforos. Un anillo fino de oro con un punto dentro pesa
                lo justo. */}
            <ul className="mt-8 flex flex-col divide-y divide-premium-borde border-y border-premium-borde">
              {COCINA_FLOTANTE.puntos.map((punto) => (
                <li key={punto} className="flex items-center gap-4 py-4 text-premium-texto">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full ring-1 ring-premium-oro/45"
                  >
                    <span className="size-1.5 rounded-full bg-premium-oro" />
                  </span>
                  <span className="text-sm font-medium">{punto}</span>
                </li>
              ))}
            </ul>

            <Link
              to={COCINA_PREMIUM.cta.to}
              className="group mt-8 inline-flex items-center gap-2 rounded-btn bg-coral px-6 py-3.5 text-sm font-semibold text-white shadow-boton-fancy transition hover:bg-coral-dark"
            >
              {COCINA_PREMIUM.cta.label}
              <ArrowRight
                className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* ── «MÍRALO POR DENTRO» ─────────────────────────────────────────
            Tira horizontal, no rejilla: es material de apoyo y una rejilla lo
            ascendería al mismo rango que el mosaico de arriba. `scroll-sutil`
            reutiliza el scrollbar fino del widget de reserva (la barra por
            defecto sobre fondo oscuro canta demasiado) y
            `scroll-sutil-premium` le cambia el pulgar a oro: el navy del base
            desaparece del todo sobre este fondo. */}
        <div>
          <div className="flex items-end justify-between gap-4 border-b border-premium-borde pb-4">
            <h3 className="font-display text-lead font-semibold text-premium-texto">
              Míralo por dentro — fotos y vídeo
            </h3>
            <p className="shrink-0 text-xs text-premium-texto-suave">desliza para ver más</p>
          </div>
          <ul className="scroll-sutil scroll-sutil-premium mt-5 flex gap-4 overflow-x-auto pb-2">
            {COCINA_PREMIUM.galeria.map((item) => (
              <li key={item.foto} className="w-56 shrink-0 sm:w-64">
                <figure className="aspect-[4/3] overflow-hidden rounded-card ring-1 ring-premium-borde">
                  <img
                    src={`/fotos/${item.foto}.webp`}
                    alt={item.pie}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </figure>
                <p className="mt-2.5 text-xs text-premium-texto-suave">{item.pie}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── LAS 3 CIFRAS (pie del slide 33) ────────────────────────────── */}
        <dl className="grid grid-cols-1 gap-y-8 border-y border-premium-borde py-10 sm:grid-cols-3 sm:gap-y-0 sm:divide-x sm:divide-premium-borde">
          {COCINA_PREMIUM.cifras.map((c) => (
            <div key={c.cifra} className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <dt className="font-display text-h2 font-semibold text-premium-oro">{c.cifra}</dt>
              <dd className="mt-2 max-w-xs text-sm text-premium-texto-suave">{c.label}</dd>
            </div>
          ))}
        </dl>

        {/* ── LAS 3 PARADAS (slide 34, aquí en premium) ─────────────────── */}
        <div>
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-eyebrow font-semibold uppercase tracking-[0.18em] text-premium-oro">
              <span aria-hidden="true" className="h-px w-8 bg-premium-oro/60" />
              {COCINA_PREMIUM.paradasEyebrow}
            </p>
            <h3 className="mt-5 text-balance font-display text-h2 font-semibold text-premium-texto">
              {COCINA_PREMIUM.paradasTitulo}
            </h3>
            <p className="mt-4 text-lead text-premium-texto-suave">{COCINA_PREMIUM.paradasSub}</p>
          </div>

          {/* Cards sobre --color-premium-superficie: un escalón por encima del
              fondo, sin sombra. Una sombra sobre negro no se ve; lo que separa
              la card del fondo es que su superficie es MÁS CLARA, más el
              hairline de oro. */}
          <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {EXPERIENCIA_ABORDO.map((parada) => (
              <li
                key={parada.numero}
                className="flex flex-col overflow-hidden rounded-card-grande bg-premium-superficie p-2.5 ring-1 ring-premium-borde"
              >
                <div className="relative aspect-[16/11] overflow-hidden rounded-card">
                  <img
                    src={`/fotos/${parada.foto}.webp`}
                    alt={parada.fotoAlt}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  {/* El numeral, en oro y grande, sobre un velo. Es lo que las
                      lee como una SECUENCIA y no como tres cosas al azar. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-premium-fondo/85 to-transparent"
                  />
                  <span className="absolute bottom-3 left-4 font-display text-h2 font-semibold text-premium-oro">
                    {parada.numero}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-4">
                  <h4 className="font-display text-h3 font-semibold text-premium-texto">{parada.titulo}</h4>
                  <p className="text-sm text-premium-texto-suave">{parada.texto}</p>
                  {/* Crédito de la fundación — solo la parada del vivero lo
                      tiene. `mt-auto` lo pega abajo para que las 3 cards rimen
                      aunque las otras dos no lleven chip. */}
                  {parada.chip ? (
                    <span className="mt-auto self-start rounded-chip bg-premium-oro-suave px-3 py-1.5 text-xs font-medium text-premium-oro">
                      {parada.chip}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
