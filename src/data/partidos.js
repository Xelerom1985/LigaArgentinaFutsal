import { useEffect, useState } from 'react'
import { db, ref, onValue } from '../firebase'
import { limpiarVencidas } from './limpieza'

// Todos los partidos (lectura pública) para armar las tablas. Se guardan en el
// celular para que las tablas se vean aunque no haya señal.
const CACHE = 'laf_partidos_v1'
const aLista = v => Object.entries(v || {}).map(([id, x]) => ({ id, ...x }))
let actual = (() => { try { return aLista(JSON.parse(localStorage.getItem(CACHE) || 'null')) } catch { return [] } })()
const oyentes = new Set()
let suscripto = false
let demo = false

function suscribir() {
  if (suscripto) return
  suscripto = true
  onValue(ref(db, 'partidos'), s => {
    if (demo) return
    const v = s.val() || {}
    actual = aLista(v)
    try { localStorage.setItem(CACHE, JSON.stringify(v)) } catch {}
    oyentes.forEach(f => f(actual))
    limpiarVencidas(actual).catch(() => {})
  }, () => {})
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
