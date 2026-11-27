import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Atras, Check, Compartir, Mas } from './Iconos'
import { useInstalacion, esIOS, esAndroid, navegadorInterno, esSafari, URL_APP } from '../data/instalacion'
import { contarAccion } from '../data/metricas'

const LINK = URL_APP.replace('https://', '')

// Página "Cómo instalar la app": pasos con dibujitos para Android e iPhone + QR y link para compartir
export default function ComoInstalar({ volver }) {
  const inst = useInstalacion()
  const [so, setSo] = useState(esIOS() ? 'iphone' : 'android')
  const [msg, setMsg] = useState('')
  const interno = navegadorInterno()

  const instalarYa = async () => { if (await inst.instalar()) setMsg('¡Listo! Ya está en tu pantalla de inicio.') }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 safe-top" style={{ background: 'rgba(6,20,42,0.92)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-2 px-2 py-3 max-w-md mx-auto">
          <button onClick={volver} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" aria-label="Volver">
            <Atras className="w-6 h-6" />
          </button>
          <p className="font-display text-2xl tracking-wide">Cómo instalar la app</p>
        </div>
      </header>

      <div className="px-4 max-w-md mx-auto w-full flex flex-col gap-5 pb-10">
        {/* Presentación */}
        <div className="flex items-center gap-4 pt-2">
          <img src="./icons/icon-192.png" alt="" className="w-16 h-16 rounded-2xl bg-noche-dark border border-white/10 object-contain p-1" />
          <div>
            <p className="font-display text-2xl leading-none tracking-wide">Liga Argentina de Futsal</p>
            <p className="text-xs text-white/55 mt-1">Gratis · ocupa menos de 3 MB · se actualiza sola</p>
          </div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed -mt-1">
          Instalala y te queda el ícono en el celular, como cualquier app: abre a pantalla completa y más rápido. No hace falta ir a Play Store ni App Store.
        </p>

        {inst.instalada ? (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 flex items-center gap-3">
            <Check className="w-6 h-6 text-emerald-300 shrink-0" />
            <p className="text-sm"><b>Ya la tenés instalada.</b> <span className="text-white/60">Abajo podés compartirla con otros.</span></p>
          </div>
        ) : inst.puede ? (
          <button onClick={instalarYa} className="rounded-2xl bg-celeste text-noche font-bold py-4 text-base active:scale-[0.98] transition shadow-lg shadow-celeste/20">
            Instalar ahora
          </button>
        ) : null}
        {msg && <p className="text-sm text-emerald-300 -mt-2">{msg}</p>}

        {interno && !inst.instalada && (
          <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm leading-relaxed">
            <b className="text-amber-200">La abriste desde Instagram, Facebook o WhatsApp.</b>{' '}
            Desde ahí no se puede instalar: tocá los <b>tres puntitos</b> (arriba a la derecha) y elegí <b>“Abrir en {esIOS() ? 'Safari' : 'Chrome'}”</b> o <b>“Abrir en el navegador”</b>.
          </div>
        )}

        {/* Elegir celular */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/[0.06] border border-white/10">
          {[['android', 'Android'], ['iphone', 'iPhone']].map(([id, txt]) => (
            <button key={id} onClick={() => setSo(id)}
              className={`py-2.5 rounded-xl text-sm font-bold transition ${so === id ? 'bg-celeste text-noche' : 'text-white/60'}`}>{txt}</button>
          ))}
        </div>

        {so === 'android' ? <PasosAndroid /> : <PasosIphone safari={esSafari()} />}

        <CompartirApp />
      </div>
    </div>
  )
}

function Paso({ n, titulo, children, dibujo }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-celeste text-noche font-bold text-sm flex items-center justify-center shrink-0">{n}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] leading-snug">{titulo}</p>
          {children && <p className="text-xs text-white/55 mt-1 leading-relaxed">{children}</p>}
        </div>
      </div>
      {dibujo && <div className="rounded-xl bg-noche-dark border border-white/10 overflow-hidden">{dibujo}</div>}
    </div>
  )
}

