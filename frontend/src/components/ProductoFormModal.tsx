import { FormEvent, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import type { Producto } from '../types'

interface ProductoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  productoEditar?: Producto | null
}

export function ProductoFormModal({ isOpen, onClose, onSave, productoEditar }: ProductoFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Fields state
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)

  // Request feedback state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load product if editing
  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre)
      setDescripcion(productoEditar.descripcion)
      setPrecio(productoEditar.precio.toString())
      setStock(productoEditar.stock.toString())
      setImagenFile(null)
      setImagenPreview(productoEditar.imagenUrl || null)
    } else {
      setNombre('')
      setDescripcion('')
      setPrecio('')
      setStock('')
      setImagenFile(null)
      setImagenPreview(null)
    }
    setError('')
  }, [productoEditar, isOpen])

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagenFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Basic Validations
    if (!nombre.trim() || !descripcion.trim() || !precio.trim() || !stock.trim()) {
      return setError('Todos los campos de texto son obligatorios.')
    }

    const precioNum = parseFloat(precio)
    if (isNaN(precioNum) || precioNum <= 0) {
      return setError('El precio debe ser un número mayor a cero (S/ > 0).')
    }

    const stockNum = parseInt(stock)
    if (isNaN(stockNum) || stockNum < 0) {
      return setError('El stock no puede ser menor a cero.')
    }

    setLoading(true)

    // Build FormData
    const formData = new FormData()
    formData.append('nombre', nombre)
    formData.append('descripcion', descripcion)
    formData.append('precio', precioNum.toFixed(2))
    formData.append('stock', stockNum.toString())
    
    if (imagenFile) {
      formData.append('imagen', imagenFile)
    }

    try {
      if (productoEditar) {
        // Edit Mode: Send PATCH to keep unchanged fields safe
        await axios.patch(`/api/productos/${productoEditar.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      } else {
        // Create Mode
        await axios.post('/api/productos/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      }
      onSave()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.detalle || 
        err.response?.data?.nombre?.[0] || 
        err.response?.data?.precio?.[0] || 
        err.response?.data?.stock?.[0] || 
        'No se pudo guardar el producto. Inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!productoEditar

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft transition-all md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="mb-6 border-b border-eco-green-light pb-4">
          <h2 className="text-2xl font-extrabold text-eco-green-dark">
            {isEdit ? '✏️ Editar Producto' : '🌱 Registrar Nuevo Producto'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? 'Actualiza los datos del producto seleccionado en tu inventario.'
              : 'Registra un producto para ponerlo a la venta en el catálogo.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="modal-nombre" className="mb-2 block text-sm font-bold text-eco-green-dark">
              Nombre del Producto
            </label>
            <input
              id="modal-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              placeholder="Ej: Palta Hass Premium"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
            />
          </div>

          {/* Descripcion */}
          <div>
            <label htmlFor="modal-descripcion" className="mb-2 block text-sm font-bold text-eco-green-dark">
              Descripción del Cultivo
            </label>
            <textarea
              id="modal-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Describe el origen del cultivo, métodos orgánicos utilizados, etc."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10 resize-none"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="modal-precio" className="mb-2 block text-sm font-bold text-eco-green-dark">
                Precio (S/ por unidad)
              </label>
              <input
                id="modal-precio"
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                disabled={loading}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
            </div>
            
            <div>
              <label htmlFor="modal-stock" className="mb-2 block text-sm font-bold text-eco-green-dark">
                Stock Inicial (Unidades)
              </label>
              <input
                id="modal-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={loading}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
            </div>
          </div>

          {/* Imagen Upload */}
          <div>
            <label className="mb-2 block text-sm font-bold text-eco-green-dark">Imagen del Producto</label>
            <div className="flex gap-4 items-center">
              {imagenPreview && (
                <div className="h-16 w-16 overflow-hidden rounded-eco-sm border border-eco-green-light bg-slate-50 shrink-0">
                  <img src={imagenPreview} alt="Vista previa" className="h-full w-full object-cover" />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:border-eco-green-primary"
                >
                  {imagenPreview ? '📷 Cambiar Imagen' : '📁 Subir Imagen'}
                </button>
                <p className="mt-1.5 text-xs text-slate-400">Archivos permitidos: JPG, PNG. Máx 5MB.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-eco-green-light">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-sm transition hover:bg-eco-green-dark disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
