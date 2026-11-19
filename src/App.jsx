import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Fondo from './components/Fondo'
import Home from './components/Home'
import Zona from './components/Zona'
import Buscar from './components/Buscar'
import Instalar from './components/Instalar'

// Navegación simple por hash (#zona/elite-a, #buscar) para que el botón Atrás del celular funcione
const leerRuta = () => {
  const h = decodeURIComponent(location.hash.slice(1))
  if (h.startsWith('zona/')) return { vista: 'zona', id: h.slice(5) }
  if (h === 'buscar') return { vista: 'buscar' }
  return { vista: 'home' }
}

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [ruta, setRuta] = useState(leerRuta)

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
      </main>

      {needRefresh && (
        <div className="fixed top-3 left-3 right-3 z-50">
          <div className="max-w-md mx-auto bg-celeste text-noche rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
            <p className="text-sm font-bold">Nueva versión disponible</p>
            <button onClick={() => updateServiceWorker(true)} className="bg-noche text-white text-xs font-bold px-3 py-1.5 rounded-xl">Actualizar</button>
          </div>
        </div>
      )}
      <Instalar />
    </div>
  )
}
