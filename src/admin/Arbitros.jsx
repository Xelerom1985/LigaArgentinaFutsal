import { useState } from 'react'
import { db, ref, set, update, remove, crearCuentaArbitro, mensajeError, PIN_ADMIN_RESERVADO } from '../firebase'
import { Mas, Usuario, Ojo } from '../components/Iconos'

const pinAlAzar = usados => {
  for (let k = 0; k < 200; k++) {
    const p = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    if (p !== PIN_ADMIN_RESERVADO && !usados.has(p)) return p
  }
  return ''
}

export default function Arbitros({ arbitros, partidos, superAdmin }) {
  const [alta, setAlta] = useState(null) // { nombre, apellido, telefono, pin }
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [verPin, setVerPin] = useState({})
  const usados = new Set(arbitros.map(a => a.pin))

  const nuevo = () => { setError(''); setAlta({ nombre: '', apellido: '', telefono: '', pin: pinAlAzar(usados) }) }
  const guardar = async () => {
    const { nombre, apellido, telefono, pin } = alta
    if (!nombre.trim() || !apellido.trim()) return setError('Completá nombre y apellido')
    if (!/^\d{4}$/.test(pin)) return setError('El PIN tiene que tener 4 números')
    if (pin === PIN_ADMIN_RESERVADO || usados.has(pin)) return setError('Ese PIN ya está usado')
    setGuardando(true); setError('')
    try {
      const uid = await crearCuentaArbitro(pin)
      await set(ref(db, 'arbitros/' + uid), { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim(), pin, activo: true, creado: Date.now() })
      setAlta(null)
    } catch (e) { setError(mensajeError(e)) } finally { setGuardando(false) }
  }
  const activar = (a, v) => update(ref(db, 'arbitros/' + a.id), { activo: v }).catch(e => alert(mensajeError(e)))
  const borrar = a => {
    const n = partidos.filter(p => p.arbitroUid === a.id).length
    if (!window.confirm(`¿Eliminar a ${a.nombre} ${a.apellido}?${n ? ` Tiene ${n} partido(s) asignado(s), que quedan sin árbitro.` : ''} Su PIN no se podrá volver a usar.`)) return
    remove(ref(db, 'arbitros/' + a.id)).catch(e => alert(mensajeError(e)))
  }
  const lista = [...arbitros].sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))

  return (
    <div className="flex flex-col gap-3">
      <button onClick={nuevo} className="flex items-center justify-center gap-2 rounded-2xl py-3 bg-amber-300 text-noche font-bold"><Mas className="w-5 h-5" /> Nuevo árbitro</button>

      {alta && (
        <div className="rounded-2xl border border-amber-300/40 bg-white/[0.06] p-4 flex flex-col gap-2.5">
          {[['nombre', 'Nombre'], ['apellido', 'Apellido'], ['telefono', 'Teléfono (opcional)']].map(([k, l]) => (
            <input key={k} value={alta[k]} placeholder={l} onChange={e => setAlta({ ...alta, [k]: e.target.value })}
              inputMode={k === 'telefono' ? 'tel' : 'text'} className="rounded-xl px-3 py-2.5 bg-noche-dark border border-white/15 outline-none focus:border-amber-300 text-sm" />
          ))}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">PIN</span>
            <input value={alta.pin} maxLength={4} inputMode="numeric" onChange={e => setAlta({ ...alta, pin: e.target.value.replace(/\D/g, '') })}
              className="w-24 rounded-xl px-3 py-2 bg-noche-dark border border-white/15 outline-none focus:border-amber-300 text-xl tracking-[0.3em] text-center font-bold" />
            <button onClick={() => setAlta({ ...alta, pin: pinAlAzar(usados) })} className="text-xs text-amber-300 underline">Otro al azar</button>
          </div>
          <p className="text-[11px] text-white/40">El PIN es único y no se puede cambiar después. Pasáselo al árbitro en persona.</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setAlta(null)} className="flex-1 rounded-xl py-2.5 bg-white/5 text-white/60 text-sm">Cancelar</button>
            <button onClick={guardar} disabled={guardando} className="flex-1 rounded-xl py-2.5 bg-amber-300 text-noche text-sm font-bold disabled:opacity-50">{guardando ? 'Creando…' : 'Crear árbitro'}</button>
          </div>
        </div>
      )}

      {!lista.length && !alta && <p className="text-white/45 text-sm text-center py-8">Todavía no hay árbitros cargados.</p>}
      {lista.map(a => {
        const n = partidos.filter(p => p.arbitroUid === a.id).length
        return (
          <div key={a.id} className={`rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 flex items-center gap-3 ${a.activo === false ? 'opacity-50' : ''}`}>
            <span className="w-10 h-10 rounded-full bg-amber-300/15 text-amber-300 flex items-center justify-center shrink-0"><Usuario className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{a.apellido}, {a.nombre}</p>
              <p className="text-xs text-white/45">
                PIN <button onClick={() => setVerPin(v => ({ ...v, [a.id]: !v[a.id] }))} className="font-mono text-white/80 inline-flex items-center gap-1">
                  {verPin[a.id] ? a.pin : '••••'} <Ojo className="w-3.5 h-3.5" /></button>
                {' · '}{n} partido{n === 1 ? '' : 's'}{a.telefono ? ` · ${a.telefono}` : ''}
              </p>
            </div>
            <button onClick={() => activar(a, a.activo === false)} className="text-xs rounded-lg px-2.5 py-1.5 bg-white/10">{a.activo === false ? 'Dar de alta' : 'Dar de baja'}</button>
            {<button onClick={() => borrar(a)} className="text-xs rounded-lg px-2 py-1.5 text-red-300" aria-label="Eliminar árbitro">✕</button>}
          </div>
        )
      })}
    </div>
  )
}
