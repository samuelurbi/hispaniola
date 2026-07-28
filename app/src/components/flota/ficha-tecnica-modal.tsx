import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import * as Modal from '@/components/alignui/modal'
import { fichaTecnicaDe, titularesTecnicos } from '@/data/flota'
import type { BarcoFlota } from '@/data/nosotros'

// LA FICHA TÉCNICA COMPLETA — el modal del botón secundario de la card
// (slide 28: «Ver ficha técnica completa»).
//
// Pedido de Samuel: «que abra un modal con toda la info técnica que puede
// tener un bote […] investiga qué tipo de información puede ir aquí realista
// y diagrámala y jerarquízala como si fuera la info final, que esté bien
// explicada, bien técnica, para alguien que le interesa este tipo de cosas».
//
// ── CÓMO SE JERARQUIZA (que es el encargo de verdad, no la lista) ────────
//
// Una ficha técnica de verdad tiene 60-80 datos. Volcarlos en una tabla larga
// es tenerlos, no comunicarlos. Aquí van en TRES NIVELES de lectura, y cada
// visitante para donde le interesa:
//
//   NIVEL 1 · Los 4 titulares (eslora · pasaje · año · potencia). Se leen sin
//     scroll y contestan «¿es el barco que me imaginaba?».
//   NIVEL 2 · Los 9 bloques temáticos, con su ÍNDICE lateral fijo. Quien
//     viene a mirar seguridad va directo a seguridad sin leer propulsión.
//   NIVEL 3 · Cada fila lleva su `nota`: qué significa el dato para quien va
//     a bordo. Un calado de 0,95 m no le dice nada a nadie; «poco calado =
//     puede acercarse a la playa» sí. Es lo que separa una ficha técnica
//     ÚTIL de un volcado de la documentación del armador.
//
// El orden de los bloques no es alfabético ni caprichoso: es el orden en que
// un armador describe un barco (identidad → medidas → capacidad → motor →
// sistemas → electrónica → seguridad → confort → sostenibilidad). Ver el
// comentario largo de data/flota.ts §3.
//
// ── SIN CARTEL DE «DATOS DE EJEMPLO» ─────────────────────────────────────
// (Samuel, 2026-07-28: «quita de la ficha lo que dice que son datos de
// ejemplo» — mismo criterio con el que se quitó el aviso del visor de 360º.)
// El modal llevaba un banner arriba explicando la procedencia y un punto aqua
// por fila; los dos se retiran: la maqueta enseña la página, no sus andamios.
//
// ⚠️ La REGLA sigue intacta donde importa: las filas sin fuente siguen
// diciendo «Pendiente — sin dato documentado» en vez de un número verosímil, y
// la marca de qué está verificado vive en el dato (`origen`, data/flota.ts).
// Se quitó el cartel, no la criba.
export function FichaTecnicaModal({ barco, onCerrar }: { barco: BarcoFlota; onCerrar: () => void }) {
  const grupos = fichaTecnicaDe(barco)
  const titulares = titularesTecnicos(barco).filter((t) => t.valor)
  const [activo, setActivo] = useState(grupos[0]?.id ?? '')
  const cuerpoRef = useRef<HTMLDivElement>(null)

  // Devolver el foco al disparador al cerrar. Misma trampa (y mismo arreglo)
  // que en galeria-lightbox.tsx: el Root se desmonta por render condicional
  // del padre, así que Radix no llega a restaurarlo y el foco cae a BODY.
  useEffect(() => {
    const disparador = document.activeElement as HTMLElement | null
    return () => disparador?.focus()
  }, [])

  // ⚠️ EL RESALTADO ESTABA ROTO Y ESTE ES EL PORQUÉ (Samuel, 2026-07-28: «no
  // está funcionando que se marca activo el punto donde voy»).
  //
  // La versión anterior comparaba `el.offsetTop` contra `cuerpo.scrollTop`, y
  // esas dos medidas NO están en el mismo sistema de referencia: `offsetTop`
  // se mide desde el `offsetParent`, que es el ancestro POSICIONADO más
  // cercano — y el contenedor de scroll no lleva `position`, así que el
  // offsetParent acababa siendo el panel del diálogo (que sí está
  // posicionado). Resultado: a las medidas les sobraba la altura de la
  // cabecera, la comparación nunca cuadraba y el activo se quedaba clavado.
  //
  // Se mide con `getBoundingClientRect()` de la sección MENOS el del
  // contenedor, más el scroll actual. Eso da la posición real dentro del
  // scroller sea cual sea el offsetParent, y sirve igual para el salto.
  //
  // No se puede reutilizar `ui/use-anclas-activa.ts` (el scroll-spy de la
  // ficha de tour y de /ventaja-competitiva): ese escucha el scroll de
  // `window` y mide contra el viewport, y aquí quien scrollea es un div. Es
  // la misma idea con otro sistema de coordenadas.
  const topEnScroller = (cuerpo: HTMLElement, el: HTMLElement) =>
    el.getBoundingClientRect().top - cuerpo.getBoundingClientRect().top + cuerpo.scrollTop

  useEffect(() => {
    const cuerpo = cuerpoRef.current
    if (!cuerpo) return

    let raf = 0
    const recalcular = () => {
      raf = 0
      let visible = grupos[0]?.id ?? ''
      for (const g of grupos) {
        const el = cuerpo.querySelector<HTMLElement>(`#spec-${g.id}`)
        // +24 de holgura: el mismo margen con el que aterriza un salto, para
        // que la sección recién clicada cuente ya como cruzada (si la línea
        // quedara por encima del aterrizaje, se activaría la de arriba).
        if (el && topEnScroller(cuerpo, el) <= cuerpo.scrollTop + 24) visible = g.id
      }
      // Al fondo gana la última aunque su tope no haya cruzado: los bloques
      // cortos del final no se alcanzarían nunca. Mismo criterio que el
      // scroll-spy de la ficha de tour.
      if (cuerpo.scrollTop + cuerpo.clientHeight >= cuerpo.scrollHeight - 2) {
        visible = grupos[grupos.length - 1]?.id ?? visible
      }
      setActivo(visible)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(recalcular)
    }

    recalcular()
    cuerpo.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cuerpo.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [grupos])

  // Salto desde el índice. `scrollTop` a mano y no `scrollIntoView`: ese
  // método hace scroll de TODOS los ancestros scrolleables y acabaría
  // moviendo también la página de detrás (misma razón que la tira de
  // miniaturas del lightbox de la ficha de tour).
  const irA = (id: string) => {
    const cuerpo = cuerpoRef.current
    const el = cuerpo?.querySelector<HTMLElement>(`#spec-${id}`)
    if (!cuerpo || !el) return
    cuerpo.scrollTo({
      top: topEnScroller(cuerpo, el) - 16,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  const destino = barco.cta === 'charter' ? '/tours/charter-privado' : '/eventos/bodas'
  const etiquetaCta = barco.cta === 'charter' ? 'Ver tours con este barco' : 'Cotizar para tu evento'

  return (
    <Modal.Root open onOpenChange={(abierto) => (abierto ? undefined : onCerrar())}>
      <Modal.Content
        overlayClassName="bg-navy/55 p-4 backdrop-blur-md"
        // De la card de 400px del vendor a un panel ancho: la ficha es una
        // tabla de dos columnas con índice al lado, y a 400px el índice no
        // cabe. `max-h-[88dvh]` + `flex-col` para que solo scrollee el cuerpo
        // y la cabecera con los titulares se quede siempre a la vista.
        className="flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-card-grande"
        aria-describedby={undefined}
      >
        {/* ── CABECERA (nivel 1) ─────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-linea px-5 pb-4 pt-5 sm:px-7">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.12em] text-aqua-dark">
            Ficha técnica completa
          </p>
          {/* `pr-10` deja sitio al botón de cerrar del vendor, que va absoluto
              en la esquina — sin él, el nombre le pasa por debajo. */}
          <Modal.Title className="mt-1 pr-10 font-display text-h2 font-semibold text-navy">
            {barco.nombre}
          </Modal.Title>
          <p className="mt-1 text-sm text-navy-sub">{barco.tipo}</p>

          {titulares.length > 0 ? (
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-linea sm:grid-cols-4">
              {titulares.map((t) => (
                <div key={t.label} className="flex items-center gap-3 bg-papel-hueso px-4 py-3">
                  <t.icono className="size-4 shrink-0 text-aqua-dark" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-navy-soft">{t.label}</dt>
                    <dd className="truncate font-display text-sm font-semibold text-navy">{t.valor}</dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {/* ── CUERPO (niveles 2 y 3) ─────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1">
          {/* ÍNDICE LATERAL, SIMPLIFICADO (Samuel, 2026-07-28: «me parece un
              poco confuso el menú lateral, vamos a intentar simplificarlo»).
              Dos cosas fuera y una más estrecha:

                · TÍTULOS CORTOS (`tituloCorto`): con los largos, 6 de los 9
                  ítems partían en DOS líneas. Un índice que envuelve deja de
                  leerse como una lista de saltos y empieza a leerse como un
                  segundo párrafo — que es exactamente la confusión reportada.
                · SIN ICONOS: eran los mismos 9 iconos que ya encabezan cada
                  bloque a la derecha, así que no añadían información, solo una
                  columna más que escanear. Se quedan donde sí orientan.
                · 12rem en vez de 14: con una palabra por ítem sobra, y el
                  contenido —que es lo que se viene a leer— gana ese ancho.

              Solo desde lg: en móvil ocuparía media pantalla para navegar 9
              anclas que se recorren con el pulgar igual de rápido. */}
          <nav aria-label="Secciones de la ficha técnica" className="hidden w-48 shrink-0 border-r border-linea py-4 lg:block">
            <ul className="flex flex-col">
              {grupos.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => irA(g.id)}
                    aria-current={activo === g.id}
                    // Barra de selección ABSOLUTA (no un border-l que empuje):
                    // marcar el activo no debe desplazar el texto un píxel.
                    className={`relative flex w-full py-2 pl-5 pr-3 text-left text-sm transition ${
                      activo === g.id ? 'font-semibold text-navy' : 'text-navy-soft hover:text-navy-sub'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-1 left-0 w-0.5 rounded-full transition ${
                        activo === g.id ? 'bg-aqua' : 'bg-transparent'
                      }`}
                    />
                    {g.tituloCorto}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div ref={cuerpoRef} className="scroll-sutil min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-9">
              {grupos.map((g) => (
                <section key={g.id} id={`spec-${g.id}`}>
                  <h3 className="flex items-center gap-2.5 font-display text-h3 font-semibold text-navy">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-aqua-tint text-aqua-dark">
                      <g.icono className="size-4" aria-hidden="true" />
                    </span>
                    {g.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-navy-sub">{g.intro}</p>

                  {/* La tabla. `divide-y` en vez de bordes por fila: una sola
                      línea entre filas, sin doblar el hairline arriba y abajo. */}
                  <dl className="mt-4 divide-y divide-linea border-y border-linea">
                    {g.filas.map((fila) => (
                      <div key={fila.label} className="grid grid-cols-1 gap-x-6 gap-y-1 py-3 sm:grid-cols-[13rem_1fr]">
                        {/* Sin el punto de «dato verificado»: se retira con el
                            cartel que lo explicaba (ver la cabecera). Un punto
                            de color sin leyenda no dice nada — sería ruido. */}
                        <dt className="text-sm text-navy-soft">{fila.label}</dt>
                        <dd className="min-w-0">
                          {fila.valor ? (
                            <span className="text-sm font-medium text-navy">{fila.valor}</span>
                          ) : (
                            <span className="text-sm italic text-navy-soft">
                              Pendiente — sin dato documentado
                            </span>
                          )}
                          {fila.nota ? <p className="mt-1 text-xs text-navy-soft">{fila.nota}</p> : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* ── PIE ────────────────────────────────────────────────────────── */}
        <Modal.Footer className="shrink-0 border-linea">
          <p className="hidden text-xs text-navy-soft sm:block">
            ¿Necesitas un dato que no está aquí? Escríbenos y te lo confirmamos.
          </p>
          <Link
            to={destino}
            className="group inline-flex items-center gap-2 rounded-btn bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-boton-fancy transition hover:bg-coral-dark"
          >
            {etiquetaCta}
            <ArrowRight
              className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
