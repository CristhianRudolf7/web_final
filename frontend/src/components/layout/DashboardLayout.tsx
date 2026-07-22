import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { HeaderPrivado } from './HeaderPrivado'
import { SidebarPrivado } from './SidebarPrivado'

export function DashboardLayout() {
  const navegacion = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(true)
  const [usuario, setUsuario] = useState<{ nombre: string; apellido: string; email: string; celular: string; dni: string } | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const respuesta = await axios.get('/api/perfil/', { withCredentials: true })
        setUsuario(respuesta.data)
      } catch (error) {
        console.error('Sesión no válida o expirada', error)
        navegacion('/login')
      } finally {
        setCargando(false)
      }
    }
    verificarSesion()
  }, [navegacion])

  const alCerrarSesion = async () => {
    try {
      await axios.post('/api/logout/', {}, { withCredentials: true })
      navegacion('/login')
    } catch (error) {
      console.error('Error al cerrar sesión', error)
      navegacion('/login')
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-eco-green-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-semibold text-slate-500">Iniciando espacio seguro...</p>
        </div>
      </div>
    )
  }

  const usuarioNombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : ''

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Navegación Lateral (Sidebar) */}
      <SidebarPrivado
        estaAbierto={menuAbierto}
        alCerrar={() => setMenuAbierto(false)}
        alCerrarSesion={alCerrarSesion}
      />

      {/* Área Principal de Contenido */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* Cabecera Privada con botón sándwich */}
        <HeaderPrivado
          alAlternarMenu={() => setMenuAbierto(!menuAbierto)}
          usuarioNombre={usuarioNombreCompleto}
          menuAbierto={menuAbierto}
        />

        {/* Cuerpo de Contenido Dinámico */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ usuario, setUsuario }} />
        </main>
      </div>
    </div>
  )
}
