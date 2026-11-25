import { db, ref, update } from '../firebase'

// Las planillas firmadas se borran TODOS LOS DOMINGOS A LAS 6:00 (hora argentina):
// así, cuando arranca la fecha, las de la fecha anterior ya no ocupan lugar en la base.
// Antes de eso, el admin las descarga en ZIP (pestaña Planillas).
//
// "Semana" = desde el domingo 6:00 ART (09:00 UTC) hasta el domingo siguiente.
// El 1/1/1970 fue jueves; el primer domingo 09:00 UTC cae 3 días y 9 horas después.
// La misma cuenta está en database.rules.json (no tocar una sin la otra).
const CORTE = 291600000 // 3 d 9 h en ms
const SEMANA = 604800000
const semana = t => Math.floor((t - CORTE) / SEMANA)
export const CUANDO_SE_BORRAN = 'todos los domingos a las 6:00'

export const vencida = meta => !!meta && (meta.borrada || semana(Date.now()) > semana(meta.subido || 0))
// Domingo 6:00 en que se borra una planilla subida en `subido`
export const venceEl = meta => new Date((semana(meta?.subido || 0) + 1) * SEMANA + CORTE)

// No hay servidor: cualquier celular que abre la app borra las planillas vencidas.
// Las reglas de la base solo lo permiten después del domingo 6:00.
// Margen de 10 minutos por si el reloj del celular está adelantado.
let hecho = false
export async function limpiarVencidas(partidos) {
  if (hecho || !partidos.length) return
  hecho = true
  const ahora = semana(Date.now() - 10 * 60 * 1000)
  for (const p of partidos) {
    for (const [i, h] of Object.entries(p.hojas || {})) {
      if (h && !h.borrada && h.subido && ahora > semana(h.subido)) {
        // De a una: si alguna falla, las demás se borran igual
        await update(ref(db), { [`hojas/${p.id}/${i}`]: null, [`partidos/${p.id}/hojas/${i}/borrada`]: true }).catch(() => {})
      }
    }
  }
}
