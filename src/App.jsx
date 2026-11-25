import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Fondo from './components/Fondo'
import Home from './components/Home'
import Zona from './components/Zona'
import Buscar from './components/Buscar'
import Tablas from './components/Tablas'
import MiClub, { ElegirClub, leerMiClub, guardarMiClub } from './components/MiClub'
import Instalar from './components/Instalar'
import PinLogin from './components/PinLogin'
import Logo from './components/Logo'
import Partido from './components/Partido'
import ListaPartidos from './components/ListaPartidos'
import Admin from './admin/Admin'
import AdminClubes from './admin/AdminClubes'
import NuevoPartido from './admin/NuevoPartido'
import Backoffice from './super/Backoffice'
import { iniciarMetricas, contarVista, contarBajada, marcarPersonal } from './data/metricas'
import { cargarDemo } from './data/partidos'
import { BloqueoHuella, OpcionHuella } from './components/Huella'
import { huellaActiva } from './data/huella'
import { Candado, CandadoAbierto, Silbato, Salir } from './components/Iconos'
import { auth, db, ref, get, onValue, query, orderByChild, equalTo, onAuthStateChanged, esSuper, esAdminLiga, salir } from './firebase'

// Navegación por hash para que el botón Atrás del celular funcione:
// #mi-club, #elegir-club, #tablas, #zona/<id>, #tabla/<id>, #buscar, #ingresar, #arbitro, #admin, #admin-clubes, #partido/<id>, #nuevo
// #admin para el SuperAdmin es el Backoffice; #gestion es el panel de Admin (partidos, árbitros…)
const leerRuta = () => {
  const h = decodeURIComponent(location.hash.slice(1))
  for (const v of ['zona', 'tabla', 'partido']) if (h.startsWith(v + '/')) return { vista: v, id: h.slice(v.length + 1) }
  if (['mi-club', 'elegir-club', 'tablas', 'buscar', 'ingresar', 'admin-ingresar', 'arbitro', 'admin', 'gestion', 'admin-clubes', 'nuevo'].includes(h)) return { vista: h }
  return { vista: 'home' }
}
const aLista = v => Object.entries(v || {}).map(([id, x]) => ({ id, ...x })).filter(x => !x.borrado)

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [ruta, setRuta] = useState(leerRuta)
  const [sesion, setSesion] = useState({ cargando: true }) // { usuario, rol: 'admin'|'arbitro', arbitro }
  const [errorLogin, setErrorLogin] = useState('')
  const [partidos, setPartidos] = useState([]) // los del árbitro, o todos para el admin
  const [arbitros, setArbitros] = useState([])
  const [miKey, setMiKey] = useState(leerMiClub)
  const [desbloqueado, setDesbloqueado] = useState(false) // ya pasó PIN o huella en esta apertura

  // Solo en desarrollo: ?demo=admin o ?demo=arbitro muestra datos de prueba sin login
  const demo = import.meta.env.DEV && new URLSearchParams(location.search).get('demo')
  useEffect(() => {
    if (!demo) return
    import('./demo').then(m => { setSesion(m.sesion(demo)); setTimeout(() => { setPartidos(m.partidos); setArbitros(m.arbitros); cargarDemo(m.partidos) }, 50) })
  }, []) // eslint-disable-line

  // Quién entró: admin o árbitro (y que el árbitro siga activo)
  useEffect(() => demo ? undefined : onAuthStateChanged(auth, async u => {
    if (!u) return setSesion({})
    if (esSuper(u)) {
      // El celular del SuperAdmin no cuenta en las métricas de uso (se puede cambiar en el Backoffice)
      try { if (localStorage.getItem('laf_m_staff') == null) marcarPersonal(true) } catch {}
      return setSesion({ usuario: u, rol: 'admin', superAdmin: true })
    }
    if (esAdminLiga(u)) {
      try {
        const s = await get(ref(db, 'admins/' + u.uid))
        if (s.exists() && s.val().activo !== false) return setSesion({ usuario: u, rol: 'admin', superAdmin: false, admin: s.val() })
      } catch { /* sin permiso o sin conexión */ }
      setErrorLogin('Ese PIN de administrador ya no está habilitado.')
      await salir(); return
    }
    try {
      const s = await get(ref(db, 'arbitros/' + u.uid))
      if (!s.exists() || s.val().activo === false) {
        setErrorLogin('Tu PIN está dado de baja. Hablá con la liga.')
        await salir(); return
      }
      setErrorLogin('')
      setSesion({ usuario: u, rol: 'arbitro', arbitro: s.val() })
    } catch {
      setSesion({ usuario: u, rol: 'arbitro', arbitro: null })
    }
  }), []) // eslint-disable-line

  // Datos privados en vivo según el rol
  useEffect(() => {
    if (demo) return
    setPartidos([]); setArbitros([])
    if (!sesion.usuario) return
    const off = []
    if (sesion.rol === 'admin') {
      off.push(onValue(ref(db, 'partidos'), s => { contarBajada(s.val()); setPartidos(aLista(s.val())) }, () => {}))
      off.push(onValue(ref(db, 'arbitros'), s => { contarBajada(s.val()); setArbitros(aLista(s.val())) }, () => {}))
    } else {
      const q = query(ref(db, 'partidos'), orderByChild('arbitroUid'), equalTo(sesion.usuario.uid))
      off.push(onValue(q, s => { contarBajada(s.val()); setPartidos(aLista(s.val())) }, () => {}))
    }
    return () => off.forEach(f => f())
  }, [sesion.usuario, sesion.rol]) // eslint-disable-line

  // Métricas anónimas de uso (para el Backoffice)
  useEffect(() => { iniciarMetricas() }, [])
  useEffect(() => { contarVista(ruta.vista, ruta.id, miKey) }, [ruta.vista, ruta.id]) // eslint-disable-line

  useEffect(() => {
    const on = () => { setRuta(leerRuta()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const ir = h => { location.hash = h }
  const volver = () => (history.length > 1 ? history.back() : ir(''))
  const admin = sesion.rol === 'admin'
  const superAdmin = admin && sesion.superAdmin === true
  const arbitro = sesion.rol === 'arbitro'

  // Recién entró con el PIN: va a su panel
  useEffect(() => {
    if (ruta.vista === 'ingresar' && arbitro) { setDesbloqueado(true); location.replace('#arbitro') }
    if (ruta.vista === 'admin-ingresar' && admin) { setDesbloqueado(true); location.replace('#admin') }
  }, [sesion.rol, ruta.vista]) // eslint-disable-line

  const v = ruta.vista
  // Panel de árbitros (solo árbitros) y panel de admin (solo admin), cada uno con su ingreso
  const rutaArbitro = v === 'arbitro'
  const rutaAdmin = ['admin', 'gestion', 'admin-clubes', 'nuevo'].includes(v)
  const partido = v === 'partido' && partidos.find(p => p.id === ruta.id)
  const uid = sesion.usuario?.uid
  // Con huella activada, "salir" solo bloquea el panel (la sesión queda para entrar con huella)
  const cerrarSesion = async () => { setDesbloqueado(false); await salir(); ir('') }
  const salirPanel = () => { if (huellaActiva(uid)) { setDesbloqueado(false); ir('') } else cerrarSesion() }
  const pideHuella = !demo && !desbloqueado && huellaActiva(uid) &&
    ((rutaAdmin && admin) || (rutaArbitro && arbitro) || (v === 'partido' && sesion.usuario))

  let contenido
  if (v === 'home' || v === 'tablas') contenido = (
    <Home modo={v === 'tablas' ? 'tablas' : 'ubicaciones'} cambiarModo={m => location.replace('#' + (m === 'tablas' ? 'tablas' : ''))}
      abrirZona={id => ir('zona/' + id)} abrirTabla={id => ir('tabla/' + id)} abrirBuscar={() => ir('buscar')}
      miKey={miKey} abrirMiClub={() => ir(miKey ? 'mi-club' : 'elegir-club')} />
  )
  else if (v === 'mi-club' && miKey) contenido = <MiClub miKey={miKey} volver={volver} cambiar={() => ir('elegir-club')} abrirTabla={id => ir('tabla/' + id)} />
  else if (v === 'mi-club' || v === 'elegir-club') contenido = (
    <ElegirClub volver={volver} elegir={k => { guardarMiClub(k); setMiKey(k); location.replace('#mi-club') }} />
  )
  else if (v === 'zona') contenido = <Zona zonaId={ruta.id} volver={volver} />
  else if (v === 'tabla') contenido = <Tablas zonaId={ruta.id} volver={volver} />
  else if (v === 'buscar') contenido = <Buscar volver={volver} />
  else if (sesion.cargando && (rutaArbitro || rutaAdmin || v === 'partido')) contenido = <div className="flex justify-center pt-40"><Logo size={120} /></div>
  else if (pideHuella) contenido = (
    <BloqueoHuella uid={uid} titulo={admin ? (superAdmin ? 'SuperAdmin' : 'Administrador') : 'Árbitros'}
      ok={() => setDesbloqueado(true)} usarPin={async () => { const r = admin ? 'admin-ingresar' : 'ingresar'; await salir(); location.replace('#' + r) }} volver={() => ir('')} />
  )
  else if (v === 'admin-ingresar' || (rutaAdmin && !admin)) contenido = <PinLogin key="adm" tipo="admin" error={errorLogin} volver={() => ir('')} />
  else if (v === 'ingresar' || (rutaArbitro && !arbitro) || (v === 'partido' && !sesion.usuario)) contenido = <PinLogin key="arb" tipo="arbitro" error={errorLogin} volver={() => ir('')} />
  else if (v === 'partido') contenido = partido
    ? <Partido key={partido.id} partido={partido} admin={admin} superAdmin={superAdmin} arbitros={arbitros} volver={volver} />
    : <p className="text-center text-white/50 pt-40">Cargando partido…</p>
  else if (v === 'nuevo' && admin) contenido = <NuevoPartido arbitros={arbitros} volver={volver} />
  else if (v === 'admin-clubes' && admin) contenido = <AdminClubes salir={volver} superAdmin={superAdmin} />
  else if (v === 'admin' && superAdmin) contenido = <Backoffice salir={salirPanel} cerrarSesion={cerrarSesion} uid={uid} partidos={partidos} arbitros={arbitros} abrirGestion={() => ir('gestion')} inicio={() => ir('')} demo={demo} />
  else if (rutaAdmin) contenido = <Admin backoffice={superAdmin ? () => ir('admin') : null} salir={salirPanel} cerrarSesion={cerrarSesion} uid={uid} superAdmin={superAdmin} partidos={partidos} arbitros={arbitros} abrir={id => ir('partido/' + id)} nuevo={() => ir('nuevo')} abrirClubes={() => ir('admin-clubes')} inicio={() => ir('')} />
  else contenido = (
    <div className="px-4 safe-top pb-16 max-w-md mx-auto">
      <div className="flex items-center gap-3 pt-3">
        <button onClick={() => ir('')} aria-label="Inicio"><Logo size={46} /></button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber-300/80">Árbitros · Liga Argentina</p>
          <p className="font-display text-2xl leading-none tracking-wide truncate">Hola, {sesion.arbitro?.nombre || 'árbitro'}</p>
        </div>
        <button onClick={salirPanel} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60" aria-label="Salir"><Salir className="w-5 h-5" /></button>
      </div>
      <div className="mt-4"><OpcionHuella uid={uid} nombre={sesion.arbitro ? `${sesion.arbitro.nombre} ${sesion.arbitro.apellido}` : 'Árbitro'} cerrarSesion={cerrarSesion} /></div>
      <p className="font-display text-xl tracking-wider text-white/60 mt-1 mb-3">Mis partidos</p>
      <ListaPartidos partidos={partidos} abrir={id => ir('partido/' + id)} vacio="Todavía no tenés partidos asignados." />
    </div>
  )

  const enInicio = v === 'home' || v === 'tablas'
  return (
    <div className="flex flex-col min-h-dvh text-white">
      <Fondo />
      <main className="flex-1 relative z-10 pb-24">{contenido}</main>

      {needRefresh && (
        <div className="fixed top-3 left-3 right-3 z-50">
          <div className="max-w-md mx-auto bg-celeste text-noche rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
            <p className="text-sm font-bold">Nueva versión disponible</p>
            <button onClick={() => updateServiceWorker(true)} className="bg-noche text-white text-xs font-bold px-3 py-1.5 rounded-xl">Actualizar</button>
          </div>
        </div>
      )}
      {enInicio && (
        <>
          {/* Arriba a la izquierda: administrador */}
          <button onClick={() => ir(admin ? 'admin' : 'admin-ingresar')}
            className="fixed top-0 left-0 z-30 safe-top" aria-label="Administrador">
            <span className={`m-3 h-10 px-3 rounded-full flex items-center gap-1.5 border backdrop-blur text-xs font-bold ${admin ? 'bg-celeste text-noche border-celeste' : 'bg-white/5 text-white/60 border-white/10'}`}>
              {admin ? <CandadoAbierto className="w-5 h-5" /> : <Candado className="w-5 h-5" />} Admin
            </span>
          </button>
          {/* Arriba a la derecha: árbitros */}
          <button onClick={() => ir(arbitro ? 'arbitro' : 'ingresar')}
            className="fixed top-0 right-0 z-30 safe-top" aria-label="Árbitros">
            <span className={`m-3 h-10 px-3 rounded-full flex items-center gap-1.5 border backdrop-blur text-xs font-bold ${arbitro ? 'bg-amber-300 text-noche border-amber-300' : 'bg-white/5 text-white/60 border-white/10'}`}>
              <Silbato className="w-5 h-5" /> {arbitro ? 'Mis partidos' : 'Árbitros'}
            </span>
          </button>
        </>
      )}
      <Instalar />
    </div>
  )
}
