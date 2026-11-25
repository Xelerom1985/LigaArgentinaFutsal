import { useMemo, useState } from 'react'
import { norm, mapsUrl } from '../data/zonas'
import { useClubes, zonaPorId } from '../data/clubes'
import { usePartidos } from '../data/partidos'
import { calcularTablas } from '../data/tablas'
import { useTorneos, torneoDe } from '../data/torneo'
import { fechaCorta, hoyISO } from '../data/categorias'
import { TablaPosiciones } from './Tablas'
import { Escudo } from './ClubRow'
import { Atras, Lupa, Pin } from './Iconos'

// ---- Mi club guardado en el celular ----
const KEY = 'laf_mi_club'
export const leerMiClub = () => { try { return localStorage.getItem(KEY) || '' } catch { return '' } }
export const guardarMiClub = n => { try { n ? localStorage.setItem(KEY, n) : localStorage.removeItem(KEY) } catch {} }

// Resultado de un partido/categoría visto desde el club: G, E o P
const resultadoPara = (p, esLocal, i) => {
  const r = (p.resultados || {})[i]
  if (!r) return null
  if (r === 'C') return 'C' // cancelada
  return r === 'E' ? 'E' : (r === 'L') === esLocal ? 'G' : 'P'
}
const COLOR = { G: 'bg-green-500', E: 'bg-amber-400 text-noche', P: 'bg-red-500', C: 'bg-white/20 text-red-300' }
const Bolita = ({ r, chica }) => (
  <span className={`${chica ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-xs'} rounded-full flex items-center justify-center font-black shrink-0 ${r ? COLOR[r] : 'bg-white/10 text-white/30'}`}>{r === 'C' ? '✕' : r || '·'}</span>
)

// ---- Elegir club ----
export function ElegirClub({ elegir, volver }) {
  const clubes = useClubes()
  const [q, setQ] = useState('')
  const lista = useMemo(() => {
    const m = new Map()
    for (const c of clubes) {
      const k = norm(c.nombre)
      if (!m.has(k)) m.set(k, { key: k, club: c, zonas: [] })
      const e = m.get(k)
      e.zonas.push(zonaPorId[c.zonaId]?.nombre || c.zonaId)
      if (!e.club.escudo && c.escudo) e.club = c
    }
    const n = norm(q.trim())
    return [...m.values()].filter(e => !n || e.key.includes(n)).sort((a, b) => a.club.nombre.localeCompare(b.club.nombre, 'es'))
  }, [clubes, q])

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 safe-top" style={{ background: 'rgba(6,20,42,0.92)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2 px-2 pt-3 max-w-md mx-auto">
          <button onClick={volver} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" aria-label="Volver"><Atras className="w-6 h-6" /></button>
          <h2 className="font-display text-2xl tracking-wide">Elegí tu club</h2>
        </div>
        <div className="px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white/[0.07] border border-white/10">
            <Lupa className="w-5 h-5 text-white/40" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar club…" className="flex-1 bg-transparent outline-none text-[16px]" />
          </div>
        </div>
      </header>
      <div className="px-4 pb-6 max-w-md mx-auto w-full flex flex-col gap-2">
        {lista.map(e => (
          <button key={e.key} onClick={() => elegir(e.key)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-white/[0.05] border border-white/10 text-left active:bg-white/10">
            <Escudo club={e.club} size="w-10 h-10" />
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-sm truncate">{e.club.nombre}</span>
              <span className="block text-xs text-white/45 truncate">{e.zonas.join(' · ')}</span>
            </span>
            <span className="text-amber-300 text-lg">☆</span>
          </button>
        ))}
        {!lista.length && <p className="text-center text-white/40 text-sm py-8">No se encontró ningún club</p>}
      </div>
    </div>
  )
}

