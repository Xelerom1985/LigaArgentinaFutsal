# CHECKPOINT — Liga Argentina de Futsal (PWA)
_Última actualización: 19/11/2026_

> Para la próxima sesión de Claude: leé este archivo completo antes de hacer nada.
> El usuario habla en español rioplatense. Quiere TODO guardado en Google Drive (`G:\Mi unidad\.claude\`),
> nada solo local, porque alterna entre la PC del trabajo y la de casa.

## 1. Qué pidió el usuario
- App llamada **Liga Argentina de Futsal**, tipo **La Canilla** (ubicaciones de cada club).
- Al entrar: **primero el logo de la liga** y debajo **botones con las Zonas**.
- Zonas y nombres de clubes sacados de https://ligaargentina2026.shop/mi-club y /tablas.
- Que sea **PWA como La Pulga**: instalable desde el navegador.

## 2. Qué está hecho (funciona y está probado)
- Stack idéntico a La Pulga: **React 18 + Vite 5 + Tailwind 3 + vite-plugin-pwa** (sin Firebase todavía).
- **Inicio**: logo grande, buscador, 21 zonas agrupadas:
  - Elite (A, B) · Premier (A, B, Ascenso A, Ascenso B)
  - Diamante (Sudeste A, B1, B2 · Sudoeste A1, A2, B1, B2) · Copas (Oro, Plata)
  - (Baby Cat. 2013 y Femenino 8va eliminadas el 25/11/2026)
- **Zona**: lista de clubes ordenada, cada uno con botón **"Cómo llegar"** → Google Maps.
- **Buscador** de clubes (sin acentos) que muestra en qué zonas juega cada uno.
- Botón **"Mapa de la liga"** → el mapa de Google Earth del sitio.
- **PWA**: manifest + service worker, banner "Instalar" (Android/Chrome), instrucciones "Agregar a inicio" (iPhone),
  aviso "Nueva versión disponible". Navegación por hash (`#zona/elite-a`, `#buscar`) → el botón Atrás del celu funciona.
- Colores: celeste del logo `#74a9dd` + azul noche `#0b1f3a`. Fuentes: Bebas Neue + Inter.
- Probado en Chromium modo Pixel 7: sin errores de consola, SW registrado, sin scroll horizontal.

## 3. Archivos clave
- `src/data/zonas.js` → **todas las zonas y clubes** + objeto `direcciones` (vacío) + link del mapa.
- `src/components/` → Home, Zona, Buscar, ClubRow, Instalar, Fondo, Iconos.
- `vite.config.js` → manifest del PWA (`base: './'`, sirve en cualquier hosting).
- `public/logo.png` + `public/icons/*` → generados desde el logo oficial.

## 4. PENDIENTE (en orden sugerido)
1. **Direcciones de los clubes** (lo más importante, es el núcleo "tipo La Canilla").
   - En el sitio NO están en texto. El mapa es un **proyecto privado de Google Earth**
     (id `1-YPTC-J9rxeBx7dmcqmWHAE6ACc15AH`); no se pudo leer ni por web ni por el conector de Drive.
   - Opciones: (a) el usuario lo exporta como **KML** desde Google Earth y se parsea;
     (b) el usuario pasa las direcciones; (c) cargarlas a mano en `direcciones` de `zonas.js`.
   - Mientras tanto "Cómo llegar" busca `Club <nombre> futsal` en Maps centrado en Alte. Brown (puede fallar).
   - Idea a futuro: pantalla con mapa y todos los pines.
2. **Publicar con HTTPS** para que se pueda instalar: Firebase Hosting (como La Pulga, pasos en README) o GitHub Pages.
   Si se usa GitHub, crear repo (ej. `Xelerom1985/LigaArgentinaFutsal`).
3. **Escudos**: en /mi-club están como imágenes **sin nombre**; hay que asociarlos a mano.
   URLs tipo `https://ligaargentina2026.shop/_assets/media/<hash>.png`.
4. Opcional: panel Admin con contraseña + Firebase para editar direcciones desde el celu (como La Pulga/La Canilla).

## 5. Datos / observaciones
- Nombres tal cual figuran en las tablas del sitio (en mayúsculas). En Elite A la tabla trae **SPINOLA**, que no tiene escudo en /mi-club.
- Algunos clubes juegan en varias zonas (ej. BARRIO ENZ, LA PERLA CLAYPOLE); el buscador lo muestra.
- El sitio está hecho con Canva (se renderiza con JS): para leerlo hace falta un navegador (Playwright), no curl.
- Cada zona tiene subpágina de tabla: /web-tablas-elite, /web-tablas-elite-b, /tablas-web-premier-a, /tablas-web-premier-b,
  /tablas-web-premier-ascenso-a, /tablas-web-premier-ascenso-b, /tablas-diamante-sudeste-a, /tablas-diamante-sudeste-b1,
  /diamante-sudeste-b2, /diamante-sudoeste-a1, /diamante-sudoeste-a2, /diamante-sudoeste-b1, /diamante-sudoeste-b2,
  /tablas-copa-de-oro, /tablas-copa-de-plataa, /baby-zona-a, /baby-zona-b, /femenino-zona-lanus, /femenino-zona-a, /femenino-zona-b.
- Logo original: https://ligaargentina2026.shop/_assets/media/0141cf5de6c075749b0a87d21efc215f.png
- Repos de referencia del usuario (GitHub Xelerom1985): **LaPulga-Fulsal** (privado, base del PWA), **LaCanilla** (sedes + Maps),
  **LigaCentralSur** (app de liga más nueva: React 19 + Tailwind 4 + Firebase, con fixture/tablas/copas).

## 6. Cómo seguir
- **Recomendado**: sesión de Claude Code que corra **en la PC** (app Claude Desktop → Claude Code → local),
  con carpeta `G:\Mi unidad\.claude\liga-argentina-futsal`. Así escribe directo en Drive y se sincroniza solo.
- Para correrla: copiar la carpeta a `C:\` (o similar) y ahí `npm install` + `npm run dev`.
  **No correr `npm install` dentro de Google Drive** (node_modules = miles de archivos, Drive se traba).
- `liga-argentina-futsal.zip` (en la misma carpeta) tiene el proyecto con historial de git.
