import { direcciones, mapsUrl } from '../data/zonas'
import { Pin } from './Iconos'

export default function ClubRow({ club, extra, color = '#74a9dd' }) {
  const dir = direcciones[club]
  return (
    <a
      href={mapsUrl(club)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display text-lg"
        style={{ background: `${color}22`, color }}>
        {club.replace(/^[^A-Z0-9ÁÉÍÓÚÑ]+/, '').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{club}</p>
        <p className="text-white/40 text-xs mt-0.5 truncate">{extra || dir || 'Ver ubicación en Google Maps'}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1.5 shrink-0"
        style={{ background: `${color}26`, color }}>
        <Pin className="w-4 h-4" /> Cómo llegar
      </span>
    </a>
  )
}