// ---- Datos del club en una zona ----
export function useDatosClub(miKey) {
  const clubes = useClubes()
  const partidos = usePartidos()
  const { actual: torneoId } = useTorneos()
  const entradas = useMemo(() => clubes.filter(c => norm(c.nombre) === miKey), [clubes, miKey])
  const porZona = useMemo(() => entradas.map(club => {
    const z = club.zonaId
    const t = calcularTablas(partidos, clubes, z, torneoId)
    const pos = t.general.findIndex(f => f.nombre === club.nombre)
    const fila = t.general[pos] || { pj: 0, pg: 0, pe: 0, pp: 0, pts: 0 }
    const jugados = partidos
      .filter(p => torneoDe(p) === torneoId)
      .map(p => {
        const esLocal = p.local === club.nombre && p.zonaId === z
        const esVis = p.visitante === club.nombre && (p.visitanteZonaId || p.zonaId) === z
        if (!esLocal && !esVis) return null
        const cats = (p.categorias || []).map((c, i) => ({ cat: c, i, r: resultadoPara(p, esLocal, i) }))
        const pts = cats.reduce((s, x) => s + (x.r === 'G' ? 3 : x.r === 'E' ? 1 : 0), 0)
        return {
          ...p, esLocal, cats, pts, conResultados: cats.some(x => x.r),
          rival: esLocal ? p.visitante : p.local,
          rivalZona: esLocal ? (p.visitanteZonaId || p.zonaId) : p.zonaId,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.creado || 0) - (a.creado || 0))
    const porCategoria = t.categorias.map(c => ({ cat: c, ...(t.porCategoria[c].find(f => f.nombre === club.nombre)) })).filter(x => x.pj)
    return { club, zona: zonaPorId[z], tabla: t, pos: fila.pj ? pos + 1 : null, fila, jugados, porCategoria, total: t.general.length }
  }), [entradas, partidos, clubes, torneoId])
  return { entradas, porZona, clubes }
}

// ---- Pantalla Mi club ----
export default function MiClub({ miKey, cambiar, volver, abrirTabla }) {
  const { nombreActual } = useTorneos()
  const { porZona } = useDatosClub(miKey)
  const [zi, setZi] = useState(0)
  const [tab, setTab] = useState('resumen')
  const [catSel, setCatSel] = useState('general')
  const d = porZona[Math.min(zi, porZona.length - 1)]
  if (!d) return (
    <div className="px-6 pt-32 text-center flex flex-col items-center gap-4">
      <p className="text-white/60">No encontramos tu club. Puede que haya cambiado de nombre.</p>
      <button onClick={cambiar} className="rounded-xl px-6 py-3 bg-celeste text-noche font-bold">Elegir club</button>
    </div>
  )
  const { club, zona, fila } = d
  const color = zona?.grupo.color || '#74a9dd'
  const hoy = hoyISO()
  const proximo = [...d.jugados].reverse().find(p => p.fecha >= hoy && !p.conResultados)
  const ultimo = d.jugados.find(p => p.conResultados)
  const efectividad = fila.pj ? Math.round((fila.pts / (fila.pj * 3)) * 100) : null
  const forma = d.jugados.filter(p => p.conResultados).slice(0, 5)

  return (
    <div className="flex flex-col pb-6">
      {/* Cabecera */}
      <div className="safe-top border-b border-white/10" style={{ background: 'linear-gradient(180deg, rgba(20,48,90,0.95), rgba(11,31,58,0.9))' }}>
        <div className="max-w-md mx-auto px-4 pt-2 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={volver} className="w-10 h-10 -ml-2 flex items-center justify-center text-white/70" aria-label="Volver"><Atras className="w-6 h-6" /></button>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Mi club</p>
            <button onClick={cambiar} className="text-xs font-bold text-celeste px-2 py-2">Cambiar</button>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <Escudo club={club} size="w-20 h-20" color={color} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl leading-none tracking-wide">{club.nombre} <span className="text-amber-300 text-2xl">★</span></h1>
              <p className="text-sm mt-1" style={{ color }}>{zona?.grupo.nombre} · {zona?.nombre}</p>
              <p className="text-[11px] uppercase tracking-widest font-bold text-amber-300 mt-0.5">{nombreActual}</p>
            </div>
          </div>
          {porZona.length > 1 && (
            <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
              {porZona.map((x, i) => (
                <button key={x.club.zonaId} onClick={() => setZi(i)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold border ${i === zi ? 'bg-white text-noche border-white' : 'border-white/20 text-white/60'}`}>{x.zona?.nombre}</button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-3 divide-x divide-white/10 bg-black/20 rounded-2xl mt-4">
            {[[d.pos ? `${d.pos}°` : '—', `Posición de ${d.total}`], [fila.pts, 'Puntos'], [fila.pj, 'Partidos (cat.)']].map(([v, l]) => (
              <div key={l} className="flex flex-col items-center py-3">
                <span className="font-black text-2xl">{v}</span>
                <span className="text-white/45 text-[11px]">{l}</span>
              </div>
            ))}
          </div>
          {forma.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-white/40 text-xs">Últimas fechas</span>
              {forma.map(p => (
                <span key={p.id} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold">+{p.pts}</span>
              ))}
            </div>
          )}
        </div>
        <div className="max-w-md mx-auto flex">
          {[['resumen', 'Resumen'], ['tabla', 'Tabla'], ['partidos', 'Partidos'], ['ubicacion', 'Ubicación']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${tab === k ? 'text-white' : 'text-white/40 border-transparent'}`}
              style={tab === k ? { borderColor: color } : undefined}>{l}</button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 max-w-md mx-auto w-full flex flex-col gap-4 float-in" key={tab + zi}>
        {tab === 'resumen' && (
          <>
            {proximo && <TarjetaPartido titulo="Próximo partido" p={proximo} club={club} />}
            {ultimo && <TarjetaPartido titulo="Último partido" p={ultimo} club={club} resultados />}
            <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Estadísticas · todas las categorías</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['Ganados', fila.pg, 'text-green-400'], ['Empatados', fila.pe, 'text-amber-300'], ['Perdidos', fila.pp, 'text-red-400'], ['Efectividad', efectividad == null ? '—' : efectividad + '%', 'text-celeste']].map(([l, v, c]) => (
                  <div key={l}><p className={`font-black text-2xl ${c}`}>{v}</p><p className="text-[10px] text-white/45">{l}</p></div>
                ))}
              </div>
            </div>
            {d.porCategoria.length > 0 && (
              <div className="rounded-2xl bg-white/[0.05] border border-white/10 overflow-hidden">
                <p className="text-xs font-black uppercase tracking-widest text-white/50 px-4 pt-3 pb-2">Por categoría</p>
                <div className="grid grid-cols-[1fr_28px_28px_28px_28px_36px] text-[10px] font-bold text-white/40 px-4 pb-1">
                  <span>Categoría</span><span className="text-center">PJ</span><span className="text-center">PG</span><span className="text-center">PE</span><span className="text-center">PP</span><span className="text-center">PTS</span>
                </div>
                {d.porCategoria.map(x => (
                  <div key={x.cat} className="grid grid-cols-[1fr_28px_28px_28px_28px_36px] items-center text-xs px-4 py-2 border-t border-white/5">
                    <span className="font-semibold truncate">{x.cat}</span>
                    <span className="text-center text-white/50">{x.pj}</span><span className="text-center">{x.pg}</span><span className="text-center">{x.pe}</span><span className="text-center">{x.pp}</span>
                    <span className="text-center font-black">{x.pts}</span>
                  </div>
                ))}
              </div>
            )}
            {!d.jugados.length && <p className="text-center text-white/40 text-sm">Todavía no hay partidos cargados de {club.nombre}.</p>}
          </>
        )}

        {tab === 'tabla' && (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {['general', ...d.tabla.categorias].map(c => (
                <button key={c} onClick={e => { setCatSel(c); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }) }}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border ${catSel === c ? 'text-noche border-transparent' : 'border-white/15 text-white/70 bg-white/5'}`}
                  style={catSel === c ? { background: color } : undefined}>{c === 'general' ? 'General' : c}</button>
              ))}
            </div>
            <p className="font-display text-xl tracking-wider text-center" style={{ color }}>
              {zona?.nombre} · {catSel === 'general' ? 'General (todas las categorías)' : catSel}
            </p>
            <TablaPosiciones filas={catSel === 'general' ? d.tabla.general : d.tabla.porCategoria[catSel] || d.tabla.general} destacado={club.nombre} />
            {!d.tabla.hayDatos && <p className="text-white/40 text-[11px] text-center">Todavía no hay resultados cargados: todos en 0.</p>}
          </>
        )}

        {tab === 'partidos' && (
          d.jugados.length ? d.jugados.map(p => <TarjetaPartido key={p.id} p={p} club={club} resultados compacta />)
            : <p className="text-center text-white/40 text-sm py-8">Todavía no hay partidos cargados.</p>
        )}

        {tab === 'ubicacion' && <Ubicacion club={club} />}
      </div>
    </div>
  )
}

function TarjetaPartido({ titulo, p, club, resultados, compacta }) {
  const clubes = useClubes()
  const escudoDe = (n, z) => clubes.find(c => c.nombre === n && c.zonaId === z) || { nombre: n }
  const loc = p.esLocal ? club : escudoDe(p.rival, p.rivalZona)
  const vis = p.esLocal ? escudoDe(p.rival, p.rivalZona) : club
  return (
    <div className="rounded-2xl bg-white/[0.05] border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs">
        <span className="font-black uppercase tracking-widest text-white/60">{titulo || fechaCorta(p.fecha)}</span>
        <span className="text-white/40">{titulo ? fechaCorta(p.fecha) + ' · ' : ''}{p.esLocal ? 'Local' : 'Visitante'}{resultados && p.conResultados ? ` · +${p.pts} pts` : ''}</span>
      </div>
      <div className={`flex items-center px-4 ${compacta ? 'py-3' : 'py-4'}`}>
        {[loc, null, vis].map((c, i) => c === null ? <span key={i} className="px-3 font-display text-2xl text-white/30">VS</span> : (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0">
            <Escudo club={c} size={compacta ? 'w-10 h-10' : 'w-14 h-14'} />
            <span className={`text-xs font-bold leading-tight ${c.nombre === club.nombre ? 'text-amber-300' : ''}`}>{c.nombre}</span>
          </div>
        ))}
      </div>
      {resultados && p.conResultados && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-4 pb-3">
          {p.cats.map(x => (
            <span key={x.cat} className="flex items-center gap-1 text-[11px] text-white/60" title={x.r === 'C' ? (p.cancelaciones?.[x.i]?.motivo || 'Cancelada') : undefined}><Bolita r={x.r} chica />{x.cat}{x.r === 'C' ? ' (cancelada)' : ''}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function Ubicacion({ club }) {
  const u = (club.ubicacion || '').trim()
  const esLink = /^https?:/i.test(u)
  const embed = u && !esLink ? `https://maps.google.com/maps?q=${encodeURIComponent(u + ', Buenos Aires, Argentina')}&z=15&output=embed` : ''
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Sede</p>
        <p className="text-sm">{u && !esLink ? u : u ? 'Ubicación cargada en Google Maps' : 'Todavía no está cargada la dirección del club.'}</p>
      </div>
      {embed && <iframe title="Mapa" src={embed} className="w-full h-64 rounded-2xl border border-white/10" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
      <a href={mapsUrl(club)} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 bg-celeste text-noche font-bold"><Pin className="w-5 h-5" /> Cómo llegar</a>
    </div>
  )
}
