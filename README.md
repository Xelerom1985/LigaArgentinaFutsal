# Liga Argentina de Futsal — PWA

App instalable (PWA) con las zonas de la liga y la ubicación de cada club.
Mismo stack que La Pulga: React + Vite + Tailwind + vite-plugin-pwa.

## Correr en local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build   # genera dist/ (con sw.js y manifest)
```

## Publicado
https://liga-argentina-futsal.web.app (Firebase project `liga-argentina-futsal`).
Para actualizar: `npm run build` + `firebase deploy --only hosting`.

## Publicar desde cero (Firebase Hosting, igual que La Pulga)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public: dist · single-page app: Sí
npm run build
firebase deploy
```
La instalación del PWA necesita HTTPS (Firebase, GitHub Pages o Netlify lo dan).

## Cargar ubicaciones de los clubes
Editar `src/data/zonas.js` → objeto `direcciones`:
```js
export const direcciones = {
  'VILLA URQUIZÚ': 'Av. Siempreviva 742, Burzaco',
}
```
Si un club no tiene dirección, el botón "Cómo llegar" busca el club por nombre en Google Maps.

## Datos
Zonas y clubes tomados de https://ligaargentina2026.shop/tablas (nov 2026).
