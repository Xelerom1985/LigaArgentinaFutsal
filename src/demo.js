// Datos de prueba para ?demo=admin / ?demo=arbitro (solo en `npm run dev`)
import { CATEGORIAS, finDeSemana } from './data/categorias'

const [sab, dom] = finDeSemana()
export const sesion = rol => ({ usuario: { uid: 'demo1' }, rol, arbitro: { nombre: 'Juan', apellido: 'Pérez' } })
export const arbitros = [
  { id: 'demo1', nombre: 'Juan', apellido: 'Pérez', pin: '4821', activo: true },
  { id: 'demo2', nombre: 'Marcela', apellido: 'Gómez', pin: '1937', activo: true },
  { id: 'demo3', nombre: 'Luis', apellido: 'Rodríguez', pin: '7710', activo: false },
]
export const partidos = [
  { id: 'p1', fecha: sab, zonaId: 'elite-a', local: 'VILLA URQUIZÚ', visitante: 'PARQUE DEL REY', categorias: CATEGORIAS,
    arbitroUid: 'demo1', arbitroNombre: 'Juan Pérez', estado: 'en curso', creado: 1,
    resultados: { 0: 'V', 1: 'V', 2: 'E', 3: 'L', 4: 'L', 5: 'L' }, hojas: { 0: { nombre: 'hoja.jpg', tipo: 'imagen', subido: 1 } } },
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
