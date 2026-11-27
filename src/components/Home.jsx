import { grupos } from '../data/zonas'
import { useClubes } from '../data/clubes'
import { Lupa, Flecha } from './Iconos'
import { Escudo } from './ClubRow'
import { useDatosClub } from './MiClub'
import { useTorneos } from '../data/torneo'
import { useInstalacion } from '../data/instalacion'

export default function Home({ abrirZona, abrirBuscar, modo = 'ubicaciones', cambiarModo, abrirTabla, miKey, abrirMiClub, abrirInstalar }) {
  const tablas = modo === 'tablas'
  const { nombreActual } = useTorneos()
  const clubes = useClubes()
  const cuantos = id => clubes.filter(c => c.zonaId === id).length
  return (
    <div className="flex flex-col items-center px-4 safe-top">
      {/* Logo de la liga — lo primero que se ve */}
      <div className="pt-8 pb-2 flex flex-col items-center float-in">
        <img src="./logo.png" alt="Liga Argentina de Futsal" className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-[0_10px_30px_rgba(116,169,221,0.35)]" />
        <h1 className="font-display text-4xl tracking-wide mt-3 text-center leading-none">Liga Argentina de Futsal</h1>
        <p className="text-celeste-light/70 text-sm mt-1">La liga de los clubes de barrio</p>
        <span className="mt-3 rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest bg-amber-300 text-noche shadow-lg">{nombreActual}</span>
      </div>

      <TarjetaMiClub miKey={miKey} abrir={abrirMiClub} />

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
                  <span className="block font-bold text-[15px] leading-tight">{z.nombre.replace(/^Diamante /, '')}</span>
                  <span className="flex items-center justify-between mt-1 text-white/45 text-xs">
                    {tablas ? 'Ver tabla' : `${cuantos(z.id)} clubes`} <Flecha className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <BotonInstalar abrir={abrirInstalar} />
        <Redes />
        <p className="text-white/25 text-xs text-center">Desarrollada por: Fernando Flores</p>
      </div>
    </div>
  )
}

// "Cómo instalar la app" (o "Compartí la app" si ya está instalada)
function BotonInstalar({ abrir }) {
  const { instalada } = useInstalacion()
  return (
    <button onClick={abrir} className="mx-auto flex items-center gap-3 rounded-2xl border border-celeste/30 bg-celeste/[0.08] px-4 py-3 active:scale-[0.98] transition">
      <img src="./icons/icon-192.png" alt="" className="w-9 h-9 object-contain" />
      <span className="text-left">
        <span className="block text-sm font-bold">{instalada ? 'Compartí la app' : '¿Cómo instalar la app?'}</span>
        <span className="block text-[11px] text-white/50">{instalada ? 'QR y link para pasarla' : 'Android y iPhone, paso a paso'}</span>
      </span>
      <Flecha className="w-4 h-4 text-white/40" />
    </button>
  )
}

// Redes y mail oficiales de la Liga (abajo de todo, antes de "Desarrollada por")
const REDES = [
  { nombre: 'Facebook', href: 'https://www.facebook.com/LigaArgentinaFutbolSala', color: '#1877f2',
    icono: <path d="M14 8.5V6.8c0-.8.5-1 1-1h2V2.2L14.2 2C11.1 2 10.4 4.3 10.4 5.8v2.7H8v3.7h2.4V22H14v-9.8h2.8l.4-3.7H14Z" fill="currentColor" /> },
  { nombre: 'Instagram', href: 'https://www.instagram.com/ligaargentinadefutbolsala/', color: '#e1306c',
    icono: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" /></> },
  { nombre: 'Mail', href: 'mailto:oficial@ligaargentinadefutsal.com', color: '#74a9dd',
    icono: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></> },
]

function Redes() {
  return (
    <div className="flex justify-center gap-5 pt-2">
      {REDES.map(r => (
        <a key={r.nombre} href={r.href} target={r.nombre === 'Mail' ? undefined : '_blank'} rel="noopener noreferrer"
          aria-label={r.nombre} title={r.nombre}
          className="flex flex-col items-center gap-1 text-white/55 active:scale-95 transition">
          <span className="w-12 h-12 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center" style={{ color: r.color }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6">{r.icono}</svg>
          </span>
          <span className="text-[10px] uppercase tracking-wider">{r.nombre}</span>
        </a>
      ))}
    </div>
  )
}

// Acceso a "Mi club" (o invitación a elegirlo)
function TarjetaMiClub({ miKey, abrir }) {
  const { porZona } = useDatosClub(miKey || '__ninguno__')
  const d = porZona[0]
  if (!miKey || !d) return (
    <button onClick={abrir} className="mt-5 w-full max-w-md flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-amber-300/40 bg-amber-300/10 active:scale-[0.98] transition-transform">
      <span className="text-2xl text-amber-300">★</span>
      <span className="flex-1 text-left">
        <span className="block font-bold">Elegí tu club</span>
        <span className="block text-xs text-white/50">Tabla, estadísticas, partidos y ubicación</span>
      </span>
      <Flecha className="w-5 h-5 text-white/40" />
    </button>
  )
  return (
    <button onClick={abrir} className="mt-5 w-full max-w-md flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/10 active:scale-[0.98] transition-transform"
      style={{ background: 'linear-gradient(135deg, rgba(20,48,90,0.95), rgba(11,31,58,0.95))' }}>
      <Escudo club={d.club} size="w-12 h-12" />
      <span className="flex-1 text-left min-w-0">
        <span className="block text-[10px] uppercase tracking-widest text-amber-300 font-bold">★ Mi club</span>
        <span className="block font-display text-2xl leading-none tracking-wide truncate">{d.club.nombre}</span>
        <span className="block text-xs text-white/50 truncate">{d.zona?.nombre}{d.pos ? ` · ${d.pos}° con ${d.fila.pts} pts` : ''}</span>
      </span>
      <Flecha className="w-5 h-5 text-white/40" />
    </button>
  )
}
