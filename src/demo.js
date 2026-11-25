// Datos de prueba para ?demo=admin / ?demo=arbitro (solo en `npm run dev`)
import { CATEGORIAS, finDeSemana } from './data/categorias'

const [sab, dom] = finDeSemana()
export const sesion = rol => rol === 'super'
  ? { usuario: { uid: 'super' }, rol: 'admin', superAdmin: true }
  : { usuario: { uid: 'demo1' }, rol, arbitro: { nombre: 'Juan', apellido: 'Pérez' } }
export const arbitros = [
  { id: 'demo1', nombre: 'Juan', apellido: 'Pérez', pin: '4821', activo: true },
  { id: 'demo2', nombre: 'Marcela', apellido: 'Gómez', pin: '1937', activo: true },
  { id: 'demo3', nombre: 'Luis', apellido: 'Rodríguez', pin: '7710', activo: false },
]
export const partidos = [
  { id: 'p1', fecha: sab, zonaId: 'elite-a', local: 'VILLA URQUIZÚ', visitante: 'PARQUE DEL REY', categorias: CATEGORIAS,
    arbitroUid: 'demo1', arbitroNombre: 'Juan Pérez', estado: 'en curso', creado: 1,
    resultados: { 0: 'V', 1: 'V', 2: 'E', 3: 'L', 4: 'L', 5: 'L' }, hojas: { 0: { nombre: 'hoja.jpg', tipo: 'imagen', subido: Date.now() - 2 * 864e5 }, 1: { nombre: 'vieja.jpg', tipo: 'imagen', subido: 1, borrada: true } } },
  { id: 'p2', fecha: sab, zonaId: 'sudoeste-a1', local: '9 DE JULIO LANÚS', visitante: 'BUJÍA', categorias: CATEGORIAS.slice(0, 6),
    arbitroUid: 'demo1', arbitroNombre: 'Juan Pérez', estado: 'pendiente', creado: 2 },
  { id: 'p4', fecha: sab, zonaId: 'elite-a', visitanteZonaId: 'premier-a', local: 'ALVEAR', visitante: 'ALBERDI', categorias: CATEGORIAS,
    arbitroUid: 'demo1', arbitroNombre: 'Juan Pérez', estado: 'pendiente', creado: 4 },
  { id: 'p5', fecha: '2026-11-14', zonaId: 'elite-a', local: 'SPINOLA', visitante: 'ALVEAR', categorias: CATEGORIAS,
    arbitroUid: 'demo2', arbitroNombre: 'Marcela Gómez', estado: 'cerrado', creado: 5,
    resultados: { 0: 'L', 1: 'L', 2: 'V', 3: 'E', 4: 'L', 5: 'V', 6: 'L', 7: 'E', 8: 'L', 9: 'V', 10: 'L' } },
  { id: 'p6', fecha: '2026-11-14', zonaId: 'elite-a', local: 'VILLA URQUIZÚ', visitante: 'OTAMENDI', categorias: CATEGORIAS,
    arbitroUid: 'demo1', arbitroNombre: 'Juan Pérez', estado: 'cerrado', creado: 6,
    resultados: { 0: 'V', 1: 'L', 2: 'L', 3: 'L', 4: 'E', 5: 'L', 6: 'V', 7: 'L', 8: 'E', 9: 'L', 10: 'L' } },
  { id: 'p3', fecha: dom, zonaId: 'copa-plata', local: 'JUNIOR FUTSAL', visitante: 'LA 50', categorias: CATEGORIAS,
    arbitroUid: 'demo2', arbitroNombre: 'Marcela Gómez', estado: 'cerrado', creado: 3 },
]

// Métricas de prueba para el Backoffice (?demo=super)
export function metricas() {
  const out = {}
  const zonas = ['elite-a', 'elite-b', 'premier-a', 'sudoeste-a1', 'copa-oro', 'sudeste-a']
  const clubes = ['villa-urquizu', 'alvear', 'junior-futsal', '9-de-julio-lanus', 'parque-del-rey']
  for (let i = 0; i < 40; i++) {
    const t = Date.now() - i * 864e5
    const dia = new Date(t - 3 * 3600e3).toISOString().slice(0, 10)
    const finde = [0, 6].includes(new Date(t - 3 * 3600e3).getUTCDay())
    const v = Math.round((finde ? 140 : 45) * (1 + Math.sin(i) * 0.3) * (1 + (40 - i) / 60))
    const r = n => Math.max(0, Math.round(n * (0.6 + ((i * 7919 + n) % 10) / 12)))
    out[dia] = {
      gen: { visitantes: v, nuevos: r(v / 8), aperturas: r(v * 1.8) },
      disp: { android: r(v * 0.72), iphone: r(v * 0.22), pc: r(v * 0.06) },
      modo: { app: r(v * 0.35), web: r(v * 0.65) },
      horas: Object.fromEntries(Array.from({ length: 24 }, (_, h) => ['h' + String(h).padStart(2, '0'), r(v * (h >= 14 && h <= 20 ? 0.18 : h < 7 ? 0.005 : 0.05))])),
      vistas: { inicio: r(v * 1.8), tablas: r(v * 0.9), tabla: r(v * 1.4), 'mi-club': r(v * 0.8), zona: r(v * 0.5), buscar: r(v * 0.2), arbitro: r(6) },
      tablas: Object.fromEntries(zonas.map((z, k) => [z, r(v * 0.4 / (k + 1))])),
      zonas: Object.fromEntries(zonas.map((z, k) => [z, r(v * 0.2 / (k + 1))])),
      miclub: Object.fromEntries(clubes.map((c, k) => [c, r(v * 0.3 / (k + 1))])),
      acc: { 'como-llegar': r(v * 0.1), instalo: r(v / 20) },
      kb: { base: r(v * 350), hosting: r(v * 420) },
    }
  }
  return out
}
export function errores() {
  const dia = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)
  return { [dia]: { abc: { msg: "TypeError: Cannot read properties of undefined (reading 'nombre')", n: 3 } } }
}
