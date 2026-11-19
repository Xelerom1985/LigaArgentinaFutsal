import { useEffect, useState } from 'react'
import { db, ref, onValue } from '../firebase'
import { todasLasZonas, direcciones } from './zonas'
import { escudoDe } from './escudos'

// Datos de arranque (los que venían en el código). Se suben a Firebase la
// primera vez que entra el admin; después manda lo que hay en Firebase.
export function semilla() {
  const out = {}
  let n = 0
  for (const z of todasLasZonas) for (const nombre of z.clubes) {
    out['c' + String(++n).padStart(3, '0')] = {
      nombre, zonaId: z.id, escudo: escudoDe(nombre, z.id) || '', ubicacion: direcciones[nombre] || '',
    }
  }
  return out
}

const aLista = obj => Object.entries(obj || {}).map(([id, c]) => ({ id, ...c }))
const CACHE = 'laf_clubes_v1'

function leerCache() {
  try { const v = localStorage.getItem(CACHE); return v ? JSON.parse(v) : null } catch { return null }
}

let actual = aLista(leerCache() || semilla())
const oyentes = new Set()
let suscripto = false

function suscribir() {
  if (suscripto) return
  suscripto = true
  onValue(ref(db, 'clubes'), snap => {
    const v = snap.val()
    if (!v) return // base vacía: seguimos con la semilla
    actual = aLista(v)
    try { localStorage.setItem(CACHE, JSON.stringify(v)) } catch {}
    oyentes.forEach(f => f(actual))
  }, () => {})
}

export function useClubes() {
  const [lista, setLista] = useState(actual)
  useEffect(() => {
    suscribir()
    oyentes.add(setLista)
    setLista(actual)
    return () => oyentes.delete(setLista)
  }, [])
  return lista
}

export const zonaPorId = Object.fromEntries(todasLasZonas.map(z => [z.id, z]))