// ——— Dibujitos simples del celular (no son capturas: sirven para ubicar dónde tocar) ———
const Toque = ({ className = '' }) => (
  <span className={`absolute w-9 h-9 rounded-full border-2 border-amber-300 bg-amber-300/20 animate-pulse pointer-events-none ${className}`} />
)
const BarraChrome = () => (
  <div className="relative flex items-center gap-2 px-3 py-2.5 bg-white/[0.08]">
    <div className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/70 truncate">{LINK}</div>
    <span className="text-white/80 text-lg leading-none font-bold w-6 text-center">⋮</span>
    <Toque className="right-0.5 top-0.5" />
  </div>
)
const Menu = ({ items, marcado }) => (
  <div className="relative ml-auto w-56 m-2 rounded-xl bg-[#1d2b44] border border-white/10 py-1 shadow-xl">
    {items.map((t, i) => (
      <div key={t} className={`relative px-3 py-2 text-[12px] flex items-center gap-2 ${i === marcado ? 'text-white font-bold bg-white/[0.06]' : 'text-white/45'}`}>
        {t}
        {i === marcado && <Toque className="-right-1 -top-0.5" />}
      </div>
    ))}
  </div>
)
const Dialogo = ({ titulo, boton }) => (
  <div className="p-4 flex justify-center">
    <div className="relative w-60 rounded-2xl bg-[#1d2b44] border border-white/10 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <img src="./icons/icon-192.png" alt="" className="w-9 h-9 object-contain" />
        <div><p className="text-[13px] font-bold">{titulo}</p><p className="text-[10px] text-white/45">{LINK}</p></div>
      </div>
      <div className="flex justify-end gap-4 text-[12px]">
        <span className="text-white/45">Cancelar</span>
        <span className="relative text-celeste font-bold">{boton}<Toque className="-left-2.5 -top-2.5" /></span>
      </div>
    </div>
  </div>
)
const Inicio = () => (
  <div className="p-4 grid grid-cols-4 gap-3 justify-items-center">
    {[0, 1, 2].map(i => <span key={i} className="w-11 h-11 rounded-2xl bg-white/10" />)}
    <div className="flex flex-col items-center gap-1">
      <img src="./icons/icon-192.png" alt="" className="w-11 h-11 rounded-2xl bg-noche border border-celeste/50 object-contain p-0.5" />
      <span className="text-[9px] text-white/80">Liga Futsal</span>
    </div>
  </div>
)

function PasosAndroid() {
  return (
    <div className="flex flex-col gap-3">
      <Paso n={1} titulo="Abrí la app en Chrome">
        Entrá a <b className="text-celeste">{LINK}</b> (o escaneá el QR de abajo). Si te aparece el cartel “Instalar”, tocalo y listo.
      </Paso>
      <Paso n={2} titulo="Tocá los tres puntitos ⋮ arriba a la derecha" dibujo={<BarraChrome />} />
      <Paso n={3} titulo="Elegí “Instalar app”" dibujo={<Menu items={['Nueva pestaña', 'Historial', 'Compartir…', 'Instalar app', 'Configuración']} marcado={3} />}>
        En algunos celulares dice <b>“Agregar a la pantalla principal”</b>.
      </Paso>
      <Paso n={4} titulo="Confirmá con “Instalar”" dibujo={<Dialogo titulo="¿Instalar la app?" boton="Instalar" />} />
      <Paso n={5} titulo="¡Listo! Buscá el ícono en tu celular" dibujo={<Inicio />} />
    </div>
  )
}

const BarraSafari = () => (
  <div className="relative">
    <div className="px-3 pt-2.5"><div className="rounded-xl bg-white/10 px-3 py-1.5 text-[11px] text-white/70 text-center truncate">{LINK}</div></div>
    <div className="flex items-center justify-around px-3 py-3 text-white/50 text-lg">
      <span>‹</span><span>›</span>
      <span className="relative text-celeste"><Compartir className="w-6 h-6" /><Toque className="-left-1.5 -top-1.5" /></span>
      <span className="text-sm">▢▢</span><span className="text-sm">☰</span>
    </div>
  </div>
)
const HojaCompartir = () => (
  <div className="m-2 rounded-xl bg-[#1d2b44] border border-white/10 py-1">
    {['Copiar', 'Agregar a la lista de lectura', 'Agregar a favoritos'].map(t => (
      <div key={t} className="px-3 py-2 text-[12px] text-white/45 border-b border-white/5">{t}</div>
    ))}
    <div className="relative px-3 py-2 text-[12px] font-bold flex items-center justify-between bg-white/[0.06]">
      Agregar a inicio <Mas className="w-4 h-4 border border-white/40 rounded" />
      <Toque className="right-0 -top-0.5" />
    </div>
  </div>
)
const AgregarIOS = () => (
  <div className="p-3">
    <div className="flex items-center justify-between text-[12px] pb-3 border-b border-white/10">
      <span className="text-celeste">Cancelar</span>
      <span className="font-bold">Agregar a inicio</span>
      <span className="relative text-celeste font-bold">Agregar<Toque className="-left-2 -top-2.5" /></span>
    </div>
    <div className="flex items-center gap-3 pt-3">
      <img src="./icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl bg-noche border border-white/10 object-contain p-0.5" />
      <div className="text-[12px]"><p className="font-bold">Liga Futsal</p><p className="text-white/45">{LINK}</p></div>
    </div>
  </div>
)

