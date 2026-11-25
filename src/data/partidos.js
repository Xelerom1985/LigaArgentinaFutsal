import { useEffect, useState } from 'react'
import { db, ref, onValue, get, query, orderByChild, startAt } from '../firebase'
import { limpiarVencidas } from './limpieza'
import { contarBajada } from './metricas'

// Todos los partidos (lectura pública) para armar tablas y Mi club.
//
// Para no gastar la descarga gratis de Firebase (10 GB/mes), cada celular guarda
// los partidos y la marca `hasta` (último `act` visto). Al abrir la app pide solo
// los partidos con `act` posterior: los nuevos, los modificados y los borrados
// (que quedan como { borrado: true }). La primera vez se baja todo.
const CACHE = 'laf_partidos_v2'
const leer = () => { try { return JSON.parse(localStorage.getItem(CACHE)) || null } catch { return null } }
let guardado = leer() || { datos: {}, hasta: 0 }
const aLista = datos => Object.entries(datos).map(([id, x]) => ({ id, ...x })).filter(x => !x.borrado)
let actual = aLista(guardado.datos)
const oyentes = new Set()
let suscripto = false
let demo = false

function aplicar(cambios, completo) {
  if (demo) return
  contarBajada(cambios)
  const datos = completo ? { ...(cambios || {}) } : { ...guardado.datos, ...(cambios || {}) }
  let hasta = completo ? 0 : guardado.hasta
  for (const p of Object.values(cambios || {})) if (typeof p?.act === 'number' && p.act > hasta) hasta = p.act
  guardado = { datos, hasta }
  try { localStorage.setItem(CACHE, JSON.stringify(guardado)) } catch {}
  actual = aLista(datos)
  oyentes.forEach(f => f(actual))
  limpiarVencidas(actual).catch(() => {})
}

async function suscribir() {
  if (suscripto) return
  suscripto = true
  try {
    // Primera vez en este celular: se baja todo una sola vez
    if (!guardado.hasta && !Object.keys(guardado.datos).length) {
      const s = await get(ref(db, 'partidos'))
      aplicar(s.val(), true)
    }
  } catch { /* sin conexión: seguimos con lo guardado */ }
  // Después, en vivo, solo lo que cambió desde la última vez
  onValue(query(ref(db, 'partidos'), orderByChild('act'), startAt(guardado.hasta + 1)), s => aplicar(s.val(), false), () => {})
}

// Para la demo (solo en desarrollo)
export function cargarDemo(lista) { demo = true; actual = lista; oyentes.forEach(f => f(actual)) }

export function usePartidos() {
  const [lista, setLista] = useState(actual)
  useEffect(() => {
    suscribir()
    oyentes.add(setLista)
    setLista(actual)
    return () => oyentes.delete(setLista)
  }, [])
  return lista
}
