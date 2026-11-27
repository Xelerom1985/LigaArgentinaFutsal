import { useEffect, useMemo, useState } from 'react'
import { db, ref, get, onValue, remove, query, orderByKey, startAt, mensajeError } from '../firebase'
import { diaDe, claveDe, contarBajada, esPersonal, marcarPersonal } from '../data/metricas'
import { useClubes, zonaPorId } from '../data/clubes'
import TorneoAdmin from '../admin/TorneoAdmin'
import Accesos from '../admin/Accesos'
import Logo from '../components/Logo'
import { Salir } from '../components/Iconos'
import { OpcionHuella } from '../components/Huella'

// Backoffice del SuperAdmin: controlar la app (uso, consumo, errores, accesos, torneo).
// La gestión diaria (partidos, árbitros, clubes, planillas) es del Admin de la Liga.

// Límites del plan gratis de Firebase (Spark)
const LIM = { baseMes: 10 * 1024 ** 3, baseGuardado: 1024 ** 3, hostingDia: 360 * 1024 ** 2 }
const PROTOCOLO = 1.2 // la descarga real de la base trae ~20% más (conexión, encabezados)
const PLANILLA_PROMEDIO = 700 * 1024 // si una planilla vieja no guardó su tamaño
const CONSOLA = 'https://console.firebase.google.com/project/liga-argentina-futsal'

const VISTAS = {
  inicio: 'Inicio', tablas: 'Inicio · tablas', zona: 'Clubes de una zona', tabla: 'Tabla de posiciones',
  buscar: 'Buscador', 'mi-club': 'Mi club', 'elegir-club': 'Elegir mi club', ingresar: 'Ingreso árbitros',
  'admin-ingresar': 'Ingreso admin', arbitro: 'Panel de árbitro', admin: 'Panel admin', 'admin-clubes': 'Admin · clubes',
  partido: 'Partido', nuevo: 'Asignar partido', gestion: 'Gestión (admin)',
}
const ACCIONES = { 'como-llegar': 'Tocaron "Cómo llegar"', instalo: 'Instalaron la app', compartio: 'Compartieron la app' }

const fmtN = n => Math.round(n || 0).toLocaleString('es-AR')
const fmtB = b => b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB` : b >= 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${Math.round((b || 0) / 1024)} KB`
const diaCorto = d => { const [, m, dd] = d.split('-'); return `${+dd}/${+m}` }
const diasAtras = n => Array.from({ length: n }, (_, i) => diaDe(Date.now() - (n - 1 - i) * 864e5))

function sumar(datos, dias, grupo) {
  const out = {}
  for (const d of dias) for (const [k, v] of Object.entries(datos[d]?.[grupo] || {})) out[k] = (out[k] || 0) + v
  return out
}
const total = o => Object.values(o).reduce((a, b) => a + b, 0)

// ---------- piezas ----------
const Tarjeta = ({ titulo, children, extra }) => (
  <section className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 mb-3">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11px] uppercase tracking-widest text-white/50 font-bold">{titulo}</p>{extra}
    </div>
    {children}
  </section>
)
const Numero = ({ label, valor, sub }) => (
  <div className="rounded-xl bg-white/[0.05] px-3 py-2.5 min-w-0">
    <p className="text-[11px] text-white/50 leading-tight">{label}</p>
    <p className="font-display text-3xl leading-none tracking-wide mt-1 tabular-nums">{valor}</p>
    {sub && <p className="text-[11px] text-white/45 mt-1 leading-tight">{sub}</p>}
  </div>
)

