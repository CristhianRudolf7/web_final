import { useEffect, useState } from 'react'
import axios from 'axios'
import type { Producto } from '../types'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { ConfirmModal } from '../components/ConfirmModal'

export function ProductosPanel() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  
  // Action loading state
  const [actionLoading, setActionLoading] = useState(false)

  const cargarProductos = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/productos/', { withCredentials: true })
      setProductos(response.data)
    } catch (err: any) {
      console.error(err)
      setError('No se pudo cargar el inventario de productos. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const handleAgregarClick = () => {
    setProductoSeleccionado(null)
    setIsFormOpen(true)
  }

  const handleEditarClick = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setIsConfirmOpen(true)
  }

  const handleConfirmarEliminar = async () => {
    if (!productoSeleccionado) return
    setActionLoading(true)
    try {
      await axios.delete(`/api/productos/${productoSeleccionado.id}/`, { withCredentials: true })
      // Immediate local state update after success
      setProductos((prev) => prev.filter((item) => item.id !== productoSeleccionado.id))
      setIsConfirmOpen(false)
      setProductoSeleccionado(null)
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.detalle || 'No se pudo eliminar el producto.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-eco-green-light pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Mi Inventario</p>
          <h1 className="text-3xl font-extrabold text-eco-green-dark mt-1">Gestión de Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra tus productos, actualiza los precios y controla tu stock disponible.
          </p>
        </div>
        
        <button
          onClick={handleAgregarClick}
          className="flex items-center justify-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark shrink-0"
        >
          <span className="text-lg font-normal leading-none">+</span>
          <span>Agregar Producto</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-green-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Obteniendo productos...</p>
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
          <span className="text-5xl">🌾</span>
          <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Inventario Vacío</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Aún no has registrado ningún producto en tu cuenta. ¡Haz clic en "Agregar Producto" para comenzar!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-eco-lg border border-slate-100 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {productos.map((producto) => (
                <tr key={producto.id} className="transition hover:bg-slate-50/50">
                  <td className="px-6 py-4 shrink-0">
                    <div className="h-12 w-12 overflow-hidden rounded-eco-sm border border-eco-green-light bg-slate-50">
                      {producto.imagenUrl ? (
                        <img
                          src={producto.imagenUrl}
                          alt={producto.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl bg-eco-green-light text-eco-green-primary">
                          🌽
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-eco-green-dark">{producto.nombre}</div>
                    <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{producto.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    S/ {parseFloat(producto.precio as any).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 shrink-0">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        producto.stock === 0
                          ? 'bg-red-50 text-red-600'
                          : producto.stock <= 10
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-emerald-50 text-eco-green-primary'
                      }`}
                    >
                      {producto.stock} uds
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditarClick(producto)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleEliminarClick(producto)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      <ProductoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productoEditar={productoSeleccionado}
        onSave={cargarProductos}
      />

      {/* Warning/Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="⚠️ Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${productoSeleccionado?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmarEliminar}
        loading={actionLoading}
      />
    </div>
  )
}
