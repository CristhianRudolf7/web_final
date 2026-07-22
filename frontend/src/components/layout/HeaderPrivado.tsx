import { useLocation } from 'react-router-dom'
import { NotificationBell } from '../NotificationBell'

interface PropiedadesHeaderPrivado {
  alAlternarMenu: () => void
  usuarioNombre?: string
  menuAbierto?: boolean
}

function obtenerTituloPestana(ruta: string): string {
  if (ruta === '/dashboard' || ruta === '/dashboard/') return 'Dashboard'
  if (ruta.startsWith('/dashboard/productos')) return 'Productos'
  if (ruta.includes('/mapa')) return 'Mapa Interactivo'
  if (ruta.startsWith('/dashboard/parcelas/')) return 'Detalle de Parcela'
  if (ruta.startsWith('/dashboard/parcelas')) return 'Mis Parcelas'
  if (ruta.startsWith('/dashboard/perfil')) return 'Perfil'
  return 'Dashboard'
}

export function HeaderPrivado({ alAlternarMenu, usuarioNombre, menuAbierto }: PropiedadesHeaderPrivado) {
  const ubicacion = useLocation()
  const tituloPestana = obtenerTituloPestana(ubicacion.pathname)

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-eco-green-light bg-white px-4 sm:px-6 shadow-sm transition-all duration-300">
      {/* Botón de sándwich (Hamburguesa) presente siempre tanto en escritorio como móvil */}
      <div className="flex items-center gap-4">
        <button
          onClick={alAlternarMenu}
          className="flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-eco-green-dark transition-all hover:bg-eco-green-light hover:border-eco-green-primary/30 focus:outline-none focus:ring-2 focus:ring-eco-green-primary/20 cursor-pointer shadow-sm"
          aria-label={menuAbierto ? 'Colapsar menú lateral' : 'Abrir menú lateral'}
          title={menuAbierto ? 'Colapsar menú' : 'Abrir menú'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Nombre dinámico de la pestaña activa en pantallas grandes (sin ícono, oculto en pantallas pequeñas) */}
        <div className="hidden sm:block">
          <h1 className="text-xl font-extrabold text-eco-green-dark tracking-tight">
            {tituloPestana}
          </h1>
        </div>
      </div>

      {/* Saludo de usuario, notificaciones y perfil */}
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
        <div className="hidden text-right sm:block">
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
