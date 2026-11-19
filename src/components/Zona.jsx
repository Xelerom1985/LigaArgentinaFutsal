import { todasLasZonas } from '../data/zonas'
import { Atras } from './Iconos'
import ClubRow from './ClubRow'

export default function Zona({ zonaId, volver }) {
  const z = todasLasZonas.find(x => x.id === zonaId)
  if (!z) return null
  const clubes = [...z.clubes].sort((a, b) => a.localeCompare(b, 'es'))
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 safe-top" style={{ background: 'rgba(6,20,42,0.88)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2 px-2 py-3 max-w-md mx-auto">
          <button onClick={volver} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" aria-label="Volver">
            <Atras className="w-6 h-6" />
          </button>
          <img src="./logo.png" alt="" className="w-9 h-9 object-contain" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: z.grupo.color }}>{z.grupo.nombre}</p>
            <h2 className="font-display text-2xl leading-none tracking-wide truncate">{z.nombre}</h2>
          </div>
        </div>
        <div className="h-0.5" style={{ background: z.grupo.color }} />
      </header>

      <div className="px-3 mt-4 w-full max-w-md mx-auto float-in">
        <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5"
          style={{ background: 'rgba(11,31,58,0.92)' }}>
          {clubes.map(c => <ClubRow key={c} club={c} color={z.grupo.color} />)}
        </div>
        <p className="text-white/25 text-xs text-center mt-3 mb-8">Tocá un club para abrir su ubicación en Google Maps</p>
      </div>
    </div>
  )
}
