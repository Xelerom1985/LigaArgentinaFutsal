import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, get, set, update, push, remove } from 'firebase/database'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import config from './firebaseConfig'

const app = initializeApp(config)
export const db = getDatabase(app)
export const auth = getAuth(app)
export { ref, onValue, get, set, update, push, remove, onAuthStateChanged }

// El PIN no está guardado en la app: se usa para armar la contraseña de la
// cuenta admin de Firebase. Si el PIN es incorrecto, Firebase rechaza el login.
export const ADMIN_EMAIL = 'admin@liga-argentina-futsal.app'
export const adminSignIn = pin => signInWithEmailAndPassword(auth, ADMIN_EMAIL, `liga-${pin}-argentina`)
export const adminSignOut = () => signOut(auth)
