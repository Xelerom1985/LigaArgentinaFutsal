# Para retomar (Liga Argentina de Futsal)

## Estado al 19/11/2026
- PWA funcionando: logo de la liga, 21 zonas en 6 grupos (Elite, Premier, Diamante, Copas, Baby, Femenino),
  lista de clubes por zona con "Cómo llegar" (Google Maps), buscador de clubes, botón "Mapa de la liga",
  aviso de instalación (Android) + instrucciones iPhone, aviso de nueva versión.
- Stack igual a La Pulga: React 18 + Vite 5 + Tailwind 3 + vite-plugin-pwa.
- Probado en navegador móvil: service worker y manifest OK, sin errores.

## Cómo seguir en otra compu
1. Copiar la carpeta `liga-argentina-futsal` de `G:\Mi unidad\.claude\` a una carpeta local
   (o descomprimir `liga-argentina-futsal.zip`, que trae también el historial de git).
2. `npm install` y después `npm run dev`.
   (No conviene correr `npm install` adentro de Google Drive: node_modules son miles de archivos.)

## Pendiente
1. Direcciones de los clubes → `src/data/zonas.js`, objeto `direcciones`.
   El mapa del sitio es un proyecto privado de Google Earth (id 1-YPTC-J9rxeBx7dmcqmWHAE6ACc15AH):
   exportarlo como KML desde Google Earth y pasarlo para cargar todas las ubicaciones juntas.
2. Publicar con HTTPS (Firebase Hosting como La Pulga, o GitHub Pages) para que se pueda instalar.
3. Escudos: en ligaargentina2026.shop/mi-club están como imágenes sin nombre; hay que asociarlos a mano.

## Fuentes
- Logo: https://ligaargentina2026.shop/_assets/media/0141cf5de6c075749b0a87d21efc215f.png
- Zonas/clubes: https://ligaargentina2026.shop/tablas (cada zona tiene su subpágina de tabla)
- Referencias de estilo: repos Xelerom1985/LaPulga-Fulsal y Xelerom1985/LaCanilla
