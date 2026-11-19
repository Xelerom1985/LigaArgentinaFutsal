import { mapsUrl } from '../data/zonas'
import { Pin } from './Iconos'

export function Escudo({ club, color = '#74a9dd', size = 'w-11 h-11' }) {
  if (club.escudo) return <img src={club.escudo} alt="" loading="lazy" className={`${size} object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]`} />
  return (
    <div className={`${size} rounded-full flex items-center justify-center shrink-0 font-display text-lg`}
      style={{ background: `${color}22`, color }}>
      {club.nombre.replace(/^[^A-Z0-9ÁÉÍÓÚÑ]+/i, '').slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function ClubRow({ club, extra, color = '#74a9dd' }) {
  const u = (club.ubicacion || '').trim()
  const sub = extra || (u && !/^https?:/i.test(u) ? u : 'Ver ubicación en Google Maps')
  return (
    <a
      href={mapsUrl(club)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors"
    >
      <Escudo club={club} color={color} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{club.nombre}</p>
        <p className="text-white/40 text-xs mt-0.5 truncate">{sub}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1.5 shrink-0"
        style={{ background: `${color}26`, color }}>
        <Pin className="w-4 h-4" /> Cómo llegar
      </span>
    </a>
  )
}
