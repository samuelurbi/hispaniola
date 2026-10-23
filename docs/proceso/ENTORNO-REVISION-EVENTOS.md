# Entorno de revisión — menú de Eventos (2026-10-23)

Rama `revision-eventos` del repo `samuelurbi/hispaniola` (remoto `origin`). **No se fusiona**: es solo para enseñar el menú nuevo a Marketing.

Lo que cambia respecto a `staging` (commit «Entorno de revisión»):

- `app/scripts/modo-revision.mjs`, que corre tras el build: `noindex` (meta + robots.txt con Disallow total), sin analítica (GTM ×2, gtag), y **falla el build** si el bundle contiene el dominio del Odoo de producción.
- `app/vercel.json`: `VITE_API_URL` forzado a `https://odoo-desactivado.invalid` (gana al `.env.production`) y cabecera `X-Robots-Tag: noindex`.

Consecuencia: la web no puede crear reservas ni cobrar (no hay backend); el funnel avisa en pantalla. Precios, cifras y catálogo se pintan con los datos locales del código. El único «error» de consola esperado es `ERR_NAME_NOT_RESOLVED` del Odoo desactivado.

Para producción: NO usar esta rama; usar `staging`/`master`.

## Dónde está

(se rellena al crear el proyecto de Vercel)
