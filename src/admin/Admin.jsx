import { useEffect, useMemo, useRef, useState } from 'react'
import { db, ref, get, set, update, push, remove, adminSignOut } from '../firebase'
import { grupos, norm } from '../data/zonas'
import { useClubes, semilla, zonaPorId } from '../data/clubes'
import { Escudo } from '../components/ClubRow'
import { Atras, Mas, Lapiz, Lupa, CandadoAbierto, Flecha } from '../components/Iconos'
import { prepararEscudo } from './imagen'

const grupoDeZona = zonaId => grupos.find(g => g.zonas.some(z => z.id === zonaId))

// La primera vez sube a Firebase los clubes que venían en el código
async function asegurarBase() {
  const s = await get(ref(db, 'clubes'))
  if (!s.exists()) await set(ref(db, 'clubes'), semilla())
}

function Cabecera({ titulo, volver }) {
  return (
    <header className="sticky top-0 z-20 safe-top" style={{ background: 'rgba(6,20,42,0.92)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center gap-2 px-2 py-3 max-w-md mx-auto">
        <button onClick={volver} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" aria-label="Volver">
          <Atras className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest font-bold text-celeste">Administrador</p>
          <h2 className="font-display text-2xl leading-none tracking-wide truncate">{titulo}</h2>
        </div>
      </div>
      <div className="h-0.5 bg-celeste" />
    </header>
  )
}

const campo = 'w-full rounded-xl px-3.5 py-3 bg-white/[0.07] border border-white/10 text-[16px] outline-none focus:border-celeste placeholder:text-white/30'
const etiqueta = 'block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5'

function Formulario({ club, listo, cancelar }) {
  const nuevo = !club
  const [nombre, setNombre] = useState(club?.nombre || '')
  const [escudo, setEscudo] = useState(club?.escudo || '')
  const [ubicacion, setUbicacion] = useState(club?.ubicacion || '')
  const [grupoId, setGrupoId] = useState(club ? grupoDeZona(club.zonaId)?.id || '' : '')
  const [zonaId, setZonaId] = useState(club?.zonaId || '')
  const [msg, setMsg] = useState('')
  const [guardando, setGuardando] = useState(false)
  const archivo = useRef()
  const grupo = grupos.find(g => g.id === grupoId)

  const elegirEscudo = async e => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { setEscudo(await prepararEscudo(f)) } catch { setMsg('No se pudo leer esa imagen') }
  }

  const guardar = async () => {
    const n = nombre.trim().toUpperCase()
    if (!n) return setMsg('Poné el nombre del club')
    if (!zonaId) return setMsg('Elegí la categoría y la zona')
    setGuardando(true); setMsg('')
    try {
      await asegurarBase()
      const datos = { nombre: n, zonaId, escudo, ubicacion: ubicacion.trim() }
      if (nuevo) await push(ref(db, 'clubes'), datos)
      else await update(ref(db, 'clubes/' + club.id), datos)
      listo(nuevo ? `${n} agregado a ${zonaPorId[zonaId].nombre}` : `${n} guardado`)
    } catch (e) {
      setMsg('No se pudo guardar: ' + (e?.code || e?.message || 'error'))
    } finally { setGuardando(false) }
  }

  const borrar = async () => {
    if (!confirm(`¿Borrar ${club.nombre} de ${zonaPorId[club.zonaId]?.nombre || 'la zona'}?`)) return
    setGuardando(true)
    try {
      await asegurarBase()
      await remove(ref(db, 'clubes/' + club.id))
      listo(`${club.nombre} borrado`)
    } catch (e) { setMsg('No se pudo borrar: ' + (e?.code || 'error')); setGuardando(false) }
  }

  return (
    <div className="px-4 mt-4 w-full max-w-md mx-auto flex flex-col gap-4 pb-10 float-in">
      <div>
        <label className={etiqueta}>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: VILLA URQUIZÚ" className={campo + ' uppercase'} />
      </div>

      <div>
        <label className={etiqueta}>Escudo</label>
        <div className="flex items-center gap-3 rounded-xl p-3 bg-white/[0.07] border border-white/10">
          <div className="w-16 h-16 flex items-center justify-center">
            {escudo ? <img src={escudo} alt="" className="max-w-16 max-h-16 object-contain" /> : <Escudo club={{ nombre: nombre || '?' }} size="w-14 h-14" />}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <button onClick={() => archivo.current.click()} className="rounded-lg py-2 bg-celeste/20 text-celeste text-sm font-bold">{escudo ? 'Cambiar imagen' : 'Elegir imagen'}</button>
            {escudo && <button onClick={() => setEscudo('')} className="rounded-lg py-1.5 text-white/50 text-xs">Quitar escudo</button>}
          </div>
          <input ref={archivo} type="file" accept="image/*" className="hidden" onChange={elegirEscudo} />
        </div>
      </div>

      <div>
        <label className={etiqueta}>Ubicación</label>
        <input value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Dirección o link de Google Maps" className={campo} />
        <p className="text-white/35 text-xs mt-1">Podés pegar el link de "Compartir" de Google Maps.</p>
      </div>

      <div>
        <label className={etiqueta}>Categoría</label>
        <div className="grid grid-cols-3 gap-2">
          {grupos.map(g => (
            <button key={g.id} onClick={() => { setGrupoId(g.id); if (!g.zonas.some(z => z.id === zonaId)) setZonaId(g.zonas.length === 1 ? g.zonas[0].id : '') }}
              className="rounded-xl py-2.5 px-1 text-[13px] font-bold border transition-colors"
              style={grupoId === g.id ? { background: g.color, color: '#0b1f3a', borderColor: g.color } : { borderColor: 'rgba(255,255,255,0.1)', color: g.color }}>
              {g.nombre.replace(' · ', ' ')}
            </button>
          ))}
        </div>
      </div>

      {grupo && (
        <div>
          <label className={etiqueta}>Zona</label>
          <div className="grid grid-cols-2 gap-2">
            {grupo.zonas.map(z => (
              <button key={z.id} onClick={() => setZonaId(z.id)}
                className="rounded-xl py-2.5 px-2 text-sm font-semibold border transition-colors"
                style={zonaId === z.id ? { background: grupo.color, color: '#0b1f3a', borderColor: grupo.color } : { borderColor: 'rgba(255,255,255,0.1)' }}>
                {z.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}

      <div className="flex gap-2 mt-1">
        <button onClick={cancelar} className="flex-1 rounded-xl py-3.5 bg-white/5 text-white/60 font-semibold">Cancelar</button>
        <button onClick={guardar} disabled={guardando} className="flex-[2] rounded-xl py-3.5 bg-celeste text-noche font-bold disabled:opacity-60">
          {guardando ? 'Guardando…' : nuevo ? 'Agregar club' : 'Guardar cambios'}
        </button>
      </div>
      {!nuevo && (
        <button onClick={borrar} disabled={guardando} className="rounded-xl py-3 text-red-400 text-sm font-semibold border border-red-400/30">Borrar este club</button>
      )}
    </div>
  )
}

function Lista({ elegir }) {
  const clubes = useClubes()
  const [q, setQ] = useState('')
  const res = useMemo(() => {
    const n = norm(q.trim())
    return clubes
      .filter(c => !n || norm(c.nombre).includes(n) || norm(zonaPorId[c.zonaId]?.nombre || '').includes(n))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || (zonaPorId[a.zonaId]?.nombre || '').localeCompare(zonaPorId[b.zonaId]?.nombre || ''))
  }, [clubes, q])

  return (
    <div className="px-3 mt-3 w-full max-w-md mx-auto pb-10">
      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 mb-3">
        <Lupa className="w-5 h-5 text-white/40" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar club o zona"
          className="flex-1 bg-transparent py-2.5 text-[16px] outline-none placeholder:text-white/35" />
      </div>
      <p className="text-white/35 text-xs mb-2 px-1">{res.length} clubes</p>
      <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5" style={{ background: 'rgba(11,31,58,0.92)' }}>
        {res.map(c => {
          const g = grupoDeZona(c.zonaId)
          return (
            <button key={c.id} onClick={() => elegir(c)} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/5">
              <Escudo club={c} color={g?.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{c.nombre}</p>
                <p className="text-xs truncate" style={{ color: g?.color }}>{zonaPorId[c.zonaId]?.nombre || 'Sin zona'}{c.ubicacion ? '' : ' · sin ubicación'}</p>
              </div>
              <Lapiz className="w-5 h-5 text-white/40" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Admin({ salir }) {
  const [vista, setVista] = useState('menu') // menu | agregar | lista | editar
  const [club, setClub] = useState(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => { asegurarBase().catch(() => {}) }, [])
  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(''), 2500); return () => clearTimeout(t) }, [aviso])

  const listo = m => { setAviso(m); setVista(club ? 'lista' : 'menu'); setClub(null) }
  const cerrarSesion = async () => { await adminSignOut().catch(() => {}); salir() }

  return (
    <div className="flex flex-col">
      {vista === 'menu' && (
        <>
          <Cabecera titulo="Panel" volver={salir} />
          <div className="px-4 mt-6 w-full max-w-md mx-auto flex flex-col gap-3 float-in">
            <button onClick={() => { setClub(null); setVista('agregar') }} className="flex items-center gap-4 rounded-2xl px-4 py-5 bg-celeste text-noche font-bold text-lg active:opacity-85">
              <Mas className="w-7 h-7" /> <span className="flex-1 text-left">Agregar club</span> <Flecha className="w-5 h-5" />
            </button>
            <button onClick={() => setVista('lista')} className="flex items-center gap-4 rounded-2xl px-4 py-5 border border-white/15 font-bold text-lg active:bg-white/5" style={{ background: 'rgba(20,48,90,0.9)' }}>
              <Lapiz className="w-7 h-7 text-celeste" /> <span className="flex-1 text-left">Editar club</span> <Flecha className="w-5 h-5" />
            </button>
            <button onClick={cerrarSesion} className="flex items-center justify-center gap-2 mt-6 rounded-xl py-3 text-white/50 text-sm border border-white/10">
              <CandadoAbierto className="w-4 h-4" /> Cerrar sesión de administrador
            </button>
          </div>
        </>
      )}
      {vista === 'agregar' && (
        <>
          <Cabecera titulo="Agregar club" volver={() => setVista('menu')} />
          <Formulario listo={listo} cancelar={() => setVista('menu')} />
        </>
      )}
      {vista === 'lista' && (
        <>
          <Cabecera titulo="Editar club" volver={() => setVista('menu')} />
          <Lista elegir={c => { setClub(c); setVista('editar') }} />
        </>
      )}
      {vista === 'editar' && club && (
        <>
          <Cabecera titulo={club.nombre} volver={() => { setClub(null); setVista('lista') }} />
          <Formulario key={club.id} club={club} listo={listo} cancelar={() => { setClub(null); setVista('lista') }} />
        </>
      )}

      {aviso && (
        <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-celeste text-noche font-bold text-sm rounded-2xl px-4 py-3 shadow-xl float-in">✓ {aviso}</div>
        </div>
      )}
    </div>
  )
}
