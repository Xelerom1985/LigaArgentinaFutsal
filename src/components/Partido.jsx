import { useEffect, useRef, useState } from 'react'
import { db, ref, get, update, auth, mensajeError, ACT } from '../firebase'
import { fechaCorta } from '../data/categorias'
import { prepararHoja, abrirDataUrl } from '../admin/imagen'
import { vencida, CUANDO_SE_BORRAN } from '../data/limpieza'
import Escudo, { useEscudo } from './Escudo'
import { nombreZonas } from './ListaPartidos'
import { Atras, Clip, Check, Basura, Candado } from './Iconos'

// Semáforo: L = ganó el local, E = empate, V = ganó el visitante
function Luz({ activa, color, borde, onClick, label }) {
  return (
    <button onClick={onClick} aria-label={label}
      className="w-11 h-11 rounded-full border-2 transition-all active:scale-90 shrink-0"
      style={activa ? { background: color, borderColor: color, boxShadow: `0 0 14px ${color}88` } : { borderColor: borde }} />
  )
}
const VERDE = '#22c55e', AMARILLO = '#facc15', ROJO = '#ef4444'

export default function Partido({ partido: p, admin, superAdmin, arbitros = [], volver }) {
  const escudo = useEscudo()
  const [res, setRes] = useState(p.resultados || {})
  const [cambios, setCambios] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(null)
  const [aviso, setAviso] = useState('')
  const archivo = useRef(null)
  const catElegida = useRef(null)
  const cerrado = p.estado === 'cerrado'
  const editable = admin || !cerrado
  const hojas = p.hojas || {}
  const cats = p.categorias || []

  // Si otro dispositivo cambia los resultados y acá no hay cambios sin guardar, se actualiza
  useEffect(() => { if (!cambios) setRes(p.resultados || {}) }, [p.resultados]) // eslint-disable-line

  const mostrar = m => { setAviso(m); setTimeout(() => setAviso(''), 2500) }
  const elegir = (i, v) => {
    if (!editable) return
    setRes(r => { const n = { ...r }; if (n[i] === v) delete n[i]; else n[i] = v; return n })
    setCambios(true)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const completos = cats.every((_, i) => res[i])
      await update(ref(db, 'partidos/' + p.id), {
        resultados: res,
        estado: cerrado ? 'cerrado' : completos ? 'cargado' : 'en curso',
        actualizado: Date.now(),
        act: ACT(),
        actualizadoPor: auth.currentUser?.uid || '',
      })
      setCambios(false); mostrar('Resultados guardados')
    } catch (e) { mostrar(mensajeError(e)) } finally { setGuardando(false) }
  }

  const examinar = i => { catElegida.current = i; archivo.current.value = ''; archivo.current.click() }
  const subir = async e => {
    const f = e.target.files?.[0]; const i = catElegida.current
    if (!f || i == null) return
    setSubiendo(i)
    try {
      const h = await prepararHoja(f)
      const subido = Date.now()
      await update(ref(db), {
        [`hojas/${p.id}/${i}`]: { ...h, subido },
        [`partidos/${p.id}/hojas/${i}`]: { nombre: h.nombre, tipo: h.tipo, subido },
        [`partidos/${p.id}/act`]: ACT(),
      })
      mostrar('Hoja subida')
    } catch (err) { mostrar(err.message?.startsWith('El PDF') ? err.message : mensajeError(err)) } finally { setSubiendo(null) }
  }
  const verHoja = async i => {
    try {
      const s = await get(ref(db, `hojas/${p.id}/${i}`))
      if (s.exists()) abrirDataUrl(s.val().data); else mostrar('No se encontró la hoja')
    } catch (e) { mostrar(mensajeError(e)) }
  }

  const cerrarPartido = async v => {
    try { await update(ref(db, 'partidos/' + p.id), { estado: v ? 'cerrado' : (cats.every((_, i) => res[i]) ? 'cargado' : 'en curso'), act: ACT() }) } catch (e) { mostrar(mensajeError(e)) }
  }
  const asignarArbitro = async uid => {
    const a = arbitros.find(x => x.id === uid)
    try {
      await update(ref(db, 'partidos/' + p.id), { arbitroUid: a ? a.id : null, arbitroNombre: a ? `${a.nombre} ${a.apellido}`.trim() : null, act: ACT() })
      mostrar(a ? `Asignado a ${a.nombre} ${a.apellido}` : 'Partido sin árbitro')
    } catch (e) { mostrar(mensajeError(e)) }
  }
  const borrar = async () => {
    if (!window.confirm(`¿Borrar ${p.local} vs ${p.visitante}? Se pierden resultados y hojas.`)) return
    try { await update(ref(db), { [`partidos/${p.id}`]: { borrado: true, act: ACT() }, [`hojas/${p.id}`]: null }); volver() } catch (e) { mostrar(mensajeError(e)) }
  }

  return (
    <div className="px-4 safe-top pb-32 max-w-md mx-auto">
      <div className="flex items-center gap-2 pt-3 pb-2">
        <button onClick={volver} className="w-10 h-10 -ml-2 flex items-center justify-center text-white/70"><Atras className="w-6 h-6" /></button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-amber-300/80">{fechaCorta(p.fecha)} · {nombreZonas(p)}</p>

        </div>
        {cerrado && <span className="flex items-center gap-1 text-xs bg-white/10 rounded-full px-2.5 py-1 text-white/70"><Candado className="w-3.5 h-3.5" /> Cerrado</span>}
      </div>

      {/* Clubes en los extremos */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-white/[0.06] border border-white/10 px-3 py-4">
        <div className="flex flex-col items-center text-center gap-1.5 min-w-0">
          <Escudo src={escudo(p.local, p.zonaId)} nombre={p.local} className="w-14 h-14" />
          <p className="text-xs font-bold leading-tight break-words">{p.local}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Local</p>
        </div>
        <p className="font-display text-3xl text-white/40">VS</p>
        <div className="flex flex-col items-center text-center gap-1.5 min-w-0">
          <Escudo src={escudo(p.visitante, p.visitanteZonaId || p.zonaId)} nombre={p.visitante} className="w-14 h-14" />
          <p className="text-xs font-bold leading-tight break-words">{p.visitante}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Visitante</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] uppercase tracking-wider text-white/40 mt-4 mb-1 px-3">
        <span>Gana local</span><span>Empate</span><span className="text-right">Gana visitante</span>
      </div>

      <div className="rounded-2xl bg-[#1c1c1f]/90 border border-white/10 divide-y divide-white/[0.06] overflow-hidden">
        {cats.map((c, i) => {
          const r = res[i]
          const hoja = hojas[i]
          const venc = vencida(hoja)
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-3">
              <Luz label="Gana local" activa={r === 'L' || r === 'V'} color={r === 'L' ? VERDE : ROJO} borde={`${VERDE}66`} onClick={() => elegir(i, 'L')} />
              <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <p className="text-[13px] font-semibold text-white/85 text-center leading-tight">{c}</p>
                <div className="flex items-center gap-2">
                  <span className="w-9" />
                  <Luz label="Empate" activa={r === 'E'} color={AMARILLO} borde={`${AMARILLO}66`} onClick={() => elegir(i, 'E')} />
                  <button onClick={() => (venc ? mostrar(`Las planillas se borran ${CUANDO_SE_BORRAN} (está en el ZIP de la fecha)`) : hoja ? verHoja(i) : editable && examinar(i))}
                    onContextMenu={e => { e.preventDefault(); editable && examinar(i) }}
                    aria-label={venc ? 'Planilla vencida' : hoja ? 'Ver hoja firmada' : 'Subir hoja firmada'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border ${venc ? 'bg-white/10 border-white/20 text-white/40' : hoja ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300' : 'border-white/15 text-white/45'}`}>
                    {subiendo === i ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : venc ? <span className="text-sm">⌛</span> : hoja ? <Check className="w-4 h-4" /> : <Clip className="w-4 h-4" />}
                  </button>
                </div>
                {hoja && editable && <button onClick={() => examinar(i)} className="text-[10px] text-white/35 underline">{venc ? 'Volver a subir' : 'Cambiar hoja'}</button>}
              </div>
              <Luz label="Gana visitante" activa={r === 'V' || r === 'L'} color={r === 'V' ? VERDE : ROJO} borde={`${VERDE}66`} onClick={() => elegir(i, 'V')} />
            </div>
          )
        })}
      </div>
      <p className="text-white/35 text-[11px] text-center mt-2">
        <Clip className="w-3 h-3 inline -mt-0.5" /> Examinar: subí la foto o PDF de la hoja firmada de cada categoría
      </p>

      {admin && (
        <label className="flex items-center gap-2 mt-5 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3">
          <span className="text-sm text-white/60 shrink-0">Árbitro</span>
          <select value={p.arbitroUid || ''} onChange={e => asignarArbitro(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm font-bold text-amber-300 outline-none text-right [color-scheme:dark]">
            <option value="">Sin asignar</option>
            {arbitros.filter(a => a.activo !== false || a.id === p.arbitroUid)
              .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))
              .map(a => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
          </select>
        </label>
      )}
      {admin && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => cerrarPartido(!cerrado)} className="flex-1 rounded-xl py-3 bg-white/[0.07] border border-white/10 text-sm font-semibold">
            {cerrado ? 'Reabrir para el árbitro' : 'Cerrar partido'}
          </button>
          {superAdmin && <button onClick={borrar} className="rounded-xl px-4 py-3 bg-red-500/15 text-red-300 border border-red-500/30" aria-label="Borrar partido"><Basura className="w-5 h-5" /></button>}
        </div>
      )}

      <input ref={archivo} type="file" accept="image/*,application/pdf" className="hidden" onChange={subir} />

      {editable && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 safe-bottom pt-3 bg-gradient-to-t from-[#06142a] via-[#06142a]/95 to-transparent">
          <button onClick={guardar} disabled={!cambios || guardando}
            className="w-full max-w-md mx-auto block rounded-2xl py-4 font-bold text-white disabled:opacity-40 transition"
            style={{ background: 'linear-gradient(135deg,#c90f1c,#7a0016)' }}>
            {guardando ? 'Guardando…' : cambios ? 'Guardar resultados' : 'Resultados guardados'}
          </button>
        </div>
      )}
      {!editable && <p className="text-center text-white/50 text-sm mt-6">El partido está cerrado por la liga. Si hay un error, avisá al administrador.</p>}

      {aviso && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-noche text-sm font-bold rounded-xl px-4 py-2 shadow-xl">{aviso}</div>}
    </div>
  )
}
