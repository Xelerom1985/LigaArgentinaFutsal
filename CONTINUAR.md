# CHECKPOINT — Liga Argentina de Futsal (app UNIFICADA)
_Última actualización: 25/11/2026 a la noche (notebook: Backoffice del SuperAdmin, commit c9acc9e, publicado)_

> Para la próxima sesión de Claude: leé este archivo completo antes de hacer nada.
> El usuario (Fernando) habla en español rioplatense, quiere todo guardado en Drive y no le gusta que le pidan confirmación.
> Inauguración: **febrero 2027 con el Torneo Apertura 2027**; Clausura desde mitad de año hasta fin de 2027. Hay tiempo: se siguen haciendo mejoras.

## 00. Backoffice del SuperAdmin (25/11/2026, notebook) — PUBLICADO
Pedido de Fernando: **el SuperAdmin es para controlar/monitorear la app (backoffice)**; partidos, fechas, árbitros, clubes y planillas son del **Admin de la Liga**.
- Al entrar con el PIN de SuperAdmin, `#admin` muestra **`src/super/Backoffice.jsx`**. Pestañas:
  - **Resumen:** celulares con la app abierta ahora, personas por día / nuevas / aperturas (hoy, 7 y 30 días), gráfico de 30 días, Android/iPhone/PC, app instalada vs navegador, horas de uso. Casilla "No contar este celular".
  - **Qué miran:** pantallas, tablas por zona, zonas, clubes de Mi club, "Cómo llegar", instalaciones.
  - **Consumo:** medidores contra el plan gratis (descarga de la base 10 GB/mes con proyección, hosting 360 MB/día, espacio 1 GB con planillas), qué hay en la base (partidos y cuántos son de prueba, clubes, planillas, árbitros, admins), links a la consola de Firebase.
  - **Errores** (errores JS de los celulares, 14 días, botón Borrar), **Accesos** y **Torneo** (se sacaron del panel de Admin).
  - Botón "Abrir el panel de Admin" → `#gestion` (el panel de Admin normal, con botón "Backoffice" para volver).
- **Métricas anónimas** en `src/data/metricas.js` (nada personal, solo contadores; no corre en dev ni en demo):
  - `/metricas/d/{dia AR}/{grupo}/{clave}` = número. Grupos fijos: gen, disp, modo, horas, vistas, zonas, tablas, miclub, acc, kb. Se mandan juntos con `increment()` cada 15 s o al salir.
  - `/metricas/e/{dia}/{hash}` {msg, n} errores (máx. 5 por sesión). `/metricas/vivo/{celular}` con onDisconnect.
  - Consumo **estimado**: `contarBajada(val)` en cada lectura de la base (partidos, clubes, config, admin, planillas) x1,2 por protocolo; hosting por `transferSize` + `__APP_KB__` (vite.config.js) la primera vez que se instala el service worker. **Si se agrega otra lectura de la base, llamar `contarBajada`.**
  - Las planillas nuevas guardan `tam` en `partidos/{id}/hojas/{i}` (las viejas se estiman 700 KB).
  - El celular del SuperAdmin no cuenta en uso (`localStorage laf_m_staff`).
- **Reglas** `metricas`: lectura y borrado solo SuperAdmin; contadores solo suben (máx. +50000 por escritura) y con claves `[a-z0-9-]`. Probado con curl: leer/borrar/grupo inventado/salto grande → Permission denied; contador válido OK.
- Probar: `?demo=super` (métricas de prueba en `src/demo.js`).
- En la notebook se corrió `npm install` (en la copia local, faltaba jszip) y **`firebase deploy` anda desde la notebook**.

## 0. Zonas Baby y Femenino 8va eliminadas (25/11/2026) — APLICADO Y PUBLICADO
**Se sacaron de la app las zonas "Baby · Cat. 2013" (Zona 1 y 2) y "Femenino · 8va" (Lanús, Zona 1, Zona 2).**
Commit `ed5c889` (hecho desde la nube, vía GitHub). Aplicado en la PC de casa el 25/11: pull, build y deploy hechos;
bundle regenerado, `src/` de Drive al día y escudos `baby-*`/`fem-*` borrados de Drive.
**Falta:** que Fernando entre una vez a Admin → Clubes en la app publicada (ahí se borran de Firebase los clubes de esas zonas). **Verificado 25/11 a la noche: siguen los 45** (baby-1 8, baby-2 7, fem-1 10, fem-2 11, fem-lanus 9; total 179). Como SuperAdmin: Backoffice → "Abrir el panel de Admin" → Clubes.

