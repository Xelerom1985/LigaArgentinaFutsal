import { useMemo, useState } from 'react'
import { db, ref, push, set, ACT } from '../firebase'
import { grupos, norm } from '../data/zonas'
import { useClubes, zonaPorId } from '../data/clubes'
import { CATEGORIAS, finDeSemana, fechaCorta, hoyISO } from '../data/categorias'
import Escudo from '../components/Escudo'
import { Atras, Lupa, Check } from '../components/Iconos'
import { mensajeError } from '../firebase'
import { useTorneos } from '../data/torneo'

// Asignar partido en pocos toques: fecha → zona → local → visitante → (árbitro, opcional) → Guardar
export default function NuevoPartido({ arbitros, volver }) {
  const clubes = useClubes()
  const torneos = useTorneos()
  const [sab, dom] = finDeSemana()
  const [fecha, setFecha] = useState(sab)
  const [zonaId, setZonaId] = useState('')
  const [local, setLocal] = useState('')
  const [visitante, setVisitante] = useState('')
  const [zonaVis, setZonaVis] = useState('') // zona del visitante ('' = la misma del local)
  const [eligiendoZonaVis, setEligiendoZonaVis] = useState(false)
  const [arbitro, setArbitro] = useState('')
  const [buscar, setBuscar] = useState('')
  const [cats, setCats] = useState(CATEGORIAS.map(() => true))
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')

  const paso = !zonaId ? 'zona' : !local ? 'local' : !visitante ? (eligiendoZonaVis ? 'zonaVis' : 'visitante') : 'final'
  const zona = zonaPorId[zonaId]
  const zVis = zonaVis || zonaId
  const deZona = z => clubes.filter(c => c.zonaId === z).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const clubesZona = useMemo(() => deZona(paso === 'visitante' ? zVis : zonaId), [clubes, zonaId, zVis, paso]) // eslint-disable-line
  const escudoDe = (n, z) => clubes.find(c => c.nombre === n && c.zonaId === z)?.escudo

  // Flecha de atrás: deshace el último paso (en el primero, sale)
  const atras = () => {
    if (paso === 'final') setVisitante('')
    else if (paso === 'zonaVis') setEligiendoZonaVis(false)
    else if (paso === 'visitante') { setLocal(''); setZonaVis('') }
    else if (paso === 'local') setZonaId('')
    else volver()
  }
  const activos = arbitros.filter(a => a.activo !== false)
  const filtrados = useMemo(() => {
    const q = norm(buscar.trim())
    return activos.filter(a => !q || norm(`${a.nombre} ${a.apellido}`).includes(q) || norm(`${a.apellido} ${a.nombre}`).includes(q))
      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))
  }, [activos, buscar])
  const arb = arbitros.find(a => a.id === arbitro)

  const guardar = async () => {
    const categorias = CATEGORIAS.filter((_, i) => cats[i])
    if (!categorias.length) return setAviso('Elegí al menos una categoría')
    setGuardando(true)
    try {
      await set(push(ref(db, 'partidos')), {
        fecha, zonaId, local, visitante, visitanteZonaId: zVis, categorias, torneo: torneos.actual,
        ...(arb ? { arbitroUid: arb.id, arbitroNombre: `${arb.nombre} ${arb.apellido}`.trim() } : {}),
        estado: 'pendiente', creado: Date.now(), act: ACT(),
      })
      setAviso(`Asignado: ${local} vs ${visitante}`)
      setLocal(''); setVisitante(''); setZonaVis('')
    } catch (e) { setAviso(mensajeError(e)) } finally { setGuardando(false); setTimeout(() => setAviso(''), 2500) }
  }

  const BotonClub = ({ c, onClick, deshabilitado }) => (
    <button onClick={onClick} disabled={deshabilitado}
      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 border border-white/10 bg-white/[0.06] active:scale-[0.97] transition disabled:opacity-25 text-left">
      <Escudo src={c.escudo} nombre={c.nombre} className="w-9 h-9" />
      <span className="text-[13px] font-bold leading-tight">{c.nombre}</span>
    </button>
  )

  return (
    <div className="px-4 safe-top pb-32 max-w-md mx-auto">
      <div className="flex items-center gap-2 pt-3 pb-1">
        <button onClick={atras} className="w-10 h-10 -ml-2 flex items-center justify-center text-white/70"><Atras className="w-6 h-6" /></button>
        <div>
          <h2 className="font-display text-3xl tracking-wide leading-none">Asignar partido</h2>
          <p className="text-xs text-amber-300/80">{torneos.nombreActual}</p>
        </div>
      </div>

      {/* Fecha */}
      <div className="flex gap-2 items-center flex-wrap">
        {[sab, dom].map(f => (
          <button key={f} onClick={() => setFecha(f)}
            className={`rounded-xl px-3 py-2 text-sm font-bold border ${fecha === f ? 'bg-amber-300 text-noche border-amber-300' : 'border-white/15 bg-white/5'}`}>{fechaCorta(f)}</button>
        ))}
        <input type="date" value={fecha} min={hoyISO()} onChange={e => e.target.value && setFecha(e.target.value)}
          className={`rounded-xl px-3 py-2 text-sm border bg-white/5 [color-scheme:dark] ${fecha !== sab && fecha !== dom ? 'border-amber-300 text-amber-300' : 'border-white/15 text-white/60'}`} />
      </div>

      {/* Lo elegido hasta ahora (tocar para volver a ese paso) */}
      {zonaId && (
        <div className="flex flex-wrap gap-1.5 mt-3 text-xs">
          <button onClick={() => { setZonaId(''); setLocal(''); setVisitante('') }} className="rounded-full px-3 py-1.5 bg-white/10">{zona?.nombre} ✕</button>
          {local && <button onClick={() => { setLocal(''); setVisitante(''); setZonaVis('') }} className="rounded-full px-3 py-1.5 bg-white/10">Local: {local} ✕</button>}
          {zVis !== zonaId && <button onClick={() => { setZonaVis(''); setVisitante('') }} className="rounded-full px-3 py-1.5 bg-amber-300/20 text-amber-200">Visitante de {zonaPorId[zVis]?.nombre} ✕</button>}
          {visitante && <button onClick={() => setVisitante('')} className="rounded-full px-3 py-1.5 bg-white/10">Visitante: {visitante} ✕</button>}
        </div>
      )}

      {paso === 'zonaVis' && <p className="font-display text-2xl tracking-wider mt-5 -mb-2 text-amber-300">Zona del VISITANTE</p>}
      {(paso === 'zona' || paso === 'zonaVis') && (
        <div className="flex flex-col gap-5 mt-5">
          {grupos.map(g => (
            <section key={g.id}>
              <h3 className="font-display text-xl tracking-wider mb-2 flex items-center gap-2" style={{ color: g.color }}>
                <span className="inline-block w-1.5 h-4 rounded-full" style={{ background: g.color }} />{g.nombre}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {g.zonas.map(z => (
                  <button key={z.id} onClick={() => (paso === 'zona' ? setZonaId(z.id) : (setZonaVis(z.id), setEligiendoZonaVis(false)))}
                    className="relative text-left rounded-2xl px-3.5 py-3 border border-white/10 active:scale-[0.97] transition-transform overflow-hidden font-bold text-[15px]"
                    style={{ background: 'linear-gradient(145deg, rgba(20,48,90,0.95), rgba(11,31,58,0.95))' }}>
                    <span className="absolute inset-y-0 left-0 w-1" style={{ background: g.color }} />
                    {z.nombre.replace(/^Diamante |^Femenino |^Baby /, '')}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {(paso === 'local' || paso === 'visitante') && (
        <>
          <div className="flex items-end justify-between mt-5 mb-2 gap-2">
            <p className="font-display text-2xl tracking-wider text-amber-300 leading-none">
              {paso === 'local' ? 'Elegí el LOCAL' : 'Elegí el VISITANTE'}
              <span className="block font-sans text-xs tracking-normal text-white/45 mt-1">{zonaPorId[paso === 'local' ? zonaId : zVis]?.nombre}</span>
            </p>
            {paso === 'visitante' && (
              <button onClick={() => setEligiendoZonaVis(true)} className="rounded-xl px-3 py-2 text-xs font-bold border border-amber-300/50 text-amber-200 bg-amber-300/10 shrink-0">
                Otra zona ›
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {clubesZona.map(c => (
              <BotonClub key={c.id} c={c} deshabilitado={paso === 'visitante' && c.nombre === local && zVis === zonaId}
                onClick={() => (paso === 'local' ? setLocal(c.nombre) : setVisitante(c.nombre))} />
            ))}
          </div>
        </>
      )}

      {paso === 'final' && (
        <>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/10 px-3 py-3 mt-4">
            {[[local, zonaId], null, [visitante, zVis]].map((x, i) => x === null ? <span key={i} className="font-display text-2xl text-white/40">VS</span> : (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <Escudo src={escudoDe(x[0], x[1])} nombre={x[0]} className="w-11 h-11" />
                <span className="text-xs font-bold leading-tight">{x[0]}</span>
                {zVis !== zonaId && <span className="text-[10px] text-white/45">{zonaPorId[x[1]]?.nombre}</span>}
              </div>
            ))}
          </div>

          <p className="font-display text-2xl tracking-wider mt-5 mb-2 text-amber-300">Árbitro <span className="font-sans text-xs tracking-normal text-white/40">(opcional, se puede asignar después)</span></p>
          {arb ? (
            <button onClick={() => setArbitro('')} className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-amber-300 text-noche font-bold">
              <span>{arb.apellido}, {arb.nombre}</span><span className="text-xs">Cambiar</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
              <div className="flex items-center gap-2 px-3 border-b border-white/10">
                <Lupa className="w-4 h-4 text-white/40" />
                <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar por nombre o apellido…"
                  className="flex-1 bg-transparent py-3 text-sm outline-none" />
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.06]">
                {filtrados.map(a => (
                  <button key={a.id} onClick={() => { setArbitro(a.id); setBuscar('') }} className="w-full text-left px-4 py-2.5 text-sm active:bg-white/10">
                    <b>{a.apellido}</b>, {a.nombre}
                  </button>
                ))}
                {!filtrados.length && <p className="px-4 py-3 text-sm text-white/40">{activos.length ? 'Sin coincidencias' : 'Primero cargá árbitros en la pestaña Árbitros'}</p>}
              </div>
            </div>
          )}

          <p className="font-display text-2xl tracking-wider mt-5 mb-2 text-amber-300">Categorías</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((c, i) => (
              <button key={c} onClick={() => setCats(v => v.map((x, j) => (j === i ? !x : x)))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border flex items-center gap-1 ${cats[i] ? 'bg-white/15 border-white/30' : 'border-white/10 text-white/35 line-through'}`}>
                {cats[i] && <Check className="w-3 h-3" />}{c}
              </button>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 px-4 safe-bottom pt-3 bg-gradient-to-t from-[#06142a] via-[#06142a]/95 to-transparent">
            <button onClick={guardar} disabled={guardando}
              className="w-full max-w-md mx-auto block rounded-2xl py-4 font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#c90f1c,#7a0016)' }}>
              {guardando ? 'Guardando…' : `Asignar partido · ${fechaCorta(fecha)}`}
            </button>
          </div>
        </>
      )}

      {aviso && <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto bg-white text-noche text-sm font-bold rounded-xl px-4 py-2 shadow-xl text-center">{aviso}</div>}
    </div>
  )
}
