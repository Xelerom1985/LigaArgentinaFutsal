export default function Fondo() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 70% at 50% 0%, #1d4b86 0%, #0b1f3a 45%, #06142a 100%)' }} />
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
        <defs>
          <pattern id="diag" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#a9cdf0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>
      {/* franja celeste-blanca-celeste */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-celeste" /><div className="flex-1 bg-white" /><div className="flex-1 bg-celeste" />
      </div>
    </div>
  )
}