Qué cambió:
- `src/data/zonas.js`: sin los grupos `baby` y `femenino`.
- `src/data/escudos.js`: sin los alias "Mismo club escrito distinto en Baby / Femenino".
- `public/escudos/baby-*` y `fem-*` (9 imágenes) borradas.
- `src/components/Home.jsx` y `src/admin/NuevoPartido.jsx`: el regex del nombre corto ya no menciona Femenino/Baby.
- `src/data/clubes.js`: `aLista` ignora clubes cuya `zonaId` no existe (exporta `zonaValida`).
  → Los clubes de Baby/Femenino que siguen en Firebase **no se ven** en ningún lado.
- `src/admin/AdminClubes.jsx`: `asegurarBase()` **borra de /clubes** los clubes de zonas inexistentes
  la primera vez que un admin abre la pestaña Clubes después del deploy. (Entrar a Admin → Clubes una vez.)
- **NO** se tocaron las categorías "Reserva Femenino" y "1ra Femenino" (son categorías de los partidos de las zonas normales).
- Si hay partidos de prueba en zonas baby-*/fem-* van a mostrar el id de zona; igual hay que borrar los de prueba antes de febrero.
- Probado en navegador (modo Pixel 7): inicio sin Baby/Femenino, buscador sin esos clubes, admin sin errores.

## 1. Dónde está todo
- **Producción:** https://liga-argentina-futsal.web.app (Firebase `liga-argentina-futsal`, Hosting + Realtime Database + Auth email/password).
- **Código — FUENTE PRINCIPAL: GitHub** `https://github.com/Xelerom1985/LigaArgentinaFutsal` (privado, rama `main`).
  - Flujo: **`git pull` al empezar y `git push` al terminar cada cambio.** Hay otra sesión de Claude en la nube que trabaja sobre el mismo repo.
  - PC de casa: `C:\Users\Fernando Flores\LigaArgentinaFutsal` (remoto `github`, `main` sigue a `github/main`; launch "LigaArgentinaFutsal" en `~\.claude\launch.json`, puerto 5181).
  - Notebook: `C:\Users\fflsonct\LigaArgentinaFutsal` (AL DÍA desde 25/11; ahí el remoto se llama **`origin`** → `git pull origin main`; node_modules instalado; launch "LigaArgentinaFutsal" puerto 5181).
  - `CONTINUAR.md` del repo es copia de este archivo (para la sesión de la nube): si se cambia uno, copiar al otro.
  - **Respaldo** en Drive (esta carpeta): copia de `src/` + `database.rules.json` + `liga-argentina-futsal.bundle` (repo completo; regenerarlo en los checkpoints con `git bundle create … --all`).
- **No correr `npm install` dentro de Drive.**
- Deploy: `npm run build` + `firebase deploy --only hosting` (y `--only database` si cambian las reglas). Anda en la PC de casa y en la notebook.
- Probar sin PIN (solo en dev): `?demo=super`, `?demo=admin`, `?demo=arbitro` (datos de `src/demo.js`).
- La app vieja de árbitros (`liga-argentina-arbitros.web.app`, repo `C:\Users\Fernando Flores\LigaArgentinaArbitros`) ahora solo **redirige** a la unificada.

## 2. Qué tiene la app
- **Inicio:** logo, cartel "TORNEO APERTURA 2027", tarjeta **★ Mi club**, selector **Clubes y ubicaciones / Tablas de posiciones**, zonas en botones (Elite, Premier, Diamante, Copas).
  - Arriba a la **izquierda: Admin** (SuperAdmin y Admin de la Liga). Arriba a la **derecha: Árbitros**.
