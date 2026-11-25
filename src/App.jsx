import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Fondo from './components/Fondo'
import Home from './components/Home'
import Zona from './components/Zona'
import Buscar from './components/Buscar'
import Tablas from './components/Tablas'
import Instalar from './components/Instalar'
import PinLogin from './components/PinLogin'
import Logo from './components/Logo'
import Partido from './components/Partido'
import ListaPartidos from './components/ListaPartidos'
import Admin from './admin/Admin'
import AdminClubes from './admin/AdminClubes'
import NuevoPartido from './admin/NuevoPartido'
import { cargarDemo } from './data/partidos'
import { Candado, CandadoAbierto, Silbato, Salir } from './components/Iconos'
import { auth, db, ref, get, onValue, query, orderByChild, equalTo, onAuthStateChanged, esAdmin, salir } from './firebase'

// Navegación por hash para que el botón Atrás del celular funcione:
// #tablas, #zona/<id>, #tabla/<id>, #buscar, #ingresar, #arbitro, #admin, #admin-clubes, #partido/<id>, #nuevo
const leerRuta = () => {
  const h = decodeURIComponent(location.hash.slice(1))
  for (const v of ['zona', 'tabla', 'partido']) if (h.startsWith(v + '/')) return { vista: v, id: h.slice(v.length + 1) }
  if (['tablas', 'buscar', 'ingresar', 'arbitro', 'admin', 'admin-clubes', 'nuevo'].includes(h)) return { vista: h }
  return { vista: 'home' }
}
const aLista = v => Object.entries(v || {}).map(([id, x]) => ({ id, ...x }))

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [ruta, setRuta] = useState(leerRuta)
  const [sesion, setSesion] = useState({ cargando: true }) // { usuario, rol: 'admin'|'arbitro', arbitro }
  const [errorLogin, setErrorLogin] = useState('')
  const [partidos, setPartidos] = useState([]) // los del árbitro, o todos para el admin
  const [arbitros, setArbitros] = useState([])

  // Solo en desarrollo: ?demo=admin o ?demo=arbitro muestra datos de prueba sin login
  const demo = import.meta.env.DEV && new URLSearchParams(location.search).get('demo')
  useEffect(() => {
    if (!demo) return
    import('./demo').then(m => { setSesion(m.sesion(demo)); setTimeout(() => { setPartidos(m.partidos); setArbitros(m.arbitros); cargarDemo(m.partidos) }, 50) })
  }, []) // eslint-disable-line

  // Quién entró: admin o árbitro (y que el árbitro siga activo)
  useEffect(() => demo ? undefined : onAuthStateChanged(auth, async u => {
    if (!u) return setSesion({})
    if (esAdmin(u)) return setSesion({ usuario: u, rol: 'admin' })
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
      off.push(onValue(ref(db, 'partidos'), s => setPartidos(aLista(s.val())), () => {}))
      off.push(onValue(ref(db, 'arbitros'), s => setArbitros(aLista(s.val())), () => {}))
    } else {
      const q = query(ref(db, 'partidos'), orderByChild('arbitroUid'), equalTo(sesion.usuario.uid))
      off.push(onValue(q, s => setPartidos(aLista(s.val())), () => {}))
    }
    return () => off.forEach(f => f())
  }, [sesion.usuario, sesion.rol]) // eslint-disable-line

  useEffect(() => {
    const on = () => { setRuta(leerRuta()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const ir = h => { location.hash = h }
  const volver = () => (history.length > 1 ? history.back() : ir(''))
  const admin = sesion.rol === 'admin'
  const arbitro = sesion.rol === 'arbitro'

  // Recién entró con el PIN: va a su pantalla
  useEffect(() => {
    if (ruta.vista === 'ingresar' && sesion.usuario) location.replace('#' + (admin ? 'admin' : 'arbitro'))
  }, [sesion.usuario, ruta.vista]) // eslint-disable-line

  const v = ruta.vista
  const necesitaLogin = ['arbitro', 'admin', 'admin-clubes', 'partido', 'nuevo'].includes(v)
  const partido = v === 'partido' && partidos.find(p => p.id === ruta.id)

  let contenido
  if (v === 'home' || v === 'tablas') contenido = (
    <Home modo={v === 'tablas' ? 'tablas' : 'ubicaciones'} cambiarModo={m => location.replace('#' + (m === 'tablas' ? 'tablas' : ''))}
      abrirZona={id => ir('zona/' + id)} abrirTabla={id => ir('tabla/' + id)} abrirBuscar={() => ir('buscar')} />
  )
  else if (v === 'zona') contenido = <Zona zonaId={ruta.id} volver={volver} />
  else if (v === 'tabla') contenido = <Tablas zonaId={ruta.id} volver={volver} />
  else if (v === 'buscar') contenido = <Buscar volver={volver} />
  else if (sesion.cargando && necesitaLogin) contenido = <div className="flex justify-center pt-40"><Logo size={120} /></div>
  else if (v === 'ingresar' || (necesitaLogin && !sesion.usuario)) contenido = <PinLogin error={errorLogin} volver={() => ir('')} />
  else if (v === 'partido') contenido = partido
    ? <Partido key={partido.id} partido={partido} admin={admin} volver={volver} />
    : <p className="text-center text-white/50 pt-40">Cargando partido…</p>
  else if (v === 'nuevo' && admin) contenido = <NuevoPartido arbitros={arbitros} volver={volver} />
  else if (v === 'admin-clubes' && admin) contenido = <AdminClubes salir={volver} />
  else if (admin) contenido = <Admin partidos={partidos} arbitros={arbitros} abrir={id => ir('partido/' + id)} nuevo={() => ir('nuevo')} abrirClubes={() => ir('admin-clubes')} inicio={() => ir('')} />
  else contenido = (
    <div className="px-4 safe-top pb-16 max-w-md mx-auto">
      <div className="flex items-center gap-3 pt-3">
        <button onClick={() => ir('')} aria-label="Inicio"><Logo size={46} /></button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber-300/80">Árbitros · Liga Argentina</p>
          <p className="font-display text-2xl leading-none tracking-wide truncate">Hola, {sesion.arbitro?.nombre || 'árbitro'}</p>
        </div>
        <button onClick={() => { salir(); ir('') }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60" aria-label="Salir"><Salir className="w-5 h-5" /></button>
      </div>
      <p className="font-display text-xl tracking-wider text-white/60 mt-5 mb-3">Mis partidos</p>
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
        <button onClick={() => ir(admin ? 'admin' : arbitro ? 'arbitro' : 'ingresar')}
          className="fixed top-0 right-0 z-30 safe-top" aria-label={admin ? 'Administrador' : arbitro ? 'Mis partidos' : 'Ingresar árbitros y admin'}>
          <span className={`m-3 h-10 px-3 rounded-full flex items-center gap-1.5 border backdrop-blur text-xs font-bold ${admin ? 'bg-celeste text-noche border-celeste' : arbitro ? 'bg-amber-300 text-noche border-amber-300' : 'bg-white/5 text-white/60 border-white/10'}`}>
            {admin ? <><CandadoAbierto className="w-5 h-5" /> Admin</> : arbitro ? <><Silbato className="w-5 h-5" /> Mis partidos</> : <><Candado className="w-5 h-5" /> Árbitros</>}
          </span>
        </button>
      )}
      <Instalar />
    </div>
  )
}
