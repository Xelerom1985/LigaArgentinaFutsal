import { useState } from 'react'
import { adminSignIn } from '../firebase'
import { Candado } from '../components/Iconos'

export default function PinModal({ cerrar, ok }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const entrar = async () => {
    if (!pin || cargando) return
    setCargando(true); setError('')
    try {
      await adminSignIn(pin)
      ok()
    } catch (e) {
      const c = e?.code || ''
      setError(c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') ? 'PIN incorrecto'
        : c.includes('too-many-requests') ? 'Demasiados intentos, probá en unos minutos'
        : c.includes('network') ? 'Sin conexión' : 'No se pudo entrar (' + (c || 'error') + ')')
      setPin('')
    } finally { setCargando(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-6" onClick={cerrar}>
      <div className="w-full max-w-xs rounded-3xl border border-white/10 p-6 float-in" style={{ background: '#0b1f3a' }} onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-celeste/15 text-celeste flex items-center justify-center mb-2"><Candado className="w-6 h-6" /></div>
          <h3 className="font-display text-2xl tracking-wide">Administrador</h3>
          <p className="text-white/50 text-sm">Ingresá el PIN</p>
        </div>
        <input
          autoFocus type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8}
          value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && entrar()}
          className={`w-full rounded-xl px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none bg-noche-dark border-2 transition-colors ${error ? 'border-red-500' : 'border-celeste/40 focus:border-celeste'}`}
        />
        <p className="text-red-400 text-sm text-center h-5 mt-2">{error}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={cerrar} className="flex-1 rounded-xl py-3 bg-white/5 text-white/60 text-sm font-semibold">Cancelar</button>
          <button onClick={entrar} disabled={cargando} className="flex-1 rounded-xl py-3 bg-celeste text-noche text-sm font-bold disabled:opacity-60">{cargando ? 'Entrando…' : 'Entrar'}</button>
        </div>
      </div>
    </div>
  )
}
