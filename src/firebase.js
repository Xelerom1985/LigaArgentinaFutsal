import { initializeApp, deleteApp } from 'firebase/app'
import { getDatabase, ref, onValue, get, set, update, push, remove, query, orderByChild, equalTo, startAt, serverTimestamp } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import config from './firebaseConfig'

const app = initializeApp(config)
export const db = getDatabase(app)
export const auth = getAuth(app)
export { ref, onValue, get, set, update, push, remove, query, orderByChild, equalTo, startAt, serverTimestamp, onAuthStateChanged }

// Cada cambio en un partido guarda `act` (hora del servidor): así los celulares
// bajan solo los partidos que cambiaron desde la última vez (ver data/partidos.js)
export const ACT = () => serverTimestamp()

// Los PIN no se guardan en la app: con el PIN se arma la contraseña de la
// cuenta de Firebase. Si el PIN no existe, Firebase rechaza el login.
export const ADMIN_EMAIL = 'admin@liga-argentina-futsal.app'
export const PIN_ADMIN_RESERVADO = '2026'
const arbitroEmail = pin => `arbitro-${pin}@liga-argentina-futsal.app`
const arbitroClave = pin => `liga-${pin}-arbitro`

export const esAdmin = u => u?.email === ADMIN_EMAIL

// Ingresos separados: árbitros (arriba a la derecha) y administrador (arriba a la izquierda)
export const entrarArbitro = pin => signInWithEmailAndPassword(auth, arbitroEmail(pin), arbitroClave(pin))
export const entrarAdmin = pin => signInWithEmailAndPassword(auth, ADMIN_EMAIL, `liga-${pin}-argentina`)
export const salir = () => signOut(auth)

// Alta de la cuenta de un árbitro desde el panel admin, con una instancia
// aparte de Firebase para no cerrar la sesión del admin.
export async function crearCuentaArbitro(pin) {
  const tmp = initializeApp(config, 'alta-' + Date.now())
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(tmp), arbitroEmail(pin), arbitroClave(pin))
    return cred.user.uid
  } finally {
    await deleteApp(tmp).catch(() => {})
  }
}

export function mensajeError(e) {
  const c = e?.code || e?.message || ''
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'PIN incorrecto'
  if (c.includes('too-many-requests')) return 'Demasiados intentos, probá en unos minutos'
  if (c.includes('network')) return 'Sin conexión'
  if (c.includes('email-already-in-use')) return 'Ese PIN ya está usado'
  if (c.includes('PERMISSION_DENIED') || c.includes('permission')) return 'Sin permiso para hacer eso'
  return 'Error (' + (c || 'desconocido') + ')'
}

// Compatibilidad con el panel de clubes
export const adminSignIn = pin => signInWithEmailAndPassword(auth, ADMIN_EMAIL, `liga-${pin}-argentina`)
export const adminSignOut = salir
