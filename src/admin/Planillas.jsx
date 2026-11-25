import { useMemo, useState } from 'react'
import { db, ref, get, mensajeError } from '../firebase'
import { zonaPorId } from '../data/clubes'
import { fechaCorta, isoDe } from '../data/categorias'
import { vencida, venceEl, CUANDO_SE_BORRAN } from '../data/limpieza'

const limpio = s => String(s || '').replace(/[\\/:*?"<>|]+/g, '-').trim()
const RES = { L: 'Ganó local', E: 'Empate', V: 'Ganó visitante' }
const diaHora = d => `${fechaCorta(isoDe(d))} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

// Planillas firmadas por fecha: descargar en ZIP antes de que se borren (domingo 6:00)
export default function Planillas({ partidos }) {
  const [bajando, setBajando] = useState('')
  const [progreso, setProgreso] = useState('')
  const [error, setError] = useState('')

  const fechas = useMemo(() => {
    const m = new Map()
    for (const p of partidos) {
      const hs = Object.values(p.hojas || {})
      if (!hs.length) continue
      const f = m.get(p.fecha) || { fecha: p.fecha, partidos: [], vivas: 0, borradas: 0, vence: null }
      f.partidos.push(p)
      for (const h of hs) {
        if (vencida(h)) f.borradas++
        else { f.vivas++; const v = venceEl(h); if (!f.vence || v < f.vence) f.vence = v }
      }
      m.set(p.fecha, f)
    }
    return [...m.values()].sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [partidos])

  const bajar = async f => {
    setBajando(f.fecha); setError(''); setProgreso('Preparando…')
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const filas = [['Zona', 'Local', 'Visitante', 'Categoría', 'Resultado', 'Planilla', 'Árbitro']]
      let n = 0, total = 0
      for (const p of f.partidos) {
        const zona = zonaPorId[p.zonaId]?.nombre || p.zonaId
        const zonaV = p.visitanteZonaId && p.visitanteZonaId !== p.zonaId ? ` vs ${zonaPorId[p.visitanteZonaId]?.nombre || p.visitanteZonaId}` : ''
        const carpeta = `${limpio(zona + zonaV)}/${limpio(p.local)} vs ${limpio(p.visitante)}`
        const vivas = Object.entries(p.hojas || {}).filter(([, h]) => !vencida(h))
        total += vivas.length
        const datos = vivas.length ? (await get(ref(db, 'hojas/' + p.id))).val() || {} : {}
        ;(p.categorias || []).forEach((cat, i) => {
          const h = datos[i]
          let archivo = ''
          if (h?.data) {
            const ext = h.tipo === 'pdf' ? 'pdf' : 'jpg'
            archivo = `${carpeta}/${String(i + 1).padStart(2, '0')} - ${limpio(cat)}.${ext}`
            zip.file(archivo, h.data.split(',')[1], { base64: true })
            n++; setProgreso(`Planilla ${n} de ${total}…`)
          }
          const r = (p.resultados || {})[i]
          filas.push([zona + zonaV, p.local, p.visitante, cat, r === 'C' ? `Cancelada: ${p.cancelaciones?.[i]?.motivo || ''}` : RES[r] || '', archivo ? 'Sí' : (p.hojas?.[i] ? 'Vencida' : 'No'), p.arbitroNombre || ''])
        })
      }
      // Resumen de resultados para abrir con Excel
      zip.file('resultados.csv', '﻿' + filas.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n'))
      setProgreso('Armando el ZIP…')
      const blob = await zip.generateAsync({ type: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `Planillas ${f.fecha}.zip`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 60000)
      setProgreso(`Listo: ${n} planillas descargadas`)
    } catch (e) { setError(mensajeError(e)); setProgreso('') } finally { setBajando('') }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-white/55 text-sm">
        Las planillas firmadas se borran solas <b className="text-white">{CUANDO_SE_BORRAN}</b>, para no llenar la base.
        Descargá el ZIP de la fecha antes (de domingo a sábado) y guardalo (por ejemplo en Drive). Incluye un <b className="text-white">resultados.csv</b> para Excel.
      </p>
      {progreso && <p className="text-sm text-amber-300">{progreso}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!fechas.length && <p className="text-white/45 text-sm text-center py-8">Todavía no hay planillas subidas.</p>}
      {fechas.map(f => {
        const quedan = f.vence ? Math.max(0, Math.ceil((f.vence - Date.now()) / 864e5)) : 0
        return (
          <div key={f.fecha} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl tracking-wider text-amber-300 leading-none">{fechaCorta(f.fecha)}</p>
              <p className="text-xs text-white/50 mt-1">
                {f.partidos.length} partido{f.partidos.length === 1 ? '' : 's'} · {f.vivas} planilla{f.vivas === 1 ? '' : 's'}
                {f.borradas ? ` · ${f.borradas} ya borrada${f.borradas === 1 ? '' : 's'}` : ''}
              </p>
              {f.vivas > 0 && (
                <p className={`text-xs mt-0.5 ${quedan <= 1 ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                  Se borran el {diaHora(f.vence)}{quedan <= 1 ? ' — ¡descargalas ya!' : ''}
                </p>
              )}
            </div>
            <button onClick={() => bajar(f)} disabled={!!bajando || !f.vivas}
              className="rounded-xl px-3 py-2.5 text-sm font-bold bg-amber-300 text-noche disabled:opacity-30 shrink-0">
              {bajando === f.fecha ? 'Bajando…' : 'Descargar ZIP'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
