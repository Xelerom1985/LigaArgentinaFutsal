// Achica el escudo elegido a 200 px como máximo, recorta el borde transparente
// y lo devuelve como data URL (se guarda directo en la base, ~10-30 KB).
export function prepararEscudo(file, max = 200) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth; c.height = img.naturalHeight
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        let { width: w, height: h } = c
        const d = ctx.getImageData(0, 0, w, h).data
        let x0 = w, y0 = h, x1 = -1, y1 = -1
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (d[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
        }
        if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1 }
        const cw = x1 - x0 + 1, ch = y1 - y0 + 1
        const k = Math.min(1, max / Math.max(cw, ch))
        const o = document.createElement('canvas')
        o.width = Math.round(cw * k); o.height = Math.round(ch * k)
        const octx = o.getContext('2d')
        octx.imageSmoothingQuality = 'high'
        octx.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height)
        let out = o.toDataURL('image/webp', 0.85)
        if (!out.startsWith('data:image/webp')) out = o.toDataURL('image/png')
        resolve(out)
      } catch (e) { reject(e) } finally { URL.revokeObjectURL(url) }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}
// Hoja firmada: foto achicada a 1600 px en JPEG (~200-400 KB) o PDF tal cual (máx. 1,5 MB).
// Devuelve { data (data URL), tipo, nombre }.
export function prepararHoja(file) {
  if (file.type === 'application/pdf') {
    if (file.size > 1.5 * 1024 * 1024) return Promise.reject(new Error('El PDF pesa más de 1,5 MB. Mandá una foto.'))
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve({ data: r.result, tipo: 'pdf', nombre: file.name })
      r.onerror = () => reject(new Error('No se pudo leer el archivo'))
      r.readAsDataURL(file)
    })
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
        const c = document.createElement('canvas')
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k)
        const ctx = c.getContext('2d')
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0, c.width, c.height)
        resolve({ data: c.toDataURL('image/jpeg', 0.72), tipo: 'imagen', nombre: file.name })
      } catch (e) { reject(e) } finally { URL.revokeObjectURL(url) }
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}

// Abre una hoja guardada (data URL) en otra pestaña
export function abrirDataUrl(data) {
  const [meta, b64] = data.split(',')
  const tipo = meta.match(/data:([^;]+)/)?.[1] || 'application/octet-stream'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  window.open(URL.createObjectURL(new Blob([arr], { type: tipo })), '_blank')
}
