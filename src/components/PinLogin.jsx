import { useState } from 'react'
import Logo from './Logo'
import { entrarArbitro, entrarAdmin, mensajeError } from '../firebase'
import { Atras } from './Iconos'

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export default function Login({ error: errorExterno, volver, tipo = 'arbitro' }) {
  const esAdmin = tipo === 'admin'
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const msg = error || errorExterno

  const entrar = async p => {
    setCargando(true); setError('')
    try { await (esAdmin ? entrarAdmin(p) : entrarArbitro(p)) } catch (e) { setError(mensajeError(e)); setPin('') } finally { setCargando(false) }
  }
  const tecla = t => {
    if (cargando) return
    if (t === '⌫') return setPin(p => p.slice(0, -1))
    const max = esAdmin ? 12 : 4
    if (!t || pin.length >= max) return
    const p = pin + t
    setPin(p); setError('')
    if (!esAdmin && p.length === 4) entrar(p) // árbitros: 4 números y entra solo
  }

  return (
    <div className="flex flex-col items-center px-6 safe-top min-h-dvh relative">
      {volver && <button onClick={volver} className="absolute left-2 top-3 w-10 h-10 flex items-center justify-center text-white/70" aria-label="Volver"><Atras className="w-6 h-6" /></button>}
      <div className="pt-8 flex flex-col items-center float-in">
        <Logo size={170} />
        <h1 className="font-display text-4xl tracking-wide mt-2 text-center leading-none">Liga Argentina</h1>
        <p className={`font-display text-2xl tracking-[0.25em] leading-none mt-1 ${esAdmin ? 'text-celeste' : 'text-amber-300'}`}>{esAdmin ? 'ADMINISTRADOR' : 'ÁRBITROS'}</p>
      </div>

      <p className="text-white/60 text-sm mt-7">Ingresá tu PIN</p>
      <div className={`flex gap-4 mt-3 ${msg ? 'animate-[shake_.3s]' : ''}`}>
        {[...Array(esAdmin ? Math.max(4, pin.length) : 4).keys()].map(i => (
          <span key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${i < pin.length ? 'bg-amber-300 border-amber-300' : 'border-white/30'}`} />
        ))}
      </div>
      <p className="text-red-400 text-sm h-5 mt-3">{cargando ? <span className="text-white/50">Entrando…</span> : msg}</p>

      <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-[280px]">
        {TECLAS.map((t, i) => t ? (
          <button key={i} onClick={() => tecla(t)}
            className="h-16 rounded-2xl bg-white/[0.07] border border-white/10 text-2xl font-semibold active:bg-white/20 active:scale-95 transition">
            {t}
          </button>
        ) : esAdmin ? (
          <button key={i} onClick={() => pin.length >= 4 && !cargando && entrar(pin)} disabled={pin.length < 4 || cargando}
            className="h-16 rounded-2xl bg-celeste text-noche text-base font-bold active:scale-95 transition disabled:opacity-30">Entrar</button>
        ) : <span key={i} />)}
      </div>
      <p className="text-white/25 text-xs text-center mt-auto pt-8 pb-6">{esAdmin ? 'Solo para la organización de la Liga' : 'PIN personal e intransferible'} · Desarrollada por: Fernando Flores</p>
    </div>
  )
}
