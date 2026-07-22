import { NavLink } from 'react-router-dom'

interface PropiedadesSidebarPrivado {
  estaAbierto: boolean
  alCerrar: () => void
  alCerrarSesion: () => Promise<void>
}

export function SidebarPrivado({ estaAbierto, alCerrar, alCerrarSesion }: PropiedadesSidebarPrivado) {
  const elementosMenu = [
    { a: '/dashboard', etiqueta: 'Dashboard', icono: '📊' },
    { a: '/dashboard/productos', etiqueta: 'Productos', icono: '🌾' },
    { a: '/dashboard/parcelas', etiqueta: 'Mis Parcelas', icono: '🚜' },
    { a: '/dashboard/perfil', etiqueta: 'Perfil', icono: '👤' },
  ]

  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-eco-sm px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'bg-eco-green-light text-eco-green-primary'
        : 'text-slate-600 hover:bg-slate-50 hover:text-eco-green-primary'
    }`

  const contenidoSidebar = (
    <div className="flex h-full flex-col justify-between bg-white py-6">
      <div>
        {/* Cabecera del Sidebar */}
        <div className="px-6 pb-6 border-b border-eco-green-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-eco-sm bg-eco-green-light text-xl">🌱</span>
            <span className="text-lg font-extrabold tracking-tight text-eco-green-dark">Cultivos</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="mt-6 space-y-1.5 px-3">
          {elementosMenu.map((item) => (
            <NavLink
              key={item.etiqueta}
              to={item.a}
              end={item.a === '/dashboard'}
              onClick={() => {
                if (window.innerWidth < 768) {
                  alCerrar()
                }
              }}
              className={claseEnlace}
            >
              <span className="text-lg">{item.icono}</span>
              <span className="whitespace-nowrap">{item.etiqueta}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Botón de Cerrar Sesión */}
      <div className="px-3 border-t border-eco-green-light pt-6">
        <button
          onClick={() => {
            alCerrar()
            alCerrarSesion()
          }}
          className="flex w-full items-center gap-3 rounded-eco-sm px-4 py-3.5 text-sm font-bold text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
        >
          <span className="text-lg">🚪</span>
          <span className="whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar para pantallas grandes (Escritorio) - Colapsa desplazando el contenido a la derecha/izquierda */}
      <aside
        className={`hidden md:block shrink-0 border-r border-eco-green-light bg-white transition-all duration-300 ease-in-out ${
          estaAbierto ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
        }`}
      >
        <div className="w-64 h-full">
          {contenidoSidebar}
        </div>
      </aside>

      {/* Drawer desplegable para pantallas pequeñas (Móvil) - Sobre el contenido */}
      <div
        className={`fixed inset-0 z-50 flex md:hidden transition-opacity duration-300 ${
          estaAbierto ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Fondo oscuro traslúcido */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={alCerrar}
        />

        {/* Contenedor del Drawer */}
        <div
          className={`relative flex w-64 max-w-xs flex-1 flex-col bg-white transition-transform duration-300 ease-in-out ${
            estaAbierto ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Botón de cerrar en móvil */}
          <button
            onClick={alCerrar}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
            aria-label="Cerrar menú"
          >
            ✕
          </button>

          {contenidoSidebar}
        </div>
      </div>
    </>
  )
}
