import { NotificationBell } from '../NotificationBell'

interface HeaderPrivadoProps {
  onToggleSidebar: () => void
  usuarioNombre?: string
}

export function HeaderPrivado({ onToggleSidebar, usuarioNombre }: HeaderPrivadoProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-eco-green-light bg-white px-6 shadow-sm">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-eco-green-dark transition-all hover:bg-eco-green-light md:hidden"
        aria-label="Abrir navegación lateral"
      >
        <span className="block h-5 w-5 text-xl leading-none">☰</span>
      </button>

      {/* Brand logo shown on mobile header for context */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-xl">🌱</span>
        <span className="text-md font-extrabold text-eco-green-dark">CultivoPrivado</span>
      </div>

      {/* Right-aligned User Greeting, Notifications & Status */}
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400">Agricultor Conectado</p>
          <p className="text-sm font-bold text-eco-green-dark">
            {usuarioNombre || 'Cargando agricultor…'}
          </p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-eco-green-light font-extrabold text-eco-green-primary border border-eco-green-primary/20">
          {(usuarioNombre && usuarioNombre[0]) || 'A'}
        </div>
      </div>
    </header>
  )
}
