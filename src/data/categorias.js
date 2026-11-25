// Categorías de una jornada, en el orden en que se juegan.
// Al asignar un partido el admin puede sacar las que no corresponden.
export const CATEGORIAS = [
  'Reserva Femenino',
  'Reserva Masculino',
  '5ta',
  '4ta',
  '6ta',
  '1ra Femenino',
  '+33',
  '3ra',
  '+40',
  '+45',
  '1ra Masculino',
]

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const aFecha = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const hoyISO = () => isoDe(new Date())
export const isoDe = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export function fechaCorta(s) {
  if (!s) return ''
  const d = aFecha(s)
  return `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
// Próximo sábado y domingo (o los de hoy, si hoy es fin de semana)
export function finDeSemana() {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  const sab = new Date(d)
  sab.setDate(d.getDate() + (dow === 0 ? -1 : 6 - dow))
  const dom = new Date(sab); dom.setDate(sab.getDate() + 1)
  return [isoDe(sab), isoDe(dom)]
}

// Cuántas categorías tienen resultado y hoja
export function avance(p) {
  const cats = p.categorias || []
  const r = p.resultados || {}
  const h = p.hojas || {}
  return {
    total: cats.length,
    resultados: cats.filter((_, i) => r[i]).length,
    hojas: cats.filter((_, i) => h[i]).length,
  }
}
