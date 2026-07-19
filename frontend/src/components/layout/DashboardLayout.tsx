import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { HeaderPrivado } from './HeaderPrivado'
import { SidebarPrivado } from './SidebarPrivado'

export function DashboardLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usuario, setUsuario] = useState<{ nombre: string; apellido: string; email: string; celular: string; dni: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await axios.get('/api/perfil/', { withCredentials: true })
        setUsuario(response.data)
      } catch (err) {
        console.error('Sesión no válida o expirada', err)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    verificarSesion()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout/', {}, { withCredentials: true })
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesión', err)
      navigate('/login')
    }
  }

  if (loading) {
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
      {/* Sidebar Navigation */}
      <SidebarPrivado
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <HeaderPrivado
          onToggleSidebar={() => setSidebarOpen(true)}
          usuarioNombre={usuarioNombreCompleto}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ usuario, setUsuario }} />
        </main>
      </div>
    </div>
  )
}
