import { useMemo, useState } from 'react'
import { norm } from '../data/zonas'
import { useClubes, zonaPorId } from '../data/clubes'
import { Atras, Lupa } from './Iconos'
import ClubRow from './ClubRow'

// Índice: club (por nombre) → zonas donde juega
function armarIndice(clubes) {
  const m = new Map()
  for (const c of clubes) {
    const k = norm(c.nombre)
    if (!m.has(k)) m.set(k, { club: c, zonas: [], key: k })
    const e = m.get(k)
    const z = zonaPorId[c.zonaId]
    if (z) e.zonas.push(z)
    if (!e.club.escudo && c.escudo) e.club = c
  }
  return [...m.values()].filter(e => e.zonas.length).sort((a, b) => a.club.nombre.localeCompare(b.club.nombre, 'es'))
}

export default function Buscar({ volver }) {
  const [q, setQ] = useState('')
  const clubes = useClubes()
  const indice = useMemo(() => armarIndice(clubes), [clubes])
  const res = useMemo(() => {
    const n = norm(q.trim())
    return n ? indice.filter(i => i.key.includes(n)) : indice
  }, [q, indice])

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
            <ClubRow key={i.key} club={i.club} color={i.zonas[0].grupo.color}
              extra={i.zonas.map(z => z.nombre).join(' · ')} />
          ))}
          {res.length === 0 && <p className="text-white/40 text-sm text-center py-10">No encontramos ese club</p>}
        </div>
        <div className="h-8" />
      </div>
    </div>
  )
}
