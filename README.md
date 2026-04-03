# Cali Monitor

**Monitor de situación para la administración pública de Santiago de Cali, Colombia.**

Cali Monitor agrega, clasifica y geolocaliza noticias de fuentes locales en tiempo real, permitiendo a equipos de gobierno tener una visión consolidada de lo que ocurre en la ciudad: dónde están ocurriendo los eventos, qué secretarías están involucradas y cómo evoluciona la actividad informativa a lo largo del día.

---

## ¿Para qué sirve?

La Alcaldía de Cali y sus dependencias reciben información dispersa de decenas de medios locales. Cali Monitor centraliza esa información en un único panel operativo que responde preguntas como:

- ¿Qué está pasando hoy en materia de seguridad pública?
- ¿En qué barrios se están reportando incidentes o novedades?
- ¿Cuántas noticias sobre infraestructura vial salieron esta semana?
- ¿Hay un pico de actividad informativa que requiera atención?

El sistema está diseñado para operar como una **sala de situación digital**: siempre actualizado, sin intervención manual, con categorías alineadas a la estructura de la administración municipal.

---

## Características

### Agregación de noticias
Monitorea en tiempo real las siguientes fuentes locales:
- **Google News** — búsquedas específicas para Cali y Valle del Cauca
- **Q'Hubo Cali** — medio popular con amplia cobertura local
- **Occidente** — diario regional del Valle del Cauca
- **90 Minutos** — noticiero local de Cali
- **Alcaldía de Cali** — noticias oficiales del gobierno municipal

### Clasificación automática por área de gobierno
Cada artículo es clasificado automáticamente en una de 13 categorías orientadas a la gestión pública:

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

### Mapa de barrios
Cuando una noticia menciona un barrio de Cali, el sistema lo detecta y lo ubica en un mapa interactivo sobre los **339 barrios oficiales** de la ciudad (datos del IDESC). Los equipos pueden ver de un vistazo en qué zonas se concentra la actividad informativa.

### Dashboard operativo
- **4 KPIs** — total de artículos en base de datos, últimas 24h, fuentes activas, categorías con cobertura
- **Distribución por categoría** — barras proporcionales para ver qué temas dominan la agenda
- **Actividad por hora** — gráfica de área para identificar picos informativos
- **Nube de palabras** — términos más frecuentes en las últimas 24 horas
- **Filtros en tiempo real** — filtra por categoría y/o barrio sin recargar la página

### Actualización automática
El panel se refresca automáticamente cada 30 minutos. También se puede forzar una actualización manual desde el header.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend / Backend | Next.js 14 (App Router + TypeScript) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Clasificación IA | OpenAI gpt-4o-mini |
| Mapa | Leaflet / react-leaflet |
| Gráficas | Recharts |
| Estilos | Tailwind CSS + CSS custom properties |
| Datos geográficos | Shapefile IDESC Cali (EPSG:6249 → WGS84) |

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
# Editar .env.local con tus keys de Supabase, OpenAI y el secret de reclasificación

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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Key pública (solo lectura SELECT) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (escritura server-side, nunca exponer) |
| `OPENAI_API_KEY` | Key de OpenAI para clasificación |
| `RECLASSIFY_SECRET` | Token para proteger `POST /api/reclassify` |

Ver `.env.example` para el formato completo.

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

## Demo

[https://cali-monitor.vercel.app](https://cali-monitor.vercel.app)
