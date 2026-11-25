import { db, ref, update } from '../firebase'

// Las planillas firmadas duran 6 días: así, cuando arranca la fecha siguiente
// (el domingo), las de la fecha anterior ya no ocupan lugar en la base.
// Antes de que venzan, el admin las descarga en ZIP (pestaña Planillas).
export const DIAS_PLANILLA = 6
export const VIDA_PLANILLA = DIAS_PLANILLA * 24 * 60 * 60 * 1000

export const vencida = meta => !!meta && (meta.borrada || Date.now() - (meta.subido || 0) > VIDA_PLANILLA)
export const venceEl = meta => new Date((meta?.subido || 0) + VIDA_PLANILLA)

// No hay servidor: cualquier celular que abre la app borra las planillas vencidas.
// Las reglas de la base solo permiten borrar las que tienen más de 6 días.
// Se deja un margen de 10 minutos por si el reloj del celular está adelantado.
let hecho = false
export async function limpiarVencidas(partidos) {
  if (hecho || !partidos.length) return
  hecho = true
  const limite = Date.now() - VIDA_PLANILLA - 10 * 60 * 1000
  const cambios = {}
  for (const p of partidos) {
    for (const [i, h] of Object.entries(p.hojas || {})) {
      if (h && !h.borrada && h.subido && h.subido < limite) {
        cambios[`hojas/${p.id}/${i}`] = null
        cambios[`partidos/${p.id}/hojas/${i}/borrada`] = true
      }
    }
  }
  const n = Object.keys(cambios).length / 2
  if (!n) return
  // De a una planilla: si alguna falla (reloj, permisos), las demás se borran igual
  const claves = Object.keys(cambios).filter(k => k.startsWith('hojas/'))
  for (const k of claves) {
    const [, pid, i] = k.split('/')
    await update(ref(db), { [k]: null, [`partidos/${pid}/hojas/${i}/borrada`]: true }).catch(() => {})
  }
}
