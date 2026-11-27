import { useEffect, useState } from 'react'
import { Compartir, Cruz } from './Iconos'
import { useInstalacion, esIOS } from '../data/instalacion'

// Cartel de instalación abajo (igual que La Pulga) + acceso a la página "Cómo instalar"
export default function Instalar({ verComo }) {
  const inst = useInstalacion()
  const [ios] = useState(esIOS)
  const [descartado, setDescartado] = useState(() => {
    try { return Date.now() - Number(localStorage.getItem('laf_install_dismiss') || 0) < 3 * 864e5 } catch { return false }
  })
  const [listoIos, setListoIos] = useState(false)
  useEffect(() => { if (ios) { const t = setTimeout(() => setListoIos(true), 1200); return () => clearTimeout(t) } }, [ios])

  const cerrar = () => { setDescartado(true); try { localStorage.setItem('laf_install_dismiss', String(Date.now())) } catch {} }

  const visible = !inst.instalada && !descartado && (ios ? listoIos : inst.puede)
  if (!visible) return null
  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 safe-bottom">
      <div className="max-w-md mx-auto rounded-2xl px-4 py-3 shadow-2xl border border-celeste/30"
        style={{ background: 'rgba(6,20,42,0.97)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <img src="./icons/icon-192.png" alt="" className="w-10 h-10 object-contain" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">Instalar Liga Futsal</p>
            <p className="text-white/50 text-xs">{ios ? 'Agregala a tu pantalla de inicio' : 'Abrila como app, sin navegador'}</p>
          </div>
          {!ios ? (
            <>
              <button onClick={cerrar} className="text-white/40 text-xs px-2 py-1.5">Ahora no</button>
              <button onClick={() => inst.instalar()}
                className="bg-celeste text-noche text-xs font-bold px-3 py-2 rounded-xl active:opacity-80">Instalar</button>
            </>
          ) : (
            <button onClick={cerrar} className="text-white/40 p-1" aria-label="Cerrar"><Cruz className="w-5 h-5" /></button>
          )}
        </div>
        {ios && (
          <p className="text-white/70 text-xs mt-2.5 leading-relaxed">
            En Safari tocá <Compartir className="inline w-4 h-4 -mt-1 text-celeste" /> <b>Compartir</b> y después <b>“Agregar a inicio”</b>.{' '}
            <button onClick={verComo} className="text-celeste underline font-bold">Ver cómo</button>
          </p>
        )}
      </div>
    </div>
  )
}
