import { useEffect, useState } from 'react'
import { db, ref, onValue, set, update, remove, crearCuentaAdmin, cambiarPinSuper, mensajeError, PIN_ADMIN_RESERVADO } from '../firebase'
import { Mas, Ojo, CandadoAbierto } from '../components/Iconos'

const azar = n => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
const campo = 'rounded-xl px-3 py-2.5 bg-noche-dark border border-white/15 outline-none focus:border-celeste text-[16px]'

// Solo SuperAdmin: su propio PIN y los PIN de Admin de la Liga
export default function Accesos() {
  const [admins, setAdmins] = useState([])
  const [alta, setAlta] = useState(null)
  const [ver, setVer] = useState({})
  const [msg, setMsg] = useState('')
  const [nuevoPin, setNuevoPin] = useState({ a: '', b: '' })
  const [cambiando, setCambiando] = useState(false)
  const [cambioAdmin, setCambioAdmin] = useState(null) // { id, pin }

  useEffect(() => onValue(ref(db, 'admins'), s => setAdmins(Object.entries(s.val() || {}).map(([id, x]) => ({ id, ...x }))), () => {}), [])

  const crear = async () => {
    const nombre = alta.nombre.trim(), pin = alta.pin
    if (!nombre) return setMsg('Poné un nombre (por ejemplo: Liga, o el nombre de quien lo va a usar)')
    if (!/^\d{4}$/.test(pin)) return setMsg('El PIN de Admin tiene que tener 4 números')
    if (pin === PIN_ADMIN_RESERVADO || admins.some(a => a.pin === pin)) return setMsg('Ese PIN ya está usado')
    setMsg('Creando…')
    try {
      const uid = await crearCuentaAdmin(pin)
      await set(ref(db, 'admins/' + uid), { nombre, pin, activo: true, creado: Date.now() })
      setAlta(null); setMsg('Listo: ya pueden entrar con ese PIN por el botón Admin')
    } catch (e) { setMsg(mensajeError(e)) }
  }
  // Cambiar el PIN de un Admin: nueva cuenta con el PIN nuevo y se borra el registro viejo
  // (la cuenta vieja queda sin permisos: sin registro en /admins no puede hacer nada)
  const cambiarPinAdmin = async a => {
    const pin = cambioAdmin.pin
    if (!/^\d{4}$/.test(pin)) return setMsg('El PIN de Admin tiene que tener 4 números')
    if (pin === PIN_ADMIN_RESERVADO || admins.some(x => x.pin === pin)) return setMsg('Ese PIN ya está usado')
    setMsg('Cambiando…')
    try {
      const uid = await crearCuentaAdmin(pin)
      await set(ref(db, 'admins/' + uid), { nombre: a.nombre, pin, activo: true, creado: Date.now() })
      if (uid !== a.id) await remove(ref(db, 'admins/' + a.id))
      setCambioAdmin(null); setMsg(`Listo: ${a.nombre} ahora entra con el PIN nuevo. El anterior ya no funciona.`)
    } catch (e) { setMsg(mensajeError(e)) }
  }
  const activar = (a, v) => update(ref(db, 'admins/' + a.id), { activo: v }).catch(e => setMsg(mensajeError(e)))

  const cambiarMiPin = async () => {
    const { a, b } = nuevoPin
    if (!/^\d{9}$/.test(a)) return setMsg('Tu PIN de SuperAdmin tiene que tener 9 números')
    if (a !== b) return setMsg('Los dos PIN no coinciden')
    if (admins.some(x => x.pin === a)) return setMsg('Ese PIN lo usa un Admin de la Liga')
    try { await cambiarPinSuper(a); setNuevoPin({ a: '', b: '' }); setCambiando(false); setMsg('Tu PIN de SuperAdmin se cambió. El anterior ya no sirve.') }
    catch (e) { setMsg(mensajeError(e)) }
  }

  return (
    <div className="flex flex-col gap-4">
      {msg && <p className="text-sm text-amber-300">{msg}</p>}

      <section className="rounded-2xl border border-celeste/30 bg-celeste/[0.06] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CandadoAbierto className="w-5 h-5 text-celeste" />
          <p className="font-bold flex-1">Tu PIN de SuperAdmin</p>
          {!cambiando && <button onClick={() => { setCambiando(true); setMsg('') }} className="text-xs font-bold rounded-lg px-3 py-2 bg-white/10">Cambiar mi PIN</button>}
        </div>
        <p className="text-xs text-white/50">No se muestra en ningún lado y no se puede recuperar: anotalo en un lugar seguro.</p>
        {cambiando && (
          <>
            <input type="password" inputMode="numeric" placeholder="PIN nuevo (9 números)" maxLength={9} value={nuevoPin.a}
              onChange={e => setNuevoPin({ ...nuevoPin, a: e.target.value.replace(/\D/g, '') })} className={campo} />
            <input type="password" inputMode="numeric" placeholder="Repetí el PIN nuevo" maxLength={9} value={nuevoPin.b}
              onChange={e => setNuevoPin({ ...nuevoPin, b: e.target.value.replace(/\D/g, '') })} className={campo} />
            <div className="flex gap-2">
              <button onClick={() => { setCambiando(false); setNuevoPin({ a: '', b: '' }) }} className="flex-1 rounded-xl py-2.5 bg-white/5 text-white/60 text-sm">Cancelar</button>
              <button onClick={cambiarMiPin} className="flex-1 rounded-xl py-2.5 bg-celeste text-noche text-sm font-bold">Guardar PIN</button>
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl tracking-wider text-amber-300">PIN de Admin de la Liga</p>
          {!alta && <button onClick={() => { setMsg(''); setAlta({ nombre: '', pin: azar(4) }) }} className="flex items-center gap-1 text-xs font-bold rounded-lg px-3 py-2 bg-amber-300 text-noche"><Mas className="w-4 h-4" /> Nuevo</button>}
        </div>
        <p className="text-xs text-white/50">Pueden hacer todo (partidos, árbitros, clubes, planillas, borrar) menos cambiar el torneo en curso y ver esta pestaña.</p>
        {alta && (
          <div className="rounded-2xl border border-amber-300/40 bg-white/[0.06] p-4 flex flex-col gap-2.5">
            <input value={alta.nombre} placeholder="Nombre (ej. Liga, Juan Gómez)" onChange={e => setAlta({ ...alta, nombre: e.target.value })} className={campo} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">PIN</span>
              <input value={alta.pin} inputMode="numeric" maxLength={4} onChange={e => setAlta({ ...alta, pin: e.target.value.replace(/\D/g, '') })}
                className={`${campo} w-36 text-center tracking-[0.2em] font-bold`} />
              <button onClick={() => setAlta({ ...alta, pin: azar(4) })} className="text-xs text-amber-300 underline">Otro al azar</button>
            </div>
            <p className="text-[11px] text-white/40">Después lo podés cambiar con "Cambiar PIN".</p>
            <div className="flex gap-2">
              <button onClick={() => setAlta(null)} className="flex-1 rounded-xl py-2.5 bg-white/5 text-white/60 text-sm">Cancelar</button>
              <button onClick={crear} className="flex-1 rounded-xl py-2.5 bg-amber-300 text-noche text-sm font-bold">Crear acceso</button>
            </div>
          </div>
        )}
        {!admins.length && !alta && <p className="text-white/40 text-sm text-center py-4">Todavía no hay PIN de Admin para la Liga.</p>}
        {admins.map(a => (
          <div key={a.id} className={`rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 flex flex-wrap items-center gap-3 ${a.activo === false ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{a.nombre}</p>
              <button onClick={() => setVer(v => ({ ...v, [a.id]: !v[a.id] }))} className="text-xs text-white/50 font-mono inline-flex items-center gap-1">
                PIN {ver[a.id] ? a.pin : '••••'} <Ojo className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <button onClick={() => { setMsg(''); setCambioAdmin({ id: a.id, pin: azar(4) }) }} className="text-xs rounded-lg px-2.5 py-1.5 bg-amber-300/20 text-amber-200">Cambiar PIN</button>
              <button onClick={() => activar(a, a.activo === false)} className="text-xs rounded-lg px-2.5 py-1.5 bg-white/10">{a.activo === false ? 'Habilitar' : 'Dar de baja'}</button>
            </div>
            {cambioAdmin?.id === a.id && (
              <div className="basis-full flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
                <span className="text-xs text-white/60">PIN nuevo</span>
                <input value={cambioAdmin.pin} inputMode="numeric" maxLength={4} onChange={e => setCambioAdmin({ ...cambioAdmin, pin: e.target.value.replace(/\D/g, '') })}
                  className={`${campo} w-24 text-center tracking-[0.2em] font-bold py-1.5`} />
                <button onClick={() => setCambioAdmin(null)} className="text-xs text-white/50">Cancelar</button>
                <button onClick={() => cambiarPinAdmin(a)} className="ml-auto rounded-lg px-3 py-1.5 bg-amber-300 text-noche text-xs font-bold">Guardar</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
