import { useMemo, useState } from 'react'
import { todasLasZonas } from '../data/zonas'
import { useClubes } from '../data/clubes'
import { usePartidos } from '../data/partidos'
import { calcularTablas } from '../data/tablas'
import { useTorneos } from '../data/torneo'
import { Escudo } from './ClubRow'
import { Atras } from './Iconos'

export default function Tablas({ zonaId, volver }) {
  const clubes = useClubes()
  const partidos = usePartidos()
  const torneos = useTorneos()
  const [torneoSel, setTorneoSel] = useState('')
  const torneoId = torneoSel || torneos.actual
  const z = todasLasZonas.find(x => x.id === zonaId)
  const t = useMemo(() => calcularTablas(partidos, clubes, zonaId, torneoId), [partidos, clubes, zonaId, torneoId])
  const [cat, setCat] = useState('general')
  if (!z) return null
  const filas = cat === 'general' ? t.general : t.porCategoria[cat] || t.general
  const hayDatos = t.hayDatos

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 safe-top" style={{ background: 'rgba(6,20,42,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2 px-2 py-3 max-w-md mx-auto">
          <button onClick={volver} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" aria-label="Volver">
            <Atras className="w-6 h-6" />
          </button>
          <img src="./logo.png" alt="" className="w-9 h-9 object-contain" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: z.grupo.color }}>{torneos.nombre(torneoId)}</p>
            <h2 className="font-display text-2xl leading-none tracking-wide truncate">{z.nombre}</h2>
          </div>
        </div>
        {/* Torneo (si hay más de uno) */}
        {torneos.lista.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 max-w-md mx-auto no-scrollbar">
            {torneos.lista.map(x => (
              <button key={x.id} onClick={() => setTorneoSel(x.id)}
                className={`shrink-0 rounded-lg px-3 py-1 text-[11px] font-bold border ${torneoId === x.id ? 'bg-white text-noche border-white' : 'border-white/15 text-white/55'}`}>
                {x.nombre}{x.id === torneos.actual ? ' · en curso' : ''}
              </button>
            ))}
          </div>
        )}
        {/* Categorías: General + todas */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 max-w-md mx-auto no-scrollbar">
          {['general', ...t.categorias].map(c => (
            <button key={c} onClick={e => { setCat(c); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }) }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-colors ${cat === c ? 'text-noche border-transparent' : 'border-white/15 text-white/70 bg-white/5'}`}
              style={cat === c ? { background: z.grupo.color } : undefined}>
              {c === 'general' ? 'General' : c}
            </button>
          ))}
        </div>
        <div className="h-0.5" style={{ background: z.grupo.color }} />
      </header>

      <div className="px-3 pt-4 pb-6 w-full max-w-md mx-auto float-in" key={cat}>
        <p className="font-display text-xl tracking-wider text-center mb-2" style={{ color: z.grupo.color }}>
          {cat === 'general' ? 'Tabla general · todas las categorías' : cat}
          <span className="block font-sans text-[11px] tracking-widest uppercase text-white/50">{torneos.nombre(torneoId)}</span>
        </p>
        <TablaPosiciones filas={filas} />
        <p className="text-white/40 text-[11px] text-center mt-3">
          {hayDatos ? 'PJ jugados · PG ganados · PE empatados · PP perdidos · Ganado 3, empate 1, perdido 0' : 'Todavía no hay resultados cargados en esta zona.'}
        </p>
        {cat === 'general' && hayDatos && <p className="text-white/30 text-[11px] text-center mt-1">La general suma los puntos de todas las categorías.</p>}
      </div>
    </div>
  )
}

// Tabla tipo la de la Liga en Instagram. `destacado` = nombre del club a resaltar.
export function TablaPosiciones({ filas, destacado }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white text-noche shadow-xl">
          <div className="grid grid-cols-[28px_1fr_30px_30px_30px_30px_40px] items-center text-[10px] font-bold uppercase text-white px-2 py-2"
            style={{ background: '#14305a' }}>
            <span className="text-center">P</span><span className="pl-1">Equipos</span>
            <span className="text-center">PJ</span><span className="text-center">PG</span><span className="text-center">PE</span><span className="text-center">PP</span>
            <span className="text-center">PTS</span>
          </div>
          {filas.map((f, i) => (
            <div key={f.id || f.nombre} className={`grid grid-cols-[28px_1fr_30px_30px_30px_30px_40px] items-center px-2 py-2 text-xs border-t border-noche/10 ${f.nombre === destacado ? 'bg-amber-200' : i % 2 ? 'bg-[#eef4fb]' : 'bg-white'}`}>
              <span className={`text-center font-black ${i === 0 && f.pts ? 'text-amber-500' : 'text-noche/60'}`}>{i + 1}</span>
              <span className="flex items-center gap-1.5 min-w-0 pl-1">
                <Escudo club={f} size="w-6 h-6" color="#14305a" />
                <span className="font-bold uppercase truncate text-[11px]">{f.nombre}</span>
              </span>
              <span className="text-center text-noche/60">{f.pj}</span>
              <span className="text-center">{f.pg}</span>
              <span className="text-center">{f.pe}</span>
              <span className="text-center">{f.pp}</span>
              <span className="text-center font-black text-sm">{f.pts}</span>
            </div>
          ))}
        </div>
  )
}
