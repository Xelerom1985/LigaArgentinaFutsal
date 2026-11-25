// Logo de la liga con dos tarjetas (amarilla y roja) de fondo
export default function Logo({ size = 200 }) {
  const card = { width: size * 0.5, height: size * 0.7, borderRadius: size * 0.05 }
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.35, height: size * 1.1 }}>
      <div className="absolute shadow-2xl"
        style={{ ...card, background: 'linear-gradient(160deg,#ffe14d,#f5b800)', transform: `translateX(${-size * 0.3}px) rotate(-16deg)` }} />
      <div className="absolute shadow-2xl"
        style={{ ...card, background: 'linear-gradient(160deg,#ff4d4d,#c90f1c)', transform: `translateX(${size * 0.3}px) rotate(14deg)` }} />
      <img src="./logo.png" alt="Liga Argentina de Futsal" className="relative object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.55)]"
        style={{ width: size, height: size }} />
    </div>
  )
}
