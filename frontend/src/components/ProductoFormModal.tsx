import { FormEvent, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import axios from 'axios'
import type { Producto } from '../types'

interface PropiedadesProductoFormModal {
  estaAbierto: boolean
  alCerrar: () => void
  alGuardar: () => void
  productoEditar?: Producto | null
}

export function ProductoFormModal({ estaAbierto, alCerrar, alGuardar, productoEditar }: PropiedadesProductoFormModal) {
  const referenciaEntradaArchivo = useRef<HTMLInputElement>(null)
  
  // Estado de los campos del formulario
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null)
  const [imagenVistaPrevia, setImagenVistaPrevia] = useState<string | null>(null)

  // Estado de retroalimentación de la petición
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Cargar datos del producto si se encuentra en modo edición
  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre)
      setDescripcion(productoEditar.descripcion)
      setPrecio(productoEditar.precio.toString())
      setStock(productoEditar.stock.toString())
      setImagenArchivo(null)
      setImagenVistaPrevia(productoEditar.imagenUrl || null)
    } else {
      setNombre('')
      setDescripcion('')
      setPrecio('')
      setStock('')
      setImagenArchivo(null)
      setImagenVistaPrevia(null)
    }
    setError('')
  }, [productoEditar, estaAbierto])

  if (!estaAbierto) return null

  const alCambiarImagen = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (archivo) {
      setImagenArchivo(archivo)
      const lector = new FileReader()
      lector.onloadend = () => {
        setImagenVistaPrevia(lector.result as string)
      }
      lector.readAsDataURL(archivo)
    }
  }

  const alEnviarFormulario = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setError('')

    // Validaciones básicas
    if (!nombre.trim() || !descripcion.trim() || !precio.trim() || !stock.trim()) {
      return setError('Todos los campos de texto son obligatorios.')
    }

    const precioNumero = parseFloat(precio)
    if (isNaN(precioNumero) || precioNumero <= 0) {
      return setError('El precio debe ser un número mayor a cero (S/ > 0).')
    }

    const stockNumero = parseInt(stock)
    if (isNaN(stockNumero) || stockNumero < 0) {
      return setError('El stock no puede ser menor a cero.')
    }

    setCargando(true)

    // Construcción del FormData
    const datosFormulario = new FormData()
    datosFormulario.append('nombre', nombre)
    datosFormulario.append('descripcion', descripcion)
    datosFormulario.append('precio', precioNumero.toFixed(2))
    datosFormulario.append('stock', stockNumero.toString())
    
    if (imagenArchivo) {
      datosFormulario.append('imagen', imagenArchivo)
    }

    try {
      if (productoEditar) {
        await axios.patch(`/api/productos/${productoEditar.id}/`, datosFormulario, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
        toast.success(`Producto "${nombre}" actualizado correctamente.`)
      } else {
        await axios.post('/api/productos/', datosFormulario, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
        toast.success(`Producto "${nombre}" creado exitosamente.`)
      }
      alGuardar()
      alCerrar()
    } catch (errorPeticion: any) {
      console.error(errorPeticion)
      const mensajeError =
        errorPeticion.response?.data?.detalle || 
        errorPeticion.response?.data?.nombre?.[0] || 
        errorPeticion.response?.data?.precio?.[0] || 
        errorPeticion.response?.data?.stock?.[0] || 
        'No se pudo guardar el producto. Inténtalo de nuevo.'
      setError(mensajeError)
      toast.error(mensajeError)
    } finally {
      setCargando(false)
    }
  }

  const esEdicion = !!productoEditar

  // Renderizado mediante React Portal en document.body para evitar restricciones de contenedores padre
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro opacador con desenfoque de fondo */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={alCerrar}
      />

      {/* Contenedor flexible con min-h-full para garantizar centrado y scroll sin cortes */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        {/* Tarjeta Modal */}
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-eco-lg border border-slate-100 bg-white p-6 text-left shadow-2xl transition-all sm:my-8 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={alCerrar}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>

          <div className="mb-6 border-b border-eco-green-light pb-4">
            <h2 className="text-2xl font-extrabold text-eco-green-dark">
              {esEdicion ? '✏️ Editar Producto' : '🌱 Registrar Nuevo Producto'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {esEdicion
                ? 'Actualiza los datos del producto seleccionado en tu inventario.'
                : 'Registra un producto para ponerlo a la venta en el catálogo.'}
            </p>
          </div>

          <form onSubmit={alEnviarFormulario} className="space-y-5">
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
                disabled={cargando}
                placeholder="Ej: Palta Hass Premium"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="modal-descripcion" className="mb-2 block text-sm font-bold text-eco-green-dark">
                Descripción del Cultivo
              </label>
              <textarea
                id="modal-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={cargando}
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
                  disabled={cargando}
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
                  disabled={cargando}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
                />
              </div>
            </div>

            {/* Imagen Upload */}
            <div>
              <label className="mb-2 block text-sm font-bold text-eco-green-dark">Imagen del Producto</label>
              <div className="flex gap-4 items-center">
                {imagenVistaPrevia && (
                  <div className="h-16 w-16 overflow-hidden rounded-eco-sm border border-eco-green-light bg-slate-50 shrink-0">
                    <img src={imagenVistaPrevia} alt="Vista previa" className="h-full w-full object-cover" />
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={referenciaEntradaArchivo}
                    onChange={alCambiarImagen}
                    disabled={cargando}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => referenciaEntradaArchivo.current?.click()}
                    disabled={cargando}
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:border-eco-green-primary cursor-pointer"
                  >
                    {imagenVistaPrevia ? '📷 Cambiar Imagen' : '📁 Subir Imagen'}
                  </button>
                  <p className="mt-1.5 text-xs text-slate-400">Archivos permitidos: JPG, PNG. Máx 5MB.</p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-eco-green-light">
              <button
                type="button"
                onClick={alCerrar}
                disabled={cargando}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-sm transition hover:bg-eco-green-dark disabled:opacity-60 cursor-pointer"
              >
                {cargando ? 'Guardando...' : esEdicion ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}
