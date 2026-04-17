# Cali Monitor

**Monitor de situación para la administración pública de Santiago de Cali, Colombia.**

<img src="public/fc17a005-cf32-4b77-a988-fcd44110d42d.jpg" width="600">

Cali Monitor agrega, clasifica y geolocaliza noticias de fuentes locales en tiempo real, permitiendo a equipos de gobierno tener una visión consolidada de lo que ocurre en la ciudad: dónde están ocurriendo los eventos, qué secretarías están involucradas y cómo evoluciona la actividad informativa a lo largo del tiempo.

---

## ¿Para qué sirve?

La Alcaldía de Cali y sus dependencias reciben información dispersa de decenas de medios locales. Cali Monitor centraliza esa información en un único panel operativo que responde preguntas como:

- ¿Qué está pasando hoy en materia de seguridad pública?
- ¿En qué barrios se están reportando incidentes o novedades?
- ¿Cuántas noticias sobre infraestructura vial salieron esta semana?
- ¿Cuál es el resumen ejecutivo de las noticias del día?

El sistema está diseñado para operar como una **sala de situación digital**: siempre actualizado, sin intervención manual, con categorías alineadas a la estructura de la administración municipal.

---

## Características

### Agregación de noticias
Monitorea en tiempo real las siguientes fuentes locales:
- **Google News - Cali** — búsquedas específicas para Cali, Colombia
- **Google News - Valle** — búsquedas para Valle del Cauca
- **90 Minutos** — noticiero local de Cali (vía Google News)
- **Q'Hubo Cali** — medio popular con amplia cobertura local
- **Occidente** — diario regional del Valle del Cauca

### Clasificación automática por área de gobierno
Cada artículo es clasificado automáticamente por `gpt-4o-mini` en una de 13 categorías orientadas a la gestión pública:

| Categoría | Secretaría / Entidad relacionada |
|---|---|
| Seguridad Pública | Secretaría de Seguridad y Justicia |
| Salud | Secretaría de Salud |
| Educación | Secretaría de Educación |
| Infraestructura y Obras | Secretaría de Infraestructura |
| Movilidad y Transporte | Secretaría de Movilidad |
| Medio Ambiente | DAGMA |
| Desarrollo Social | Secretaría de Bienestar Social |
| Desarrollo Económico | Secretaría de Desarrollo Económico |
| Gobernanza | Alcaldía / Concejo Municipal |
| Judicial | Fiscalía / Tribunales |
| Cultura y Eventos | Secretaría de Cultura |
| Emergencias | DAGRD |
| General | — |

La clasificación también extrae el **barrio de Cali** mencionado en el titular, con lógica especial para evitar falsos positivos (fechas como "3 de Julio", aeropuerto "Alfonso Bonilla Aragón" vs. el barrio homónimo, etc.).

### Mapa de barrios
Cuando una noticia menciona un barrio de Cali, el sistema lo detecta y lo ubica en un **mapa interactivo** sobre los 339 barrios oficiales de la ciudad (datos del IDESC). El mapa usa tiles oscuros de CartoDB y muestra:
- Polígonos de barrios resaltados cuando tienen cobertura noticiosa
- Marcadores circulares coloreados por tópico con el conteo de artículos
- Popups con los titulares vinculados al barrio, filtrados por tópico

### Dashboard operativo — 4 filas
El panel está estructurado en cuatro filas con estética de terminal:

1. **KPIs** — total de artículos en base de datos, últimas 24h, fuentes activas, tópicos con cobertura
2. **Resumen ejecutivo IA** + **Actividad semanal** — síntesis del día generada por `gpt-4o-mini` y gráfica de líneas de los últimos 7 días
3. **Distribución por tópico (24h)** + **Mapa de incidencias por barrio** — barras CSS proporcionales por tópico y mapa Leaflet a pantalla completa (560 px de alto, 2/3 del ancho)
4. **Nube de palabras** — términos más frecuentes en las últimas 24 horas

### Filtros en tiempo real
La sección de artículos incluye un panel de filtrado client-side con:
- Pills por **tópico** (ordenados por frecuencia)
- Pills por **barrio** (solo aparecen si hay artículos geolocalizados)
- Botón `[LIMPIAR ×]` para resetear ambos filtros
- Contador de resultados activos en tiempo real

### Tarjetas de artículo
Cada artículo muestra badge de tópico (colores IBM Carbon), badge de fuente, indicador de barrio `[📍 nombre]` cuando fue detectado, tiempo relativo en español y resumen truncado.

