import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import * as Modal from '@/components/alignui/modal'
import { FICHA_TECNICA_AVISO, fichaTecnicaDe, titularesTecnicos } from '@/data/flota'
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
// ── PROCEDENCIA A LA VISTA ───────────────────────────────────────────────
// Los datos reales llevan un punto aqua delante y el aviso de arriba explica
// qué significa. Es la forma de cumplir la regla de la casa («nada de
// rellenar un hueco con un dato plausible») en una ficha que HOY es de
// ejemplo: no se disfraza de definitiva, pero tampoco se queda a medias.
// Las filas sin dato dicen «pendiente» — no un número verosímil.
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

  // Índice ACTIVO por scroll. Se calcula sobre el contenedor scrolleable del
  // modal, no sobre la ventana: dentro de un diálogo, `window.scrollY` no se
  // mueve. Gana el último bloque cuyo borde superior ya pasó del umbral.
  useEffect(() => {
    const cuerpo = cuerpoRef.current
    if (!cuerpo) return
    const onScroll = () => {
      const umbral = cuerpo.scrollTop + 120
      let visible = grupos[0]?.id ?? ''
      for (const g of grupos) {
        const el = cuerpo.querySelector<HTMLElement>(`#spec-${g.id}`)
        if (el && el.offsetTop <= umbral) visible = g.id
      }
      setActivo(visible)
    }
    cuerpo.addEventListener('scroll', onScroll, { passive: true })
    return () => cuerpo.removeEventListener('scroll', onScroll)
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
      top: el.offsetTop - 16,
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

          <p className="mt-4 flex items-start gap-2 rounded-btn bg-aqua-tint px-3 py-2 text-xs text-navy-sub">
            <Info className="mt-px size-3.5 shrink-0 text-aqua-dark" aria-hidden="true" />
            {FICHA_TECNICA_AVISO}
          </p>
        </div>

        {/* ── CUERPO (niveles 2 y 3) ─────────────────────────────────────── */}
        <div className="flex min-h-0 flex-1">
          {/* Índice lateral. Solo desde lg: en móvil ocuparía media pantalla
              para navegar 9 anclas que se recorren con el pulgar igual de
              rápido. */}
          <nav aria-label="Secciones de la ficha técnica" className="hidden w-56 shrink-0 border-r border-linea py-4 lg:block">
            <ul className="flex flex-col">
              {grupos.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => irA(g.id)}
                    aria-current={activo === g.id}
                    // Barra de selección ABSOLUTA (no un border-l que empuje):
                    // marcar el activo no debe desplazar el texto un píxel.
                    className={`relative flex w-full items-center gap-2.5 py-2 pl-5 pr-3 text-left text-sm transition ${
                      activo === g.id ? 'font-semibold text-navy' : 'text-navy-soft hover:text-navy-sub'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-1 left-0 w-0.5 rounded-full transition ${
                        activo === g.id ? 'bg-aqua' : 'bg-transparent'
                      }`}
                    />
                    <g.icono className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{g.titulo}</span>
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
                        <dt className="flex items-start gap-1.5 text-sm text-navy-soft">
                          {/* El punto de «dato verificado». `title` y no solo
                              color: un punto de color no dice nada por sí
                              mismo, y el aviso de arriba lo explica una vez. */}
                          {fila.origen === 'verificado' ? (
                            <span
                              title="Dato verificado de la documentación del armador"
                              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-aqua"
                            >
                              <span className="sr-only">Dato verificado. </span>
                            </span>
                          ) : null}
                          {fila.label}
                        </dt>
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
