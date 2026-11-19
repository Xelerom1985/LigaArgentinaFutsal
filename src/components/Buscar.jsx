import { useMemo, useState } from 'react'
import { todasLasZonas, norm } from '../data/zonas'
import { Atras, Lupa } from './Iconos'
import ClubRow from './ClubRow'

// Índice: club → zonas donde juega
const indice = (() => {
  const m = new Map()
  for (const z of todasLasZonas) for (const c of z.clubes) {
    if (!m.has(c)) m.set(c, [])
    m.get(c).push(z)
  }
  return [...m.entries()].map(([club, zonas]) => ({ club, zonas, key: norm(club) }))
    .sort((a, b) => a.club.localeCompare(b.club, 'es'))
})()

export default function Buscar({ volver }) {
  const [q, setQ] = useState('')
  const res = useMemo(() => {
    const n = norm(q.trim())
    return n ? indice.filter(i => i.key.includes(n)) : indice
  }, [q])

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 safe-top" style={{ background: 'rgba(6,20,42,0.92)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2 px-2 py-3 max-w-md mx-auto">
          <button onClick={volver} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" aria-label="Volver">
            <Atras className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/10 px-3">
            <Lupa className="w-5 h-5 text-white/40" />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Nombre del club"
              className="flex-1 bg-transparent py-2.5 text-[16px] outline-none placeholder:text-white/35"
            />
          </div>
        </div>
      </header>
      <div className="px-3 mt-3 w-full max-w-md mx-auto">
        <p className="text-white/35 text-xs mb-2 px-1">{res.length} {res.length === 1 ? "club" : "clubes"}</p>
        <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5" style={{ background: 'rgba(11,31,58,0.92)' }}>
          {res.map(i => (
            <ClubRow key={i.club} club={i.club} color={i.zonas[0].grupo.color}
              extra={i.zonas.map(z => z.nombre).join(' · ')} />
          ))}
          {res.length === 0 && <p className="text-white/40 text-sm text-center py-10">No encontramos ese club</p>}
        </div>
        <div className="h-8" />
      </div>
    </div>
  )
}