### Actualización automática
El panel se refresca automáticamente cada 30 minutos vía ISR de Next.js. También se puede forzar una actualización manual desde el header.

### Clasificación diaria por IA
La clasificación de tópicos y extracción de barrios corre una vez al día a las 5 AM UTC via Vercel Cron (`GET /api/classify`). Solo procesa artículos sin tópico asignado, excluyendo los de la Alcaldía de Cali, que se pre-asignan automáticamente como **Gobernanza** en el momento del upsert.

---

## Diseño visual

El dashboard usa una estética de **terminal retro** coherente en toda la interfaz:

| Token | Valor |
|---|---|
| Tipografía | Share Tech Mono (Google Fonts) — monoespaciada en todo el sitio |
| Fondo base | `#080808` |
| Fondo tarjetas | `#111111` |
| Borde | `#2e2e2e` |
| Blanco | `#ffffff` |
| Amarillo | `#ffd700` |
| Verde | `#00dd44` |
| Rojo | `#ff3333` |
| Naranja | `#ff9900` |

Incluye un overlay de **scanlines** via CSS `::after` y un indicador parpadeante `●  EN LÍNEA` en el header.

No se usan clases `dark:` de Tailwind — todo el theming es via CSS custom properties en `globals.css`.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend / Backend | Next.js (App Router + TypeScript) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Clasificación IA | OpenAI gpt-4o-mini (cron diario, excluyendo Alcaldía) |
| Resumen diario IA | OpenAI gpt-4o-mini (~350 tokens, en cada render) |
| Mapa | Leaflet (carga dinámica, SSR: false) + CartoDB dark tiles |
| Gráficas | Recharts (WeeklyChart, WordCloud CSS) |
| Tipografía | Share Tech Mono (Google Fonts) |
| Estilos | Tailwind CSS + CSS custom properties |
| Datos geográficos | Shapefile IDESC Cali (EPSG:6249 → WGS84) |
| Deploy | Vercel (ISR, revalidate: 1800s) |

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/cardonanl/cali-monitor.git
cd cali-monitor

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys

# 4. Ejecutar migraciones en Supabase
# Ir a Supabase → SQL Editor y ejecutar supabase/schema.sql

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Key pública (lectura) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (escritura server-side — **nunca exponer**) |
| `OPENAI_API_KEY` | Key de OpenAI para clasificación y resumen |
| `RECLASSIFY_SECRET` | Token para proteger `POST /api/reclassify` |
| `CRON_SECRET` | Generado automáticamente por Vercel — protege `GET /api/classify` |

> Las tres primeras son necesarias para `npm run dev`. Sin `SUPABASE_SERVICE_ROLE_KEY` el servidor local falla con `supabaseKey is required`.

---

## Scripts de administración

```bash
# Scraping histórico del último mes (alimentar la BD por primera vez)
node scripts/scrape-historical.mjs

# Reclasificar todos los artículos con las categorías actuales
curl -X POST https://cali-monitor.vercel.app/api/reclassify \
  -H "Authorization: Bearer TU_RECLASSIFY_SECRET"

# Regenerar el GeoJSON de barrios desde el shapefile fuente
node scripts/convert-barrios.mjs
```

---

## Datos geográficos

El mapa utiliza el shapefile oficial **mc_barrios** del IDESC (Infraestructura de Datos Espaciales de Santiago de Cali), convertido a GeoJSON en WGS84 mediante reproyección desde MAGNA-Sirgas / Cali (EPSG:6249). El archivo resultante (`public/barrios.geojson`) contiene los 339 barrios con su geometría y centroide calculado.

---

## Supabase — esquema de tabla

**Tabla: `public.articles`**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `text` | PK — MD5 de `title.slice(0,60) + source` |
| `title` | `text` | |
| `source` | `text` | e.g. `"Google News - Cali"` |
| `published_at` | `timestamptz` | Desde el RSS `pubDate`/`isoDate` |
| `summary` | `text` | Nullable, máx. 220 chars |
| `url` | `text` | |
| `topic` | `text` | Nullable — llenado por cron diario (Alcaldía pre-asignada como "Gobernanza") |
| `neighborhood` | `text` | Nullable — nombre de barrio de la lista canónica |
| `fetched_at` | `timestamptz` | Timestamp del ciclo de fetch |

Migración requerida (ejecutar una vez en el SQL Editor de Supabase):
```sql
alter table articles add column if not exists neighborhood text;
create index if not exists articles_neighborhood_idx on articles (neighborhood);
```

---

## Demo

[https://cali-monitor.vercel.app](https://cali-monitor.vercel.app)

---

*Creado por Nicolás Cardona*
