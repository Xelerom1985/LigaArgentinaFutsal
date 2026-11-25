// Ingreso con huella / cara del celular (WebAuthn, autenticador del propio teléfono).
//
// La primera vez se entra con PIN (sesión de Firebase). Si se activa la huella, la
// sesión queda abierta en ese celular y para abrir el panel se pide la huella.
// La huella nunca sale del teléfono: solo se guarda el id de la "llave" creada.
const clave = uid => 'laf_huella_' + uid
const NO = uid => 'laf_huella_no_' + uid
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
const azar = () => crypto.getRandomValues(new Uint8Array(32))
const leer = k => { try { return localStorage.getItem(k) } catch { return null } }
const escribir = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} }

export async function huellaDisponible() {
  try {
    return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch { return false }
}
export const huellaActiva = uid => !!uid && !!leer(clave(uid))
export const huellaRechazada = uid => !!leer(NO(uid))
export const rechazarHuella = uid => escribir(NO(uid), '1')
export const desactivarHuella = uid => { escribir(clave(uid), null); escribir(NO(uid), '1') }

export async function activarHuella(uid, nombre) {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: azar(),
      rp: { name: 'Liga Argentina de Futsal', id: location.hostname },
      user: { id: new TextEncoder().encode(uid), name: nombre || 'usuario', displayName: nombre || 'Liga Argentina' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      timeout: 60000,
    },
  })
  escribir(clave(uid), b64(cred.rawId))
  escribir(NO(uid), null)
}

export async function verificarHuella(uid) {
  const id = leer(clave(uid))
  if (!id) return false
  const r = await navigator.credentials.get({
    publicKey: {
      challenge: azar(),
      allowCredentials: [{ type: 'public-key', id: deB64(id), transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    },
  })
  return !!r
}
