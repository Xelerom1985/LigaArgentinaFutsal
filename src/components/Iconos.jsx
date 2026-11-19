const base = { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Pin = (p) => <svg {...base} {...p}><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
export const Atras = (p) => <svg {...base} {...p}><path d="M15 19l-7-7 7-7" /></svg>
export const Lupa = (p) => <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
export const Cruz = (p) => <svg {...base} {...p}><path d="M6 18L18 6M6 6l12 12" /></svg>
export const Flecha = (p) => <svg {...base} {...p}><path d="M9 5l7 7-7 7" /></svg>
export const Mapa = (p) => <svg {...base} {...p}><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
export const Compartir = (p) => <svg {...base} {...p}><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></svg>
