// Estado de instalación compartido entre el cartel de abajo y la página "Cómo instalar".
// Chrome/Android avisa una sola vez (beforeinstallprompt): lo guardamos acá para usarlo desde cualquier lado.
import { useEffect, useState } from 'react'

export const URL_APP = 'https://liga-argentina-futsal.web.app'

const ua = () => navigator.userAgent || ''
export const esIOS = () => /iphone|ipad|ipod/i.test(ua()) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const esAndroid = () => /android/i.test(ua())
// En iPhone, Chrome/Firefox/Instagram/Facebook también pueden agregar a inicio desde iOS 16.4,
// pero Safari es lo más seguro; avisamos si está dentro de Instagram/Facebook/WhatsApp.
export const navegadorInterno = () => /FBAN|FBAV|Instagram|WhatsApp|Line\//i.test(ua())
export const esSafari = () => esIOS() && /safari/i.test(ua()) && !/crios|fxios|edgios|opios/i.test(ua()) && !navegadorInterno()
export const instalada = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

let aviso = null
let yaInstalo = false
const oyentes = new Set()
const avisar = () => oyentes.forEach(f => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); aviso = e; avisar() })
  window.addEventListener('appinstalled', () => { aviso = null; yaInstalo = true; avisar() })
}

// { puede: hay botón "Instalar" directo, instalada, instalar() }
export function useInstalacion() {
  const [, setN] = useState(0)
  useEffect(() => { const f = () => setN(n => n + 1); oyentes.add(f); return () => oyentes.delete(f) }, [])
  return {
    puede: !!aviso,
    instalada: yaInstalo || instalada(),
    instalar: async () => {
      if (!aviso) return false
      const e = aviso
      await e.prompt()
      const r = await e.userChoice.catch(() => null)
      aviso = null; avisar()
      return r?.outcome === 'accepted'
    },
  }
}
