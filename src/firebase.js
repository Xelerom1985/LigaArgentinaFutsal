import { initializeApp, deleteApp } from 'firebase/app'
import { getDatabase, ref, onValue, get, set, update, push, remove, query, orderByChild, equalTo, startAt, serverTimestamp } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from 'firebase/auth'
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
// SuperAdmin (Fernando): cuenta admin@… — Admin de la Liga: cuentas admin-<PIN>@… (pueden ser varias)
export const ADMIN_EMAIL = 'admin@liga-argentina-futsal.app'
export const PIN_ADMIN_RESERVADO = '2026'
const adminLigaEmail = pin => `admin-${pin}@liga-argentina-futsal.app`
const adminLigaClave = pin => `liga-${pin}-admin`
export const esSuper = u => u?.email === ADMIN_EMAIL
export const esAdminLiga = u => /^admin-\d+@liga-argentina-futsal\.app$/.test(u?.email || '')
const arbitroEmail = pin => `arbitro-${pin}@liga-argentina-futsal.app`
const arbitroClave = pin => `liga-${pin}-arbitro`


// Ingresos separados: árbitros (arriba a la derecha) y administrador (arriba a la izquierda)
export const entrarArbitro = pin => signInWithEmailAndPassword(auth, arbitroEmail(pin), arbitroClave(pin))
const credencialMala = e => /invalid-credential|wrong-password|user-not-found|invalid-email/.test(e?.code || '')
// Un solo teclado para SuperAdmin y Admin de la Liga
// SuperAdmin: 9 números. Admin de la Liga: 4 números (el 2026 del SuperAdmin vale hasta que lo cambie).
export async function entrarAdmin(pin) {
  if (pin.length !== 4) return signInWithEmailAndPassword(auth, ADMIN_EMAIL, `liga-${pin}-argentina`)
  try { return await signInWithEmailAndPassword(auth, adminLigaEmail(pin), adminLigaClave(pin)) }
  catch (e) { if (!credencialMala(e)) throw e }
  return signInWithEmailAndPassword(auth, ADMIN_EMAIL, `liga-${pin}-argentina`)
}
// SuperAdmin: cambia su propio PIN (estando logueado)
export const cambiarPinSuper = nuevo => updatePassword(auth.currentUser, `liga-${nuevo}-argentina`)
export const salir = () => signOut(auth)

// Alta de la cuenta de un árbitro desde el panel admin, con una instancia
// aparte de Firebase para no cerrar la sesión del admin.
async function crearCuenta(email, clave) {
  const tmp = initializeApp(config, 'alta-' + Date.now())
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(tmp), email, clave)
    return cred.user.uid
  } finally {
    await deleteApp(tmp).catch(() => {})
  }
}
export const crearCuentaArbitro = pin => crearCuenta(arbitroEmail(pin), arbitroClave(pin))
export const crearCuentaAdmin = pin => crearCuenta(adminLigaEmail(pin), adminLigaClave(pin))

export function mensajeError(e) {
  const c = e?.code || e?.message || ''
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'PIN incorrecto'
  if (c.includes('too-many-requests')) return 'Demasiados intentos, probá en unos minutos'
  if (c.includes('network')) return 'Sin conexión'
  if (c.includes('email-already-in-use')) return 'Ese PIN ya está usado'
  if (c.includes('requires-recent-login')) return 'Por seguridad, salí y volvé a entrar, y probá de nuevo'
  if (c.includes('weak-password')) return 'El PIN es muy corto'
  if (c.includes('PERMISSION_DENIED') || c.includes('permission')) return 'Sin permiso para hacer eso'
  return 'Error (' + (c || 'desconocido') + ')'
}

// Compatibilidad con el panel de clubes
export const adminSignIn = pin => signInWithEmailAndPassword(auth, ADMIN_EMAIL, `liga-${pin}-argentina`)
export const adminSignOut = salir
