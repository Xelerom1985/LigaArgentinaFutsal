import { grupos } from '../data/zonas'
import { useClubes } from '../data/clubes'
import { Lupa, Flecha } from './Iconos'

export default function Home({ abrirZona, abrirBuscar, modo = 'ubicaciones', cambiarModo, abrirTabla }) {
  const tablas = modo === 'tablas'
  const clubes = useClubes()
  const cuantos = id => clubes.filter(c => c.zonaId === id).length
  return (
    <div className="flex flex-col items-center px-4 safe-top">
      {/* Logo de la liga — lo primero que se ve */}
      <div className="pt-8 pb-2 flex flex-col items-center float-in">
        <img src="./logo.png" alt="Liga Argentina de Futsal" className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-[0_10px_30px_rgba(116,169,221,0.35)]" />
        <h1 className="font-display text-4xl tracking-wide mt-3 text-center leading-none">Liga Argentina de Futsal</h1>
        <p className="text-celeste-light/70 text-sm mt-1">La liga de los clubes de barrio</p>
      </div>

      {/* Ubicaciones / Tablas */}
      <div className="mt-5 w-full max-w-md grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/[0.07] border border-white/10">
        {[['ubicaciones', 'Clubes y ubicaciones'], ['tablas', 'Tablas de posiciones']].map(([k, l]) => (
          <button key={k} onClick={() => cambiarModo(k)}
            className={`rounded-xl py-2.5 text-sm font-bold transition-colors ${modo === k ? 'bg-celeste text-noche' : 'text-white/60'}`}>{l}</button>
        ))}
      </div>

      {!tablas && <button
        onClick={abrirBuscar}
        className="mt-5 w-full max-w-md flex items-center gap-3 rounded-2xl px-4 py-3 bg-white/[0.07] border border-white/10 text-white/50 text-sm active:bg-white/10"
      >
        <Lupa className="w-5 h-5" /> Buscar un club…
      </button>}

      <div className="w-full max-w-md mt-6 flex flex-col gap-6 pb-6">
        {grupos.map((g, gi) => (
          <section key={g.id} className="float-in" style={{ animationDelay: `${gi * 60}ms` }}>
            <h2 className="font-display text-2xl tracking-wider mb-2 flex items-center gap-2" style={{ color: g.color }}>
              <span className="inline-block w-1.5 h-5 rounded-full" style={{ background: g.color }} />
              {g.nombre}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {g.zonas.map(z => (
                <button
                  key={z.id}
                  onClick={() => (tablas ? abrirTabla(z.id) : abrirZona(z.id))}
                  className="relative text-left rounded-2xl px-3.5 py-3 border border-white/10 active:scale-[0.97] transition-transform overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, rgba(20,48,90,0.95), rgba(11,31,58,0.95))' }}
                >
                  <span className="absolute inset-y-0 left-0 w-1" style={{ background: g.color }} />
                  <span className="block font-bold text-[15px] leading-tight">{z.nombre.replace(/^Diamante |^Femenino |^Baby /, '')}</span>
                  <span className="flex items-center justify-between mt-1 text-white/45 text-xs">
                    {tablas ? 'Ver tabla' : `${cuantos(z.id)} clubes`} <Flecha className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <p className="text-white/25 text-xs text-center">Desarrollada por: Fernando Flores</p>
      </div>
    </div>
  )
}
