import { useState } from 'react'
import ListaPartidos from '../components/ListaPartidos'
import Arbitros from './Arbitros'
import Planillas from './Planillas'
import TorneoAdmin from './TorneoAdmin'
import Logo from '../components/Logo'
import { Mas, Salir } from '../components/Iconos'
import { salir } from '../firebase'

export default function Admin({ partidos, arbitros, abrir, nuevo, abrirClubes, inicio }) {
  const [tab, setTab] = useState(() => sessionStorage.getItem('laa_tab') || 'partidos')
  const cambiar = t => { setTab(t); try { sessionStorage.setItem('laa_tab', t) } catch {} }
  return (
    <div className="px-4 safe-top pb-28 max-w-md mx-auto">
      <div className="flex items-center gap-3 pt-3">
        <button onClick={inicio} aria-label="Inicio"><Logo size={46} /></button>
        <div className="flex-1">
          <p className="font-display text-2xl leading-none tracking-wide">Administrador</p>
          <p className="text-xs text-amber-300/80">Liga Argentina de Futsal</p>
        </div>
        <button onClick={salir} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60" aria-label="Salir"><Salir className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white/[0.06] mt-4 mb-4">
        {[['partidos', 'Partidos', partidos.length], ['arbitros', 'Árbitros', arbitros.length], ['planillas', 'Planillas'], ['clubes', 'Clubes']].map(([k, l, n]) => (
          <button key={k} onClick={() => cambiar(k)} className={`rounded-xl py-2 text-[13px] font-bold leading-tight ${tab === k ? 'bg-amber-300 text-noche' : 'text-white/60'}`}>
            {l}{n != null && <span className="block text-[10px] font-semibold opacity-70">{n}</span>}
          </button>
        ))}
      </div>

      {tab === 'partidos' && <TorneoAdmin partidos={partidos} />}
      {tab === 'partidos' && <ListaPartidos partidos={partidos} abrir={abrir} mostrarArbitro vacio="No hay partidos asignados. Tocá + para asignar el primero." />}
      {tab === 'arbitros' && <Arbitros arbitros={arbitros} partidos={partidos} />}
      {tab === 'planillas' && <Planillas partidos={partidos} />}
      {tab === 'clubes' && (
        <div className="flex flex-col gap-3">
          <p className="text-white/55 text-sm">Agregar, editar o borrar clubes, escudos y ubicaciones (lo que se ve en "Clubes y ubicaciones").</p>
          <button onClick={abrirClubes} className="rounded-2xl py-3.5 bg-celeste text-noche font-bold">Editar clubes y escudos</button>
        </div>
      )}

      {tab === 'partidos' && (
        <button onClick={nuevo} aria-label="Asignar partido"
          className="fixed bottom-6 right-5 z-20 h-14 pl-4 pr-5 rounded-full flex items-center gap-2 font-bold text-white shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#c90f1c,#7a0016)' }}>
          <Mas className="w-6 h-6" /> Asignar
        </button>
      )}
    </div>
  )
}
