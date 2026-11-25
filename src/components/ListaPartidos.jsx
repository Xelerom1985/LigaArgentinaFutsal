import { zonaPorId } from '../data/clubes'
import { fechaCorta, avance, hoyISO } from '../data/categorias'
import Escudo, { useEscudo } from './Escudo'
import { Flecha } from './Iconos'

// "Elite A" o, si el visitante es de otra zona, "Elite A vs Premier A"
export const nombreZonas = p => {
  const a = zonaPorId[p.zonaId]?.nombre || p.zonaId
  const v = p.visitanteZonaId && p.visitanteZonaId !== p.zonaId ? zonaPorId[p.visitanteZonaId]?.nombre || p.visitanteZonaId : ''
  return v ? `${a} vs ${v}` : a
}

export function TarjetaPartido({ p, abrir, mostrarArbitro }) {
  const escudo = useEscudo()
  const a = avance(p)
  const color = p.estado === 'cerrado' ? '#94a3b8' : a.total && a.resultados === a.total ? '#22c55e' : a.resultados ? '#facc15' : '#ef4444'
  return (
    <button onClick={() => abrir(p.id)}
      className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 active:scale-[0.98] transition-transform relative overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex items-center justify-between text-[11px] text-white/45 mb-2 pl-1">
        <span className="uppercase tracking-wider truncate mr-2">{nombreZonas(p)}</span>
        <span className="shrink-0">{p.estado === 'cerrado' ? 'Cerrado' : `${a.resultados}/${a.total} resultados · ${a.hojas}/${a.total} hojas`}</span>
      </div>
      <div className="flex items-center gap-2 pl-1">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {[[p.local, 'L', p.zonaId], [p.visitante, 'V', p.visitanteZonaId || p.zonaId]].map(([n, k, z]) => (
            <div key={k} className="flex items-center gap-2.5">
              <Escudo src={escudo(n, z)} nombre={n} className="w-8 h-8" />
              <span className="text-sm font-bold leading-tight truncate">{n}</span>
              <span className="text-[10px] text-white/30 uppercase">{k === 'L' ? 'Local' : 'Visit.'}</span>
            </div>
          ))}
        </div>
        <Flecha className="w-5 h-5 text-white/30 shrink-0" />
      </div>
      {mostrarArbitro && <p className="text-xs text-amber-300/80 mt-2 pl-1">Árbitro: {p.arbitroNombre || 'sin asignar'}</p>}
    </button>
  )
}

// Agrupa por fecha: primero hoy y las próximas, después las pasadas (más nuevas arriba)
export default function ListaPartidos({ partidos, abrir, mostrarArbitro, vacio }) {
  const hoy = hoyISO()
  const fechas = [...new Set(partidos.map(p => p.fecha))]
  const proximas = fechas.filter(f => f >= hoy).sort()
  const pasadas = fechas.filter(f => f < hoy).sort().reverse()
  if (!partidos.length) return <p className="text-white/45 text-sm text-center py-12">{vacio}</p>
  const bloque = (f, i) => (
    <section key={f} className="float-in" style={{ animationDelay: `${i * 40}ms` }}>
      <h3 className="font-display text-xl tracking-wider mb-2 flex items-center gap-2 text-amber-300">
        <span className="inline-block w-1.5 h-4 rounded-full bg-amber-300" />
        {fechaCorta(f)}{f === hoy && <span className="text-xs font-sans font-bold bg-red-500 text-white rounded-full px-2 py-0.5 tracking-normal">HOY</span>}
      </h3>
      <div className="flex flex-col gap-2">
        {partidos.filter(p => p.fecha === f).sort((a, b) => (a.creado || 0) - (b.creado || 0)).map(p => <TarjetaPartido key={p.id} p={p} abrir={abrir} mostrarArbitro={mostrarArbitro} />)}
      </div>
    </section>
  )
  return (
    <div className="flex flex-col gap-5">
      {proximas.map(bloque)}
      {pasadas.length > 0 && <p className="text-white/30 text-xs uppercase tracking-widest text-center mt-2">Fechas anteriores</p>}
      {pasadas.map(bloque)}
    </div>
  )
}
