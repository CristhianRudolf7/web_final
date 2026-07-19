import { NavLink } from 'react-router-dom'

interface SidebarPrivadoProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => Promise<void>
}

export function SidebarPrivado({ isOpen, onClose, onLogout }: SidebarPrivadoProps) {
  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/dashboard/productos', label: 'Productos', icon: '🌾' },
    { to: '/dashboard/parcelas', label: 'Mis Parcelas', icon: '🚜' },
    { to: '/dashboard/datos-parcelas', label: 'Datos de Parcelas', icon: '📈' },
    { to: '/dashboard/perfil', label: 'Perfil', icon: '👤' },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-eco-sm px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'bg-eco-green-light text-eco-green-primary'
        : 'text-slate-600 hover:bg-slate-50 hover:text-eco-green-primary'
    }`

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white py-6">
      <div>
        {/* Brand Header */}
        <div className="px-6 pb-6 border-b border-eco-green-light">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-eco-sm bg-eco-green-light text-xl">🌱</span>
            <span className="text-lg font-extrabold tracking-tight text-eco-green-dark">CultivoPrivado</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={linkClass}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="px-3 border-t border-eco-green-light pt-6">
        <button
          onClick={() => {
            onClose()
            onLogout()
          }}
          className="flex w-full items-center gap-3 rounded-eco-sm px-4 py-3.5 text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
        >
          <span className="text-lg">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 border-r border-eco-green-light bg-white md:block md:shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar Drawer for Mobile */}
      <div
        className={`fixed inset-0 z-50 flex md:hidden transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Overlay background */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Drawer container */}
        <div
          className={`relative flex w-64 max-w-xs flex-1 flex-col bg-white transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button inside mobile sidebar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
          
          {sidebarContent}
        </div>
      </div>
    </>
  )
}
