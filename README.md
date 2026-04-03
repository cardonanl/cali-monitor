# Cali Monitor

Dashboard de inteligencia de noticias para la administración pública de Santiago de Cali, Colombia. Agrega, clasifica y geolocaliza noticias de múltiples fuentes locales en tiempo real.

## Características

- **Agregación RSS** — Google News, Q'Hubo Cali, Occidente, Alcaldía de Cali
- **Clasificación automática** — GPT-4o-mini categoriza cada artículo en 13 categorías orientadas a gestión pública (Seguridad Pública, Infraestructura y Obras, Movilidad, Medio Ambiente, etc.)
- **Mapa de barrios** — extrae el barrio mencionado en cada artículo y lo ubica sobre los 339 barrios oficiales de Cali (shapefile IDESC)
- **Filtros en tiempo real** — filtra por categoría y/o barrio sin recargar la página
- **Dashboard** — KPIs, distribución por tópico, actividad horaria, nube de palabras
- **Auto-refresh** — se actualiza cada 30 minutos con countdown visible

## Stack

- [Next.js](https://nextjs.org) 14 (App Router + TypeScript)
- [Supabase](https://supabase.com) — base de datos y RLS
- [OpenAI](https://openai.com) gpt-4o-mini — clasificación y extracción de barrio
- [Leaflet](https://leafletjs.com) / react-leaflet — mapa interactivo
- [Recharts](https://recharts.org) — gráficas
- Tailwind CSS + CSS custom properties (dark mode)

## Correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys

# 3. Correr migraciones en Supabase (SQL Editor)
# Ver supabase/schema.sql

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Key pública (solo lectura) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (escritura server-side) |
| `OPENAI_API_KEY` | Key de OpenAI para clasificación |
| `RECLASSIFY_SECRET` | Token para proteger `POST /api/reclassify` |

Ver `.env.example` para el formato completo.

## Scripts

```bash
# Convertir shapefile de barrios a GeoJSON (solo se necesita una vez)
node scripts/convert-barrios.mjs

# Scraping histórico del último mes (fuentes RSS + Alcaldía)
node scripts/scrape-historical.mjs

# Reclasificar todos los artículos con las categorías actuales
curl -X POST http://localhost:3000/api/reclassify \
  -H "Authorization: Bearer TU_RECLASSIFY_SECRET"
```

## Fuentes de noticias

| Fuente | Tipo | Filtro |
|---|---|---|
| Google News - Cali | RSS | Keywords Cali/Valle |
| Google News - Valle | RSS | Keywords Cali/Valle |
| 90 Minutos | Google News `site:` | Keywords Cali/Valle |
| Q'Hubo Cali | RSS directo | Sin filtro |
| Occidente | RSS directo | Sin filtro |
| Alcaldía de Cali | Scraping HTML | Sin filtro |

## Categorías de clasificación

Seguridad Pública · Salud · Educación · Infraestructura y Obras · Movilidad y Transporte · Medio Ambiente · Desarrollo Social · Desarrollo Económico · Gobernanza · Judicial · Cultura y Eventos · Emergencias · General

## Deploy

Desplegado en [Vercel](https://vercel.com). Agregar las 5 variables de entorno en **Settings → Environment Variables** antes del primer deploy.

Después del primer deploy, revocar las políticas RLS de escritura pública en Supabase:

```sql
drop policy if exists "Server upsert access" on articles;
drop policy if exists "Server update access" on articles;
```
