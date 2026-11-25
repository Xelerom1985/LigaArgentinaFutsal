import { useEffect, useState } from 'react'
import { db, ref, onValue, update } from '../firebase'
import { contarBajada } from './metricas'

// Torneos (Apertura, Clausura…). En la base: /config/torneoActual = id, /config/torneos/{id} = { nombre, desde }.
// Cada partido guarda `torneo` (id). Los partidos sin torneo cuentan como el primero.
export const TORNEO_INICIAL = 'apertura-2027'
const INICIAL = { actual: TORNEO_INICIAL, torneos: { [TORNEO_INICIAL]: { nombre: 'Torneo Apertura 2027', desde: 1 } } }
export const torneoDe = p => p.torneo || TORNEO_INICIAL

const CACHE = 'laf_torneos_v1'
let estado = (() => { try { return JSON.parse(localStorage.getItem(CACHE)) || INICIAL } catch { return INICIAL } })()
const oyentes = new Set()
let suscripto = false

function suscribir() {
  if (suscripto) return
  suscripto = true
  onValue(ref(db, 'config'), s => {
    const v = s.val() || {}
    contarBajada(v)
    estado = {
      actual: v.torneoActual || TORNEO_INICIAL,
      torneos: { ...INICIAL.torneos, ...(v.torneos || {}) },
    }
    try { localStorage.setItem(CACHE, JSON.stringify(estado)) } catch {}
    oyentes.forEach(f => f(estado))
  }, () => {})
}

// { actual, torneos, lista (más nuevo primero), nombre(id) }
export function useTorneos() {
  const [e, setE] = useState(estado)
  useEffect(() => { suscribir(); oyentes.add(setE); setE(estado); return () => oyentes.delete(setE) }, [])
  const lista = Object.entries(e.torneos).map(([id, t]) => ({ id, ...t })).sort((a, b) => (b.desde || 0) - (a.desde || 0))
  return { ...e, lista, nombre: id => e.torneos[id]?.nombre || id, nombreActual: e.torneos[e.actual]?.nombre || e.actual }
}

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/^torneo\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Admin: empieza un torneo nuevo (las tablas arrancan de cero)
export async function empezarTorneo(nombre) {
  const n = nombre.trim()
  const id = slug(n)
  if (!id) throw new Error('Poné un nombre')
  await update(ref(db, 'config'), { torneoActual: id, [`torneos/${id}`]: { nombre: n, desde: Date.now() } })
  return id
}
// Admin: volver a uno anterior como torneo en curso
export const elegirTorneoActual = id => update(ref(db, 'config'), { torneoActual: id })
