import { useId } from 'react'

// Sello Travellers' Choice de TripAdvisor + el reclamo de «#1 durante 7 años».
//
// Pieza compartida por la ficha de tour y las landings de evento (Samuel,
// 2026-07-28: «añádelo en todas»). Un componente React = un futuro componente
// de Figma, y esto es claramente uno.
//
// ── EL SELLO MANDA, EL TEXTO ACOMPAÑA ────────────────────────────────────
// (Samuel: «que la imagen sea más grande, sea el protagonista, y el texto más
// sutil»). Fuera la píldora que lo envolvía: un sello metido en una cápsula se
// lee como el icono de una etiqueta, y encima le disputaba el protagonismo.
// El texto baja a dos líneas pequeñas y apagadas.
//
// POR QUÉ EL TEXTO NO SE ESCONDE HASTA EL HOVER (la otra variante que planteó
// Samuel): en móvil no hay hover, y «#1 en TripAdvisor 7 años» es el argumento
// más fuerte del producto — el cliente pidió expresamente DESTACARLO en las
// correcciones v2. Dejarlo detrás de un gesto que no existe en táctil lo
// borraría para la mitad del tráfico, que en turismo es iPhone. Está siempre,
// pero atenuado: el hover lo ENCIENDE en vez de revelarlo.
//
// ── POR QUÉ TODO ESTO ES UN SOLO SVG ─────────────────────────────────────
// (Samuel, 2026-07-28: «agregarle estos picos que estén girando infinitamente
// [...] que pareciera que los picos fueran parte del dorado de la imagen [...]
// y también el efecto de luz lo afecte para que se vea bien integrado»).
//
// La pieza tiene tres capas —picos girando, disco, destello— y la exigencia
// es que se lean como UN objeto de metal, no como tres cosas apiladas. Eso
// obliga a que el destello cruce los picos Y el disco con la misma banda de
// luz, y ahí es donde la versión anterior en CSS se rompía: recortaba el
// brillo con un círculo (`border-radius: 50%`), así que los picos se habrían
// quedado apagados mientras el disco brillaba — justo el pegote a evitar.
//
// Metiéndolo todo en un SVG, el destello se enmascara con la UNIÓN de las dos
// formas (picos + disco) y las recorre como una sola superficie. De paso, los
// picos salen de un `<path>` y no de una imagen: escalan sin pixelarse y su
// oro es el token muestreado del propio PNG, así que no hay costura visible
// entre el metal dibujado y el metal fotografiado.
//
// El MISMO `<path>` se usa dos veces —una para pintar los picos y otra dentro
// de la máscara— vía `<use>`, y las dos llevan la misma clase de rotación. Al
// compartir animación y arrancar en el mismo frame giran sincronizadas, que es
// lo que hace que la luz caiga siempre sobre el pico que toca. Si se hubieran
// duplicado las coordenadas, cualquier retoque futuro tendría que hacerse en
// dos sitios y la máscara se desalinearía en cuanto alguien olvidara uno.
export function SelloTripAdvisor({ className = '' }: { className?: string }) {
  // Los `id` de SVG son GLOBALES del documento, no del componente: dos sellos
  // en la misma página compartirían máscara y degradado, y el segundo pintaría
  // con las formas del primero. `useId` les da un sufijo único por instancia.
  const uid = useId().replace(/:/g, '')
  const idPicos = `picos-${uid}`
  const idDisco = `disco-${uid}`
  const idLuz = `luz-${uid}`
  const idMascara = `mascara-${uid}`

  return (
    // `group` para que el hover del conjunto encienda texto y destello a la
    // vez: pasar el ratón por el texto y ver el sello apagado se sentiría roto.
    // `w-fit` para que el área de hover no se estire a toda la columna.
    <div className={`group flex w-fit items-center gap-3 ${className}`}>
      {/* La caja crece respecto a la versión sin picos (56/64px) porque ahora
          incluye la corona: el DISCO sigue midiendo lo mismo (es el 76% del
          lado), y son los picos los que ocupan el resto. */}
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="size-18 shrink-0 sm:size-20"
      >
        <defs>
          {/* 36 dientes entre r=36 y r=48. El radio interior queda POR DENTRO
              del disco (r=38) a propósito: así los valles no se ven y los picos
              parecen brotar del borde dorado en vez de estar pegados detrás. */}
          <path id={idPicos} d="M50.00 2.00L53.14 14.14L58.34 2.73L59.32 15.23L66.42 4.89L65.21 17.37L74.00 8.43L70.65 20.51L80.85 13.23L75.46 24.54L86.77 19.15L79.49 29.35L91.57 26.00L82.63 34.79L95.11 33.58L84.77 40.68L97.27 41.66L85.86 46.86L98.00 50.00L85.86 53.14L97.27 58.34L84.77 59.32L95.11 66.42L82.63 65.21L91.57 74.00L79.49 70.65L86.77 80.85L75.46 75.46L80.85 86.77L70.65 79.49L74.00 91.57L65.21 82.63L66.42 95.11L59.32 84.77L58.34 97.27L53.14 85.86L50.00 98.00L46.86 85.86L41.66 97.27L40.68 84.77L33.58 95.11L34.79 82.63L26.00 91.57L29.35 79.49L19.15 86.77L24.54 75.46L13.23 80.85L20.51 70.65L8.43 74.00L17.37 65.21L4.89 66.42L15.23 59.32L2.73 58.34L14.14 53.14L2.00 50.00L14.14 46.86L2.73 41.66L15.23 40.68L4.89 33.58L17.37 34.79L8.43 26.00L20.51 29.35L13.23 19.15L24.54 24.54L19.15 13.23L29.35 20.51L26.00 8.43L34.79 17.37L33.58 4.89L40.68 15.23L41.66 2.73L46.86 14.14Z" />
          <clipPath id={idDisco}>
            <circle cx="50" cy="50" r="38" />
          </clipPath>
          {/* Banda de luz estrecha e inclinada. Ancha parecería un velo blanco
              encima y apagaría el oro en vez de recorrerlo. */}
          <linearGradient id={idLuz} x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(12 0.5 0.5)">
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.72" />
            <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {/* LA UNIÓN: picos (girando) + disco. El destello solo existe donde
              hay metal, así que no aparece la banda cruzando el aire de
              alrededor ni los valles entre dientes. */}
          <mask id={idMascara}>
            <use href={`#${idPicos}`} className="sello-picos" fill="#fff" />
            <circle cx="50" cy="50" r="38" fill="#fff" />
          </mask>
        </defs>

        <use href={`#${idPicos}`} className="sello-picos" fill="var(--color-sello-oro)" />
        <image
          href="/premios/premio-tripadvisor-bob-2023.webp"
          x="12"
          y="12"
          width="76"
          height="76"
          clipPath={`url(#${idDisco})`}
        />
        {/* La máscara va en el <g> y el movimiento en el <rect> de dentro: si
            se animara el elemento enmascarado, la máscara viajaría con él y la
            luz se quedaría quieta respecto al sello — o sea, no habría barrido. */}
        <g mask={`url(#${idMascara})`}>
          <rect className="sello-destello" x="0" y="0" width="100" height="100" fill={`url(#${idLuz})`} />
        </g>
      </svg>

      <span className="leading-tight">
        {/* Este texto ES el texto accesible del sello: el SVG va aria-hidden
            para que un lector de pantalla no anuncie dos veces lo mismo. */}
        <span className="block text-sm font-bold tracking-[0.06em] text-white/85 transition-colors duration-300 group-hover:text-white">
          #1 en TripAdvisor
        </span>
        <span className="block text-xs tracking-[0.06em] text-white/55 transition-colors duration-300 group-hover:text-white/80">
          7 años seguidos
        </span>
      </span>
    </div>
  )
}