// Barras por día (una sola serie). Tocar una barra muestra el valor.
function BarrasDias({ serie, unidad = '', fmt = fmtN }) {
  const [sel, setSel] = useState(null)
  const max = Math.max(1, ...serie.map(s => s.v))
  const elegido = sel != null ? serie[sel] : serie[serie.length - 1]
  return (
    <div>
      <p className="text-sm text-white/70 mb-2 h-5">
        <span className="font-bold text-white">{fmt(elegido.v)}</span> {unidad} · {sel != null ? diaCorto(elegido.dia) : 'hoy'}
      </p>
      <div className="flex items-end gap-[2px] h-28 border-b border-white/15" onMouseLeave={() => setSel(null)}>
        {serie.map((s, i) => (
          <button key={s.dia} onMouseEnter={() => setSel(i)} onClick={() => setSel(i)} title={`${diaCorto(s.dia)}: ${fmt(s.v)} ${unidad}`}
            className="flex-1 h-full flex items-end" aria-label={`${diaCorto(s.dia)}: ${fmt(s.v)} ${unidad}`}>
            <span className={`w-full rounded-t-[3px] ${sel === i ? 'bg-amber-200' : 'bg-amber-300/80'}`}
              style={{ height: s.v ? `${Math.max(3, (s.v / max) * 100)}%` : '0%' }} />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/40 mt-1">
        <span>{diaCorto(serie[0].dia)}</span><span>máx. {fmt(max)}</span><span>hoy</span>
      </div>
    </div>
  )
}

// Ranking con barras horizontales
function Ranking({ datos, nombre = k => k, max = 8, vacio = 'Todavía no hay datos.' }) {
  const [todos, setTodos] = useState(false)
  const lista = Object.entries(datos).sort((a, b) => b[1] - a[1])
  if (!lista.length) return <p className="text-sm text-white/40 py-2">{vacio}</p>
  const tope = lista[0][1]
  const suma = total(datos)
  return (
    <div className="flex flex-col gap-1.5">
      {(todos ? lista : lista.slice(0, max)).map(([k, v]) => (
        <div key={k}>
          <div className="flex justify-between text-[13px] gap-2">
            <span className="truncate">{nombre(k)}</span>
            <span className="tabular-nums text-white/70 shrink-0">{fmtN(v)} <span className="text-white/40 text-[11px]">· {Math.round((v / suma) * 100)}%</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] mt-0.5"><div className="h-full rounded-full bg-celeste/80" style={{ width: `${(v / tope) * 100}%` }} /></div>
        </div>
      ))}
      {lista.length > max && <button onClick={() => setTodos(t => !t)} className="text-xs text-white/50 underline self-start mt-1">{todos ? 'Ver menos' : `Ver los ${lista.length}`}</button>}
    </div>
  )
}

// Medidor contra un límite, con estado en texto (no solo color)
function Medidor({ label, usado, limite, nota }) {
  const p = Math.min(100, (usado / limite) * 100)
  const est = p >= 90 ? ['Crítico', 'bg-red-500', 'text-red-300'] : p >= 70 ? ['Atención', 'bg-orange-400', 'text-orange-300'] : ['Bien', 'bg-emerald-400', 'text-emerald-300']
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-baseline text-sm gap-2">
        <span>{label}</span>
        <span className={`text-xs font-bold ${est[2]}`}>{est[0]} · {p < 1 ? p.toFixed(1) : Math.round(p)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.08] mt-1 overflow-hidden"><div className={`h-full rounded-full ${est[1]}`} style={{ width: `${Math.max(p, 0.8)}%` }} /></div>
      <p className="text-[11px] text-white/45 mt-1">{fmtB(usado)} de {fmtB(limite)}{nota ? ` · ${nota}` : ''}</p>
    </div>
  )
}

const Rango = ({ dias, setDias }) => (
  <div className="flex gap-1 p-1 rounded-xl bg-white/[0.06] mb-3">
    {[[1, 'Hoy'], [7, '7 días'], [30, '30 días']].map(([n, l]) => (
      <button key={n} onClick={() => setDias(n)} className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${dias === n ? 'bg-white text-noche' : 'text-white/60'}`}>{l}</button>
    ))}
  </div>
)

// ---------- pantalla ----------
export default function Backoffice({ salir, cerrarSesion, uid, partidos, arbitros, abrirGestion, inicio, demo }) {
  const [tab, setTab] = useState(() => sessionStorage.getItem('laf_bo_tab') || 'resumen')
  const cambiar = t => { setTab(t); try { sessionStorage.setItem('laf_bo_tab', t) } catch {} }
  const [datos, setDatos] = useState(null) // { dia: { grupo: { clave: n } } }
  const [errores, setErrores] = useState({})
  const [vivo, setVivo] = useState(0)
  const [admins, setAdmins] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [msg, setMsg] = useState('')
  const [dias, setDias] = useState(7)
  const [personal, setPersonal] = useState(esPersonal)
  const clubes = useClubes()

  const cargar = async () => {
    setCargando(true); setMsg('')
    try {
      if (demo) { const m = await import('../demo'); setDatos(m.metricas()); setErrores(m.errores()); setVivo(7); setAdmins(2); return }
      const desde = diaDe(Date.now() - 40 * 864e5)
      const [d, e] = await Promise.all([
        get(query(ref(db, 'metricas/d'), orderByKey(), startAt(desde))),
        get(query(ref(db, 'metricas/e'), orderByKey(), startAt(diaDe(Date.now() - 14 * 864e5)))),
      ])
      contarBajada(d.val()); contarBajada(e.val())
      setDatos(d.val() || {}); setErrores(e.val() || {})
    } catch (err) { setMsg(mensajeError(err)); setDatos({}) } finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, []) // eslint-disable-line
  useEffect(() => {
    if (demo) return
    const off1 = onValue(ref(db, 'metricas/vivo'), s => {
      const ahora = Date.now()
      setVivo(Object.values(s.val() || {}).filter(t => typeof t === 'number' && ahora - t < 12 * 3600e3).length)
    }, () => {})
    const off2 = onValue(ref(db, 'admins'), s => setAdmins(Object.values(s.val() || {}).filter(a => a.activo !== false).length), () => {})
    return () => { off1(); off2() }
  }, [demo])

  const d = datos || {}
  const rango = useMemo(() => diasAtras(dias), [dias])
  const ult30 = useMemo(() => diasAtras(30), [])
  const serie = (grupo, clave, lista = ult30) => lista.map(dia => ({ dia, v: d[dia]?.[grupo]?.[clave] || 0 }))
  const gen = sumar(d, rango, 'gen')

  // Nombres legibles
  const nombreZona = k => zonaPorId[k]?.nombre || k
  const nombresClub = useMemo(() => Object.fromEntries(clubes.map(c => [claveDe(c.nombre), c.nombre])), [clubes])
  const nombreClub = k => nombresClub[k] || k.replace(/-/g, ' ').toUpperCase()

  // Consumo del mes (hora argentina)
  const mes = diaDe(Date.now()).slice(0, 7)
  const diasMes = Object.keys(d).filter(x => x.startsWith(mes))
  const hoyDia = diaDe(Date.now())
  const kbBaseMes = diasMes.reduce((t, x) => t + (d[x]?.kb?.base || 0), 0) * 1024 * PROTOCOLO
  const diaDelMes = +hoyDia.slice(8, 10)
  const [a, m] = mes.split('-').map(Number)
  const largoMes = new Date(a, m, 0).getDate()
  const proyeccion = diaDelMes ? (kbBaseMes / diaDelMes) * largoMes : 0
  const hostingHoy = (d[hoyDia]?.kb?.hosting || 0) * 1024
  const hostingMax = Math.max(0, ...ult30.map(x => (d[x]?.kb?.hosting || 0) * 1024))
  const planillasVivas = partidos.flatMap(p => Object.values(p.hojas || {}).filter(h => h && !h.borrada))
  const tamPlanillas = planillasVivas.reduce((t, h) => t + (h.tam || PLANILLA_PROMEDIO), 0)
  const tamPartidos = JSON.stringify(partidos).length
  const tamClubes = JSON.stringify(clubes).length
  const tamMetricas = JSON.stringify(d).length + JSON.stringify(errores).length
  const guardado = tamPlanillas + tamPartidos + tamClubes + tamMetricas
  const dePrueba = partidos.filter(p => (p.fecha || '') < '2027-01-01').length

  const listaErrores = Object.entries(errores).flatMap(([dia, hs]) => Object.entries(hs || {}).map(([h, x]) => ({ dia, h, ...x })))
    .sort((x, y) => y.dia.localeCompare(x.dia) || (y.n || 0) - (x.n || 0))
  const errores7 = listaErrores.filter(x => x.dia >= diaDe(Date.now() - 6 * 864e5)).reduce((t, x) => t + (x.n || 0), 0)

  const borrarErrores = async () => {
    if (!window.confirm('¿Borrar la lista de errores? No se puede deshacer.')) return
    try { if (!demo) await remove(ref(db, 'metricas/e')); setErrores({}) } catch (e) { setMsg(mensajeError(e)) }
  }

  const TABS = [['resumen', 'Resumen'], ['uso', 'Qué miran'], ['consumo', 'Consumo'], ['errores', `Errores${errores7 ? ` (${errores7})` : ''}`], ['accesos', 'Accesos'], ['torneo', 'Torneo']]

  return (
    <div className="px-4 safe-top pb-16 max-w-md mx-auto">
      <div className="flex items-center gap-3 pt-3">
        <button onClick={inicio} aria-label="Inicio"><Logo size={46} /></button>
        <div className="flex-1">
          <p className="font-display text-2xl leading-none tracking-wide">Backoffice</p>
          <p className="text-xs text-amber-300/80">SuperAdmin · Liga Argentina de Futsal</p>
        </div>
        <button onClick={salir} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60" aria-label="Salir"><Salir className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.06] mt-4 mb-3">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => cambiar(k)} className={`rounded-xl py-2 text-[12px] font-bold leading-tight ${tab === k ? 'bg-amber-300 text-noche' : 'text-white/60'}`}>{l}</button>
        ))}
      </div>

      <OpcionHuella uid={uid} nombre="SuperAdmin" cerrarSesion={cerrarSesion} />
      {msg && <p className="text-sm text-red-400 mb-3">{msg}</p>}
      {!datos && ['resumen', 'uso', 'consumo'].includes(tab) && <p className="text-center text-white/45 py-10">Cargando métricas…</p>}

      {datos && tab === 'resumen' && <>
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.07] px-4 py-3 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="flex-1 text-sm"><b className="text-lg tabular-nums">{vivo}</b> {vivo === 1 ? 'celular con la app abierta' : 'celulares con la app abierta'} ahora</p>
        </div>
        <Rango dias={dias} setDias={setDias} />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Numero label={dias === 1 ? 'Personas hoy' : 'Personas por día'} valor={fmtN(dias === 1 ? gen.visitantes : (gen.visitantes || 0) / dias)} sub={dias === 1 ? 'celulares distintos' : 'promedio'} />
          <Numero label="Nuevas" valor={fmtN(gen.nuevos)} sub="primera vez" />
          <Numero label="Aperturas" valor={fmtN(gen.aperturas)} sub="veces que abrieron" />
        </div>
        <Tarjeta titulo="Personas por día · últimos 30 días"><BarrasDias serie={serie('gen', 'visitantes')} unidad="personas" /></Tarjeta>
        <Tarjeta titulo="Desde dónde entran">
          <Ranking datos={sumar(d, rango, 'disp')} nombre={k => ({ android: 'Android', iphone: 'iPhone', pc: 'Computadora' })[k] || k} />
          <div className="h-3" />
          <Ranking datos={sumar(d, rango, 'modo')} nombre={k => ({ app: 'App instalada', web: 'Navegador' })[k] || k} />
        </Tarjeta>
        <Tarjeta titulo="A qué hora la usan">
          <BarrasHoras datos={sumar(d, rango, 'horas')} />
        </Tarjeta>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 mb-3 text-sm">
          <input type="checkbox" checked={personal} onChange={e => { marcarPersonal(e.target.checked); setPersonal(e.target.checked) }} className="w-5 h-5 accent-amber-300" />
          <span className="flex-1">No contar este celular en las métricas de uso<span className="block text-[11px] text-white/45">Para que tus pruebas no inflen los números.</span></span>
        </label>
        <button onClick={cargar} disabled={cargando} className="w-full rounded-2xl py-3 bg-white/10 text-sm font-bold mb-3">{cargando ? 'Actualizando…' : 'Actualizar números'}</button>
      </>}

      {datos && tab === 'uso' && <>
        <Rango dias={dias} setDias={setDias} />
        <Tarjeta titulo="Pantallas más vistas"><Ranking datos={sumar(d, rango, 'vistas')} nombre={k => VISTAS[k] || k} /></Tarjeta>
        <Tarjeta titulo="Tablas de posiciones más vistas"><Ranking datos={sumar(d, rango, 'tablas')} nombre={nombreZona} /></Tarjeta>
        <Tarjeta titulo="Zonas más vistas (clubes y ubicaciones)"><Ranking datos={sumar(d, rango, 'zonas')} nombre={nombreZona} /></Tarjeta>
        <Tarjeta titulo="Clubes más seguidos en Mi club"><Ranking datos={sumar(d, rango, 'miclub')} nombre={nombreClub} /></Tarjeta>
        <Tarjeta titulo="Acciones"><Ranking datos={sumar(d, rango, 'acc')} nombre={k => ACCIONES[k] || k} /></Tarjeta>
      </>}

      {datos && tab === 'consumo' && <>
        <Tarjeta titulo="Plan gratis de Firebase · este mes">
          <Medidor label="Descarga de la base" usado={kbBaseMes} limite={LIM.baseMes} nota={`a fin de mes ≈ ${fmtB(proyeccion)}`} />
          <Medidor label="Hosting hoy (archivos de la app)" usado={hostingHoy} limite={LIM.hostingDia} nota={`peor día del mes: ${fmtB(hostingMax)}`} />
          <Medidor label="Espacio guardado en la base" usado={guardado} limite={LIM.baseGuardado} nota={`planillas: ${fmtB(tamPlanillas)}`} />
          <p className="text-[11px] text-white/40 mt-2 leading-snug">Son estimaciones medidas desde los celulares. Los números exactos están en la consola de Firebase (abajo). Si la descarga pasa los 10 GB, la base deja de responder hasta el mes siguiente.</p>
        </Tarjeta>
        <Tarjeta titulo="Descarga de la base por día"><BarrasDias serie={ult30.map(x => ({ dia: x, v: (d[x]?.kb?.base || 0) * 1024 * PROTOCOLO }))} fmt={fmtB} /></Tarjeta>
        <Tarjeta titulo="Qué hay en la base">
          <div className="grid grid-cols-3 gap-2">
            <Numero label="Partidos" valor={fmtN(partidos.length)} sub={dePrueba ? `${dePrueba} de prueba (antes de 2027)` : fmtB(tamPartidos)} />
            <Numero label="Clubes" valor={fmtN(clubes.length)} sub={fmtB(tamClubes)} />
            <Numero label="Planillas" valor={fmtN(planillasVivas.length)} sub={fmtB(tamPlanillas)} />
            <Numero label="Árbitros" valor={fmtN(arbitros.filter(x => x.activo !== false).length)} sub="activos" />
            <Numero label="Admins" valor={fmtN(admins)} sub="de la Liga" />
            <Numero label="Métricas" valor={fmtB(tamMetricas)} sub="últimos 40 días" />
          </div>
        </Tarjeta>
        <Tarjeta titulo="Consola de Firebase (números exactos)">
          <div className="flex flex-col gap-2">
            {[['Uso de la base de datos', `${CONSOLA}/database/liga-argentina-futsal-default-rtdb/usage`], ['Uso del hosting', `${CONSOLA}/hosting/sites`], ['Usuarios (cuentas de PIN)', `${CONSOLA}/authentication/users`]].map(([l, u]) => (
              <a key={u} href={u} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2.5 bg-white/[0.06] text-sm flex justify-between"><span>{l}</span><span className="text-white/40">↗</span></a>
            ))}
          </div>
        </Tarjeta>
      </>}

      {tab === 'errores' && (
        <Tarjeta titulo="Errores de la app · últimos 14 días" extra={listaErrores.length > 0 && <button onClick={borrarErrores} className="text-xs text-white/50 underline">Borrar</button>}>
          {!listaErrores.length && <p className="text-sm text-emerald-300 py-2">Sin errores registrados. ✓</p>}
          <div className="flex flex-col divide-y divide-white/10">
            {listaErrores.map(x => (
              <div key={x.dia + x.h} className="py-2">
                <div className="flex justify-between text-[11px] text-white/45"><span>{diaCorto(x.dia)}</span><span>{fmtN(x.n)} {x.n === 1 ? 'vez' : 'veces'}</span></div>
                <p className="text-[13px] break-words font-mono text-white/80">{x.msg || '(sin detalle)'}</p>
              </div>
            ))}
          </div>
        </Tarjeta>
      )}

      {tab === 'accesos' && <Accesos />}
      {tab === 'torneo' && <TorneoAdmin partidos={partidos} superAdmin />}

      <button onClick={abrirGestion} className="w-full rounded-2xl py-3 border border-white/15 text-sm text-white/70 mt-2">Abrir el panel de Admin (partidos, árbitros, clubes)</button>
    </div>
  )
}

function BarrasHoras({ datos }) {
  const horas = Array.from({ length: 24 }, (_, h) => ({ h, v: datos['h' + String(h).padStart(2, '0')] || 0 }))
  const max = Math.max(1, ...horas.map(x => x.v))
  const pico = horas.reduce((a, b) => (b.v > a.v ? b : a), horas[0])
  return (
    <div>
      <p className="text-sm text-white/70 mb-2">{pico.v ? <>Pico: <b className="text-white">{pico.h}:00 a {pico.h + 1}:00</b></> : 'Todavía no hay datos.'}</p>
      <div className="flex items-end gap-[2px] h-20 border-b border-white/15">
        {horas.map(x => (
          <span key={x.h} title={`${x.h}:00 · ${fmtN(x.v)} aperturas`} className="flex-1 h-full flex items-end">
            <span className="w-full rounded-t-[3px] bg-celeste/80" style={{ height: x.v ? `${Math.max(3, (x.v / max) * 100)}%` : '0%' }} />
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/40 mt-1"><span>0 h</span><span>6</span><span>12</span><span>18</span><span>23 h</span></div>
    </div>
  )
}
