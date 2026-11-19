// Zonas y clubes según https://ligaargentina2026.shop/tablas (noviembre 2026).
//
// UBICACIONES: completá `direcciones` con la dirección de cada sede
// (como en La Canilla). Si un club no tiene dirección cargada,
// la app busca "Club <nombre>" en Google Maps, centrado en la zona de la liga.

export const MAPA_LIGA_URL =
  'https://earth.app.goo.gl/?apn=com.google.earth&isi=293622097&ius=googleearth&link=https%3a%2f%2fearth.google.com%2fweb%2f%40-34.78562085,-58.4047286,21.44694186a,79125.32892587d,30y,0h,0t,0r%2fdata%3dCgRCAggBMikKJwolCiExLVlQVEMtSjlyeGVCeDdkbWNxbVdIQUU2QUNjMTVBSGogAUICCABKCAiJ64r7BRAB'

// Centro aproximado de la liga (Alte. Brown / zona sur del GBA)
export const CENTRO = { lat: -34.7856, lng: -58.4047 }

// Clave: nombre del club tal como figura abajo → dirección de la sede
export const direcciones = {
  // 'VILLA URQUIZÚ': 'Calle 123, Localidad',
}

export const grupos = [
  {
    id: 'elite', nombre: 'Elite', color: '#f5c542',
    zonas: [
      { id: 'elite-a', nombre: 'Elite A', clubes: ['VILLA URQUIZÚ', 'SOC. ITALIANA', 'PARQUE DEL REY', 'ITUZAINGO', 'ALVEAR', 'LOS CEIBOS', 'BELGRANO', 'OTAMENDI', 'ARGENTINOS DE AVELLANEDA', 'SPINOLA'] },
      { id: 'elite-b', nombre: 'Elite B', clubes: ['FORTALEZA', 'DEFE. SAN JOSÉ', 'LA MORITA', 'PIEDRABUENA', 'ZONA ESTE', 'LA PERLA TEMP.', 'RAMONA DÍAZ', 'INTER LONGCHAMPS', 'ROSEDAL', 'SOCIAL LAS HERAS'] },
    ],
  },
  {
    id: 'premier', nombre: 'Premier', color: '#74a9dd',
    zonas: [
      { id: 'premier-a', nombre: 'Premier A', clubes: ['VILLA ELVIRA', 'BARRIO ENZ', '25 DE MAYO', 'JUVENIL', 'PARQUE 2000', 'ALBERDI', 'JUV. OBRERA', 'MONTE GRANDE FUTSAL'] },
      { id: 'premier-b', nombre: 'Premier B', clubes: ['MARMOL KING', 'ESTRELLA FEDERAL', 'CAGLIARI', 'ALMAFUERTE SAN JOSÉ', 'MARTÍN ARÍN', 'EL FOGÓN', 'LA PERLA CLAYPOLE', 'OLIMPIA'] },
      { id: 'premier-ascenso-a', nombre: 'Premier Ascenso A', clubes: ['ALMAFUERTE TEMP.', '9 DE JULIO SAN JOSÉ', 'ESTRELLA DEL SUR', 'MARMOL NORTE', 'COLUMBIA', 'CULTURAL MARMOL', 'EL FORTÍN DE RIVAROLA'] },
      { id: 'premier-ascenso-b', nombre: 'Premier Ascenso B', clubes: ['BARRIO ENZ', 'PROGRESO DE ADROGUÉ', 'DOMINGO RODRIGUEZ', 'GRAL. SAN MARTÍN', 'BROWN VIEJO', 'VILLA RECREO', 'ALUMNI'] },
    ],
  },
  {
    id: 'diamante', nombre: 'Diamante', color: '#5ee0e6',
    zonas: [
      { id: 'sudeste-a', nombre: 'Diamante Sudeste A', clubes: ['CABAÑAS SAN JOSÉ', 'UNIÓN VECINAL', '7 DE AGOSTO', 'PESCADORES', 'BOUCHARD MARMOL', 'SAN CRISTOBAL', 'UNIÓN DE CALZADA', '20 DE FEBRERO', 'EL TALADRO', 'INTEGRACIÓN', 'VERDADERO CALZADA', 'SAN JAVIER'] },
      { id: 'sudeste-b1', nombre: 'Diamante Sudeste B1', clubes: ['LAS FLORES', 'GAMBETA', 'ALMAFUTSAL', 'JUVENTUD PAMPAS', 'GASOLERO', 'GRAL. LAVALLE', 'S.F GENDARMERIA', 'SANTA MARÍA'] },
      { id: 'sudeste-b2', nombre: 'Diamante Sudeste B2', clubes: ['SCHULZ FUTSAL', 'ALMAFUERTE BURZACO', 'ESTRELLA ARGENTINA', 'ARZENO', 'CLUB MALVINAS', 'EL PORTO FUTSAL', 'LOS HALCONES', 'PUEYRREDON'] },
      { id: 'sudoeste-a1', nombre: 'Diamante Sudoeste A1', clubes: ['BUJÍA', 'CLARIDAD', 'ELEVACIÓN', 'U.V.V ARGERICH', '9 DE JULIO LANÚS', 'BRISAS DE PRIMAVERA', '9 DE JULIO V. ALSINA', 'INMIGRANTES DEL SUD', 'ARGENTINO'] },
      { id: 'sudoeste-a2', nombre: 'Diamante Sudoeste A2', clubes: ['LA LOMA', 'MARPLATENSE', '16 DE AGOSTO', 'PRIMERO DE MAYO', 'SAN MARTIN CARAZA', 'LOS PIEDRAS', 'JUVENTUD UNIDA', 'LA NUEVA UNION', 'UNION PROGRESISTA'] },
      { id: 'sudoeste-b1', nombre: 'Diamante Sudoeste B1', clubes: ['CHINGOLO FUTSAL', 'VILLA BARCELÓ', 'LA AMISTAD IND.', 'LIBERTAD', '6 DE MARZO', 'EL GAUCHITO', 'EL FORTÍN'] },
      { id: 'sudoeste-b2', nombre: 'Diamante Sudoeste B2', clubes: ['EL PAREDÓN', 'LA SALITA', 'ALUMNI', 'JUNCAL FC', 'NUEVA ROMA', 'BESADA FUTSAL', 'VILLA INDEPENDENCIA'] },
    ],
  },
  {
    id: 'copas', nombre: 'Copas', color: '#f0a35e',
    zonas: [
      { id: 'copa-oro', nombre: 'Copa de Oro', clubes: ['GUERNICA', '2 DE ENERO', '21 DE SEPTIEMBRE', 'DON ORIONE', 'SAMPDORIA', 'GUEMES', 'UNIDOS DE MARMOL', 'MALVINAS', 'L.P.D. BOUCHARD', 'CLUB FRAGATA', 'LOS MONCHOS', 'STUDS'] },
      { id: 'copa-plata', nombre: 'Copa de Plata', clubes: ['EL CICLÓN', 'MISTER CLUB', 'EL CIRCULO', 'LA 50', 'FIGUEROA', 'DEP. GONZALEZ', 'LOMAS DE BURZACO', 'EL CENTRO', 'SAN MARTIN', 'BAJO MARMOL', 'EL PAMPO', 'JUNIOR FUTSAL'] },
    ],
  },
  {
    id: 'baby', nombre: 'Baby · Cat. 2013', color: '#8fe08a',
    zonas: [
      { id: 'baby-1', nombre: 'Baby Zona 1', clubes: ['ITUZAINGO', 'LA FAROLA', 'SAN JOSE SUR', 'LA PERLA CLAYPOLE', 'LOMAS DE BURZACO', 'CICLON DE BURZACO', 'ALVEAR', 'LOS AMIGOS'] },
      { id: 'baby-2', nombre: 'Baby Zona 2', clubes: ['BARRIO ENZ', 'SOCIAL LAS HERAS', 'SIN FRONTERAS', 'JUVENTUD PAMPAS', 'GUEMES RACING', '20 DE FEBRERO', 'EL CENTRO FUTSAL'] },
    ],
  },
  {
    id: 'femenino', nombre: 'Femenino · 8va', color: '#f08bc0',
    zonas: [
      { id: 'fem-lanus', nombre: 'Femenino Lanús', clubes: ['SOC. LAS HERAS', 'LOS CEIBOS', 'SPORTIVO CAMPOS', 'MANUEL BELGRANO', 'CLARIDAD', 'ELEVACION', 'COLUMBIA', 'MARPLATENSE', 'FOMENTO DE ESCALADA'] },
      { id: 'fem-1', nombre: 'Femenino Zona 1', clubes: ['SCHULZ FUTSAL', 'INTER LONGCHAMPS', 'CULTURAL GUERNICA', 'BARRIO ENZ', 'ARZENO', 'ALMAFUERTE BURZACO', 'EL PORTO', 'ALTO VERDE', 'EL CIRCULO', 'FORTALEZA'] },
      { id: 'fem-2', nombre: 'Femenino Zona 2', clubes: ['DEFENSORES DE SJ', 'ESTRELLA FEDERAL', 'BOUCHARD', '16 DE MAYO', 'LA PERLA TEMPERLEY', 'LOMAS FUTBOL', 'LA PERLA CLAYPOLE', 'EL CENTRO FUTSAL', 'UNION VECINAL', 'CICLON DE BURZACO', 'ATENEO PARROQUIAL'] },
    ],
  },
]

export const todasLasZonas = grupos.flatMap(g => g.zonas.map(z => ({ ...z, grupo: g })))

// club: { nombre, ubicacion } — ubicacion puede ser un link de Google Maps o una dirección
export function mapsUrl(club) {
  const u = (club.ubicacion || '').trim()
  if (/^https?:\/\//i.test(u)) return u
  if (u) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u + ', Buenos Aires, Argentina')}`
  const q = encodeURIComponent(`Club ${club.nombre} futsal`)
  return `https://www.google.com/maps/search/${q}/@${CENTRO.lat},${CENTRO.lng},12z`
}

// Normaliza para buscar sin acentos ni mayúsculas
export const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