- **Clubes y ubicaciones:** zonas → clubes → "Cómo llegar" (Google Maps). Buscador.
- **Tablas:** por zona, **General** (suma todas las categorías) + las 11 categorías siempre visibles. 3 pts ganado, 1 empate, 0 perdido, sin goles. Desempate: más PG, menos PP. Cada club suma en su zona (partidos entre zonas cuentan para los dos). Filtradas por torneo (selector si hay más de uno).
- **Mi club:** se elige y se guarda en el celular. Pestañas Resumen, Tabla, Partidos, Ubicación.
- **Árbitros (PIN 4 dígitos):** "Mis partidos" → semáforo por categoría, **✕ roja para cancelar una categoría con motivo**, clip para subir la planilla firmada, "Guardar resultados". Opción de **entrar con huella** después del PIN.
- **Admin:**
  - **SuperAdmin = Fernando**, cuenta `admin@liga-argentina-futsal.app`. PIN inicial 2026; Fernando lo cambia él mismo a uno de **9 dígitos** desde Accesos → "Cambiar mi PIN" (no guardarlo en archivos).
  - **Admin de la Liga** = PIN de 4 dígitos, creado por el SuperAdmin en **Accesos**. Puede hacer TODO menos cambiar el torneo y ver Accesos.
  - SuperAdmin entra al **Backoffice** (ver sección 00); desde ahí abre el panel de Admin.
  - Panel de Admin, pestañas: **Partidos**, **Árbitros**, **Planillas** (ZIP por fecha), **Clubes**.
- **Planillas firmadas:** se borran **todos los domingos a las 6:00 (hora argentina)**.
- **Ahorro de descarga:** **cualquier escritura nueva sobre /partidos tiene que poner `act: ACT()`.** Borrar un partido = `{ borrado: true, act }`.

## 3. Base de datos (Realtime Database)
- `/clubes/{id}` {nombre, zonaId, escudo, ubicacion}: lectura pública.
- `/partidos/{id}` {fecha, zonaId, visitanteZonaId, local, visitante, categorias[], resultados{i: L|E|V|C}, cancelaciones{i: {motivo}}, hojas{i: meta}, arbitroUid, arbitroNombre, estado, torneo, act, borrado}: lectura pública.
- `/hojas/{pid}/{i}` (data URL de la planilla): privado.
- `/arbitros/{uid}`, `/admins/{uid}`, `/config` {torneoActual, torneos}.
- `/metricas` {d, e, vivo}: métricas anónimas, lectura solo SuperAdmin (ver sección 00).
- Reglas en `database.rules.json`. La misma cuenta de "semana" está en `src/data/limpieza.js`.

## 4. Pendientes / ideas
1. **Entrar una vez a Admin → Clubes** en la app publicada (borra de Firebase los clubes de Baby/Femenino).
2. **Datos que hay que pedir a la Liga** (lista rearmada el 25/11 en 7 bloques: zonas y clubes, escudos, sedes, fixture, árbitros, administradores, reglamento de puntos): árbitros, PIN de Admin, zonas y clubes definitivos 2027, nombres oficiales unificados, direcciones de sedes, escudos, logo HD, fixture, día/hora/cancha, reglamento de puntos (W.O., suspendidos, sanciones, desempate), quién baja las planillas.
3. **Puntos de categorías canceladas**: hoy NO suman. Definir a quién se asignan.
4. **2026 reservado**: liberarlo para la Liga cuando Fernando confirme que su PIN de SuperAdmin ya es el de 9 dígitos (sacar `PIN_ADMIN_RESERVADO`).
5. Probar en celular real: huella, recepción en vivo de un resultado, ZIP con planillas reales.
6. Borrar los partidos de prueba de noviembre antes de febrero (hoy cuentan para el Apertura 2027).
7. Escudos faltantes: Los Amigos, San José Sur, Sin Fronteras y Bouchard ya NO hacen falta (eran de Baby/Femenino). Revisar los deducidos cuando lleguen los oficiales.
8. ~~Crear el repo de GitHub~~ HECHO 25/11 (Xelerom1985/LigaArgentinaFutsal, privado).
9. Mejoras propuestas el 25/11 (Fernando todavía no eligió): hora y cancha del partido + fixture público "esta fecha", W.O./suspendido/descuentos, historial de cambios de resultados, botón "empezar el torneo de cero" (borrar partidos de prueba), compartir tabla/resultado como imagen por WhatsApp, avisos de la Liga en el inicio, push para Mi club, copia de seguridad semanal descargable.
10. Mirar el Backoffice en unos días: que se llenen las métricas y que el consumo estimado se parezca al de la consola de Firebase (ajustar `PROTOCOLO` en Backoffice.jsx si no).
