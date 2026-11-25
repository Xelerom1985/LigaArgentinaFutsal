import { CATEGORIAS } from './categorias'
import { torneoDe } from './torneo'

// Tabla de posiciones de una zona, sin goles: 3 pts ganado, 1 empatado, 0 perdido.
// Devuelve una tabla por categoría y una general que suma todas las categorías.
// Cada club suma en la tabla de SU zona (si juega contra un club de otra zona,
// el partido cuenta para los dos, cada uno en su zona).
const vacia = () => ({ pj: 0, pg: 0, pe: 0, pp: 0, pts: 0 })
function sumar(s, r) {
  s.pj++
  if (r === 'G') { s.pg++; s.pts += 3 } else if (r === 'E') { s.pe++; s.pts += 1 } else s.pp++
}
const ordenar = filas => filas.sort((a, b) =>
  b.pts - a.pts || b.pg - a.pg || a.pp - b.pp || a.nombre.localeCompare(b.nombre, 'es'))

// `torneoId`: solo cuentan los partidos de ese torneo (Apertura, Clausura…)
export function calcularTablas(partidos, clubes, zonaId, torneoId) {
  const delaZona = clubes.filter(c => c.zonaId === zonaId)
  const nombres = new Set(delaZona.map(c => c.nombre))
  const porCat = {}   // cat -> nombre -> stats
  const general = {}  // nombre -> stats

  for (const p of partidos) {
    if (torneoId && torneoDe(p) !== torneoId) continue
    const res = p.resultados || {}
    const lados = [
      { nombre: p.local, zona: p.zonaId, gana: 'L' },
      { nombre: p.visitante, zona: p.visitanteZonaId || p.zonaId, gana: 'V' },
    ].filter(l => l.zona === zonaId && nombres.has(l.nombre))
    if (!lados.length) continue
    ;(p.categorias || []).forEach((cat, i) => {
      const r = res[i]
      if (!r || r === 'C') return // C = categoría cancelada: por ahora no suma para nadie
      for (const l of lados) {
        const resultado = r === 'E' ? 'E' : r === l.gana ? 'G' : 'P'
        porCat[cat] ??= {}
        sumar(porCat[cat][l.nombre] ??= vacia(), resultado)
        sumar(general[l.nombre] ??= vacia(), resultado)
      }
    })
  }

  const filas = mapa => ordenar(delaZona.map(c => ({ ...c, ...(mapa[c.nombre] || vacia()) })))
  // Siempre todas las categorías oficiales (en 0 si todavía no hay resultados),
  // más alguna vieja que tenga resultados y ya no esté en la lista
  const conDatos = Object.keys(porCat)
  const categorias = [...CATEGORIAS, ...conDatos.filter(c => !CATEGORIAS.includes(c))]
  return {
    categorias,
    hayDatos: conDatos.length > 0,
    general: filas(general),
    porCategoria: Object.fromEntries(categorias.map(c => [c, filas(porCat[c] || {})])),
  }
}
