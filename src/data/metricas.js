import { db, ref, update, increment, onDisconnect, set, serverTimestamp } from '../firebase'

// Métricas de uso ANÓNIMAS para el Backoffice del SuperAdmin.
// No se guarda nada personal: solo contadores por día (hora argentina).
//   /metricas/d/{dia}/{grupo}/{clave} = número
//     gen:    visitantes (celulares distintos en el día), nuevos (primera vez), aperturas
//     disp:   android | iphone | pc        modo: app (instalada) | web
//     horas:  h00..h23 (aperturas por hora) vistas: pantalla
//     zonas:  zonas vistas en "Clubes y ubicaciones"   tablas: tablas vistas por zona
//     miclub: club elegido en Mi club (al abrir Mi club)   acc: como-llegar, instalo
//     kb:     base (descarga estimada de Realtime Database), hosting (archivos de la app)
//   /metricas/e/{dia}/{hash} = { msg, n }   errores de la app
//   /metricas/vivo/{celular} = hora         quién tiene la app abierta ahora
// Las escrituras se juntan y se mandan de a una cada 15 s (o al salir de la app).

const AR = 3 * 3600e3
export const diaDe = t => new Date(t - AR).toISOString().slice(0, 10)
const hoy = () => diaDe(Date.now())
export const claveDe = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'x'

const ls = {
  get: k => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch {} },
}
const activo = !import.meta.env.DEV && !new URLSearchParams(location.search).get('demo')
// El celular del SuperAdmin no cuenta como "usuario" (sí cuenta su consumo)
export const esPersonal = () => ls.get('laf_m_staff') === '1'
export const marcarPersonal = si => ls.set('laf_m_staff', si ? '1' : '0')

let pendiente = {}
let bytes = { base: 0, hosting: 0 }
let timer = null
const sumar = (grupo, clave, n = 1) => {
  if (!activo || !(n > 0)) return
  const k = `${grupo}/${clave}`
  pendiente[k] = (pendiente[k] || 0) + n
  if (!timer) timer = setTimeout(enviar, 15000)
}
const sumarUso = (grupo, clave, n = 1) => { if (!esPersonal()) sumar(grupo, clave, n) }

function enviar() {
  clearTimeout(timer); timer = null
  // Bytes → KB enteros; el resto queda para la próxima
  for (const t of ['base', 'hosting']) {
    const kb = Math.floor(bytes[t] / 1024)
    if (kb > 0) { bytes[t] -= kb * 1024; pendiente[`kb/${t}`] = (pendiente[`kb/${t}`] || 0) + kb }
  }
  const p = pendiente; pendiente = {}
  if (!Object.keys(p).length) return
  const dia = hoy()
  const cambios = {}
  for (const [k, n] of Object.entries(p)) cambios[`metricas/d/${dia}/${k}`] = increment(Math.min(n, 50000))
  update(ref(db), cambios).catch(() => {})
}

// Descarga de la base: tamaño aproximado de lo que llegó (JSON)
export function contarBajada(val) {
  if (!activo || val == null) return
  try { bytes.base += JSON.stringify(val).length } catch {}
  if (!timer) timer = setTimeout(enviar, 15000)
}

// Pantallas: se llama en cada cambio de ruta
export function contarVista(vista, id, miKey) {
  const v = { home: 'inicio', tablas: 'tablas' }[vista] || vista
  sumarUso('vistas', claveDe(v))
  if (vista === 'zona' && id) sumarUso('zonas', claveDe(id))
  if (vista === 'tabla' && id) sumarUso('tablas', claveDe(id))
  if (vista === 'mi-club' && miKey) sumarUso('miclub', claveDe(miKey))
}
export const contarAccion = a => sumarUso('acc', claveDe(a))

function dispositivo() {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iphone'
  return 'pc'
}
const instalada = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

function idCelular() {
  let id = ls.get('laf_m_id')
  if (!id) { id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); ls.set('laf_m_id', id) }
  return id
}

function hashDe(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
let errores = 0
function contarError(msg) {
  if (!activo || errores >= 5 || !msg) return
  errores++
  const m = String(msg).slice(0, 280)
  const base = `metricas/e/${hoy()}/${hashDe(m)}`
  update(ref(db), { [`${base}/n`]: increment(1) }).catch(() => {})
  set(ref(db, `${base}/msg`), m).catch(() => {}) // solo la primera vez (las reglas no dejan pisarlo)
}

// Archivos de la app bajados del hosting (lo que vino de la red, no de la caché)
function medirHosting() {
  const tam = e => e.transferSize || 0
  try {
    for (const e of performance.getEntriesByType('navigation')) bytes.hosting += tam(e)
    for (const e of performance.getEntriesByType('resource')) if (e.name.startsWith(location.origin)) bytes.hosting += tam(e)
    new PerformanceObserver(l => {
      for (const e of l.getEntries()) if (e.name.startsWith(location.origin)) bytes.hosting += tam(e)
    }).observe({ type: 'resource', buffered: false })
  } catch {}
  // Primera instalación del service worker: baja toda la app de una vez (no aparece en la página)
  if ('serviceWorker' in navigator && !navigator.serviceWorker.controller && !ls.get('laf_m_sw')) {
    ls.set('laf_m_sw', '1')
    bytes.hosting += (__APP_KB__ || 0) * 1024
  }
}

let iniciado = false
export function iniciarMetricas() {
  if (iniciado || !activo) return
  iniciado = true
  const id = idCelular()
  const dia = hoy()
  if (!ls.get('laf_m_visto')) { ls.set('laf_m_visto', dia); sumarUso('gen', 'nuevos') }
  if (ls.get('laf_m_dia') !== dia) {
    ls.set('laf_m_dia', dia)
    sumarUso('gen', 'visitantes'); sumarUso('disp', dispositivo()); sumarUso('modo', instalada() ? 'app' : 'web')
  }
  sumarUso('gen', 'aperturas')
  sumarUso('horas', 'h' + String(new Date(Date.now() - AR).getUTCHours()).padStart(2, '0'))
  medirHosting()

  // En línea ahora (se borra solo al cerrar la app)
  if (!esPersonal()) {
    const r = ref(db, 'metricas/vivo/' + id)
    onDisconnect(r).remove().then(() => set(r, serverTimestamp())).catch(() => {})
  }

  window.addEventListener('error', e => contarError(e.message))
  window.addEventListener('unhandledrejection', e => contarError('Promesa: ' + (e.reason?.message || e.reason)))
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') enviar() })
  // "Cómo llegar": cualquier link a Google Maps
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]')
    if (a && /google\.[a-z.]+\/maps|maps\.google/.test(a.href)) contarAccion('como-llegar')
  }, true)
  window.addEventListener('appinstalled', () => contarAccion('instalo'))
}
