import { useEffect, useState } from 'react'
import Logo from './Logo'
import { Huella } from './Iconos'
import { huellaDisponible, huellaActiva, huellaRechazada, rechazarHuella, activarHuella, desactivarHuella, verificarHuella } from '../data/huella'

// Pantalla de bloqueo: pide la huella para abrir el panel (o volver a entrar con PIN)
export function BloqueoHuella({ uid, titulo, ok, usarPin, volver }) {
  const [error, setError] = useState('')
  const [pidiendo, setPidiendo] = useState(false)
  const pedir = async () => {
    setPidiendo(true); setError('')
    try { if (await verificarHuella(uid)) ok(); else setError('No se pudo verificar') }
    catch (e) { setError(e?.name === 'NotAllowedError' ? 'Cancelado. Probá de nuevo o entrá con PIN.' : 'La huella no está disponible. Entrá con PIN.') }
    finally { setPidiendo(false) }
  }
  useEffect(() => { pedir() }, []) // eslint-disable-line
  return (
    <div className="flex flex-col items-center px-6 safe-top min-h-dvh pt-10 text-center">
      <Logo size={130} />
      <p className="font-display text-3xl tracking-wide mt-3">{titulo}</p>
      <button onClick={pedir} disabled={pidiendo}
        className="mt-8 w-28 h-28 rounded-full bg-celeste/15 border-2 border-celeste/60 text-celeste flex items-center justify-center active:scale-95 transition disabled:opacity-60">
        <Huella className="w-14 h-14" />
      </button>
      <p className="text-white/60 text-sm mt-4">{pidiendo ? 'Esperando la huella…' : 'Tocá para entrar con tu huella'}</p>
      <p className="text-red-400 text-sm h-5 mt-2">{error}</p>
      <button onClick={usarPin} className="mt-6 text-sm text-white/60 underline">Entrar con PIN</button>
      <button onClick={volver} className="mt-3 text-sm text-white/40">Volver al inicio</button>
    </div>
  )
}

// Después de entrar con PIN: ofrece activar la huella (o muestra que está activa)
export function OpcionHuella({ uid, nombre, cerrarSesion }) {
  const [disp, setDisp] = useState(false)
  const [, refrescar] = useState(0)
  const [msg, setMsg] = useState('')
  useEffect(() => { huellaDisponible().then(setDisp) }, [])
  if (!disp || !uid) return null
  const activa = huellaActiva(uid)
  if (activa) return (
    <div className="flex items-center gap-2 text-xs text-white/45 mt-6 justify-center flex-wrap">
      <Huella className="w-4 h-4 text-celeste" /> Ingreso con huella activado ·
      <button onClick={() => { desactivarHuella(uid); refrescar(x => x + 1) }} className="underline">Desactivar</button> ·
      <button onClick={cerrarSesion} className="underline">Cerrar sesión y usar PIN</button>
    </div>
  )
  if (huellaRechazada(uid)) return null
  const activar = async () => {
    setMsg('')
    try { await activarHuella(uid, nombre); refrescar(x => x + 1) }
    catch (e) { setMsg(e?.name === 'NotAllowedError' ? 'Cancelado' : 'No se pudo activar en este celular') }
  }
  return (
    <div className="rounded-2xl border border-celeste/40 bg-celeste/10 px-4 py-3 mb-4 flex items-center gap-3">
      <Huella className="w-8 h-8 text-celeste shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">¿Entrar con huella la próxima vez?</p>
        <p className="text-xs text-white/50">En este celular, sin escribir el PIN.{msg && <span className="text-red-400"> {msg}</span>}</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={activar} className="rounded-lg px-3 py-1.5 bg-celeste text-noche text-xs font-bold">Activar</button>
        <button onClick={() => { rechazarHuella(uid); refrescar(x => x + 1) }} className="text-[11px] text-white/50">Ahora no</button>
      </div>
    </div>
  )
}
