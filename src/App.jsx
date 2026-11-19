import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Fondo from './components/Fondo'
import Home from './components/Home'
import Zona from './components/Zona'
import Buscar from './components/Buscar'
import Instalar from './components/Instalar'
import Admin from './admin/Admin'
import PinModal from './admin/Pin'
import { Candado, CandadoAbierto } from './components/Iconos'
import { auth, onAuthStateChanged, ADMIN_EMAIL } from './firebase'

// Navegación simple por hash (#zona/elite-a, #buscar) para que el botón Atrás del celular funcione
const leerRuta = () => {
  const h = decodeURIComponent(location.hash.slice(1))
  if (h.startsWith('zona/')) return { vista: 'zona', id: h.slice(5) }
  if (h === 'buscar') return { vista: 'buscar' }
  if (h === 'admin') return { vista: 'admin' }
  return { vista: 'home' }
}

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [ruta, setRuta] = useState(leerRuta)
  const [admin, setAdmin] = useState(false)
  const [pedirPin, setPedirPin] = useState(false)

  useEffect(() => onAuthStateChanged(auth, u => setAdmin(u?.email === ADMIN_EMAIL)), [])

  useEffect(() => {
    const on = () => { setRuta(leerRuta()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const ir = (h) => { location.hash = h }
  const volver = () => (history.length > 1 ? history.back() : ir(''))

  return (
    <div className="flex flex-col min-h-dvh text-white">
      <Fondo />
      <main className="flex-1 relative z-10 pb-24">
        {ruta.vista === 'home' && <Home abrirZona={id => ir('zona/' + id)} abrirBuscar={() => ir('buscar')} />}
        {ruta.vista === 'zona' && <Zona zonaId={ruta.id} volver={volver} />}
        {ruta.vista === 'buscar' && <Buscar volver={volver} />}
        {ruta.vista === 'admin' && (admin ? <Admin salir={() => ir('')} /> : <AdminBloqueado pedir={() => setPedirPin(true)} />)}
      </main>

      {needRefresh && (
        <div className="fixed top-3 left-3 right-3 z-50">
          <div className="max-w-md mx-auto bg-celeste text-noche rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
            <p className="text-sm font-bold">Nueva versión disponible</p>
            <button onClick={() => updateServiceWorker(true)} className="bg-noche text-white text-xs font-bold px-3 py-1.5 rounded-xl">Actualizar</button>
          </div>
        </div>
      )}
      {ruta.vista === 'home' && (
        <button
          onClick={() => (admin ? ir('admin') : setPedirPin(true))}
          className="fixed top-0 right-0 z-30 safe-top"
          aria-label="Administrador"
        >
          <span className={`m-3 w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur ${admin ? 'bg-celeste text-noche border-celeste' : 'bg-white/5 text-white/50 border-white/10'}`}>
            {admin ? <CandadoAbierto className="w-5 h-5" /> : <Candado className="w-5 h-5" />}
          </span>
        </button>
      )}
      {pedirPin && <PinModal cerrar={() => setPedirPin(false)} ok={() => { setPedirPin(false); ir('admin') }} />}
      <Instalar />
    </div>
  )
}

function AdminBloqueado({ pedir }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-32 gap-4 text-center">
      <Candado className="w-10 h-10 text-celeste" />
      <p className="text-white/60">Esta sección es solo para el administrador.</p>
      <button onClick={pedir} className="rounded-xl px-6 py-3 bg-celeste text-noche font-bold">Ingresar PIN</button>
    </div>
  )
}
