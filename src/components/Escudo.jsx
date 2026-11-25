import { useClubes } from '../data/clubes'
import { escudoDe } from '../data/escudos'

// Busca el escudo del club en la base (o en el código como respaldo)
export function useEscudo() {
  const clubes = useClubes()
  return (nombre, zonaId) => {
    const c = clubes.find(x => x.nombre === nombre && x.zonaId === zonaId) || clubes.find(x => x.nombre === nombre && x.escudo)
    return c?.escudo || escudoDe(nombre, zonaId) || ''
  }
}

export default function Escudo({ src, nombre = '', className = 'w-12 h-12' }) {
  if (src) return <img src={src} alt="" loading="lazy" className={`${className} object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]`} />
  return (
    <div className={`${className} rounded-full flex items-center justify-center shrink-0 font-display text-lg bg-white/10 text-white/70`}>
      {nombre.replace(/^[^A-Z0-9ÁÉÍÓÚÑ]+/i, '').slice(0, 2).toUpperCase()}
    </div>
  )
}
