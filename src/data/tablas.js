import { CATEGORIAS } from './categorias'

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

export function calcularTablas(partidos, clubes, zonaId) {
  const delaZona = clubes.filter(c => c.zonaId === zonaId)
  const nombres = new Set(delaZona.map(c => c.nombre))
  const porCat = {}   // cat -> nombre -> stats
  const general = {}  // nombre -> stats

  for (const p of partidos) {
    const res = p.resultados || {}
    const lados = [
      { nombre: p.local, zona: p.zonaId, gana: 'L' },
      { nombre: p.visitante, zona: p.visitanteZonaId || p.zonaId, gana: 'V' },
    ].filter(l => l.zona === zonaId && nombres.has(l.nombre))
    if (!lados.length) continue
    ;(p.categorias || []).forEach((cat, i) => {
      const r = res[i]
      if (!r) return
      for (const l of lados) {
        const resultado = r === 'E' ? 'E' : r === l.gana ? 'G' : 'P'
        porCat[cat] ??= {}
        sumar(porCat[cat][l.nombre] ??= vacia(), resultado)
        sumar(general[l.nombre] ??= vacia(), resultado)
      }
    })
  }

  const filas = mapa => ordenar(delaZona.map(c => ({ ...c, ...(mapa[c.nombre] || vacia()) })))
  // Categorías con resultados, en el orden oficial (y las que no estén en la lista, al final)
  const conDatos = Object.keys(porCat)
  const categorias = [...CATEGORIAS.filter(c => conDatos.includes(c)), ...conDatos.filter(c => !CATEGORIAS.includes(c))]
  return {
    categorias,
    general: filas(general),
    porCategoria: Object.fromEntries(categorias.map(c => [c, filas(porCat[c])])),
  }
}