function PasosIphone({ safari }) {
  return (
    <div className="flex flex-col gap-3">
      <Paso n={1} titulo="Abrí la app en Safari">
        Entrá a <b className="text-celeste">{LINK}</b> (o escaneá el QR con la cámara).{!safari && <> Si estás en otro navegador, copiá el link y pegalo en <b>Safari</b>.</>}
      </Paso>
      <Paso n={2} titulo="Tocá el botón Compartir (el cuadrado con la flecha)" dibujo={<BarraSafari />}>
        Está abajo en el medio. En iPad, arriba a la derecha.
      </Paso>
      <Paso n={3} titulo="Bajá y tocá “Agregar a inicio”" dibujo={<HojaCompartir />}>
        Si no aparece, deslizá la lista hacia arriba hasta el final.
      </Paso>
      <Paso n={4} titulo="Tocá “Agregar” arriba a la derecha" dibujo={<AgregarIOS />} />
      <Paso n={5} titulo="¡Listo! Buscá el ícono en tu celular" dibujo={<Inicio />} />
    </div>
  )
}

// ——— Compartir: QR, link, cartel para imprimir ———
function CompartirApp() {
  const [qr, setQr] = useState('')
  const [copiado, setCopiado] = useState(false)
  useEffect(() => {
    QRCode.toDataURL(URL_APP, { width: 480, margin: 1, color: { dark: '#0b1f3a', light: '#ffffff' } }).then(setQr).catch(() => {})
  }, [])

  const copiar = async () => {
    try { await navigator.clipboard.writeText(URL_APP); setCopiado(true); setTimeout(() => setCopiado(false), 2000) } catch {}
  }
  const compartir = async () => {
    contarAccion('compartio')
    if (navigator.share) {
      try { await navigator.share({ title: 'Liga Argentina de Futsal', text: 'Instalá la app de la Liga Argentina de Futsal: clubes, ubicaciones y tablas.', url: URL_APP }) } catch {}
    } else copiar()
  }

  return (
    <section className="flex flex-col gap-3 pt-2">
      <p className="font-display text-xl tracking-wider text-amber-300">Compartila</p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 flex flex-col items-center gap-3">
        {qr ? <img src={qr} alt="QR de la app" className="w-48 h-48 rounded-xl bg-white p-2" /> : <div className="w-48 h-48 rounded-xl bg-white/10" />}
        <p className="text-xs text-white/55 text-center">Apuntá la cámara del celular al código</p>
        <p className="text-sm font-bold text-celeste">{LINK}</p>
        <div className="grid grid-cols-2 gap-2 w-full">
          <button onClick={compartir} className="rounded-xl py-2.5 bg-celeste text-noche text-sm font-bold">Compartir</button>
          <button onClick={copiar} className="rounded-xl py-2.5 bg-white/10 text-sm font-bold">{copiado ? '¡Copiado!' : 'Copiar link'}</button>
        </div>
        <button onClick={() => bajarCartel()} className="text-xs text-white/55 underline pt-1">Bajar cartel con QR para imprimir</button>
      </div>
    </section>
  )
}

// Cartel A4 vertical (PNG) con logo, título, QR y link: para pegar en las canchas o subir a Instagram
async function bajarCartel() {
  const W = 1240, H = 1754
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#14305a'); g.addColorStop(1, '#06142a')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  const img = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src })
  try { await document.fonts?.ready } catch {}
  const logo = await img('./icons/icon-512.png')
  if (logo) x.drawImage(logo, W / 2 - 170, 110, 340, 340)
  x.textAlign = 'center'; x.fillStyle = '#ffffff'
  x.font = 'bold 92px "Bebas Neue", Impact, sans-serif'; x.fillText('LIGA ARGENTINA DE FUTSAL', W / 2, 560)
  x.fillStyle = '#74a9dd'; x.font = 'bold 64px "Bebas Neue", Impact, sans-serif'; x.fillText('DESCARGÁ LA APP', W / 2, 650)
  const qr = await img(await QRCode.toDataURL(URL_APP, { width: 720, margin: 2, color: { dark: '#0b1f3a', light: '#ffffff' } }))
  x.fillStyle = '#ffffff'
  const q = 720, qx = (W - q) / 2, qy = 720
  x.beginPath(); x.roundRect ? x.roundRect(qx - 20, qy - 20, q + 40, q + 40, 36) : x.rect(qx - 20, qy - 20, q + 40, q + 40); x.fill()
  if (qr) x.drawImage(qr, qx, qy, q, q)
  x.fillStyle = '#ffffff'; x.font = '600 44px Inter, Arial, sans-serif'
  x.fillText('Escaneá el código con la cámara del celular', W / 2, 1560)
  x.fillStyle = '#74a9dd'; x.font = 'bold 50px Inter, Arial, sans-serif'; x.fillText(LINK, W / 2, 1640)
  x.fillStyle = 'rgba(255,255,255,0.45)'; x.font = '32px Inter, Arial, sans-serif'
  x.fillText('Clubes · Ubicaciones · Tablas de posiciones', W / 2, 1700)
  const a = document.createElement('a'); a.download = 'Liga-Argentina-Futsal-QR.png'; a.href = c.toDataURL('image/png'); a.click()
}
