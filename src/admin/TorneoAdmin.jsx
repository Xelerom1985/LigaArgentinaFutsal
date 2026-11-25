import { useState } from 'react'
import { useTorneos, empezarTorneo, elegirTorneoActual } from '../data/torneo'
import { mensajeError } from '../firebase'
import { torneoDe } from '../data/torneo'

// Torneo en curso (Apertura / Clausura): los partidos nuevos se cargan en ese torneo
export default function TorneoAdmin({ partidos, superAdmin }) {
  const t = useTorneos()
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [msg, setMsg] = useState('')
  const cuenta = id => partidos.filter(p => torneoDe(p) === id).length

  const nuevo = async () => {
    if (!nombre.trim()) return setMsg('Poné el nombre, por ejemplo: Torneo Clausura 2027')
    if (!window.confirm(`¿Empezar "${nombre.trim()}"? Los partidos nuevos van a contar para este torneo y sus tablas arrancan de cero. El torneo anterior queda guardado.`)) return
    try { await empezarTorneo(nombre); setNombre(''); setAbierto(false); setMsg('') } catch (e) { setMsg(mensajeError(e)) }
  }

  return (
    <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Torneo en curso</p>
          <p className="font-display text-2xl leading-none tracking-wide text-amber-300 truncate">{t.nombreActual}</p>
        </div>
        {superAdmin && <button onClick={() => setAbierto(a => !a)} className="text-xs font-bold rounded-lg px-3 py-2 bg-white/10">{abierto ? 'Cerrar' : 'Cambiar'}</button>}
      </div>
      {abierto && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-white/55">Empezar un torneo nuevo (por ejemplo cuando arranca el Clausura). Las tablas del anterior quedan guardadas y se pueden ver eligiéndolo en la tabla.</p>
          <div className="flex gap-2">
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Torneo Clausura 2027"
              className="flex-1 min-w-0 rounded-xl px-3 py-2.5 bg-noche-dark border border-white/15 outline-none focus:border-amber-300 text-[16px]" />
            <button onClick={nuevo} className="rounded-xl px-3 py-2.5 bg-amber-300 text-noche text-sm font-bold shrink-0">Empezar</button>
          </div>
          {t.lista.length > 1 && (
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Torneos</p>
              {t.lista.map(x => (
                <div key={x.id} className="flex items-center justify-between text-sm py-1">
                  <span>{x.nombre} <span className="text-white/40 text-xs">· {cuenta(x.id)} partidos</span></span>
                  {x.id === t.actual ? <span className="text-xs text-amber-300 font-bold">En curso</span>
                    : <button onClick={() => window.confirm(`¿Volver a poner "${x.nombre}" como torneo en curso?`) && elegirTorneoActual(x.id).catch(e => setMsg(mensajeError(e)))} className="text-xs underline text-white/50">Poner en curso</button>}
                </div>
              ))}
            </div>
          )}
          {msg && <p className="text-sm text-red-400">{msg}</p>}
        </div>
      )}
    </div>
  )
}
