import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import type { Producto } from '../types'

export function DetalleProducto() {
  const { id } = useParams<{ id: string }>()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false)

  useEffect(() => {
    if (!id) return
    const cargarDetalle = async () => {
      try {
        setCargando(true)
        setError('')
        const respuesta = await axios.get<Producto>(`/api/productos/${id}/`)
        setProducto(respuesta.data)
      } catch (err) {
        console.error('Error al cargar el producto:', err)
        setError('No se pudo encontrar el producto solicitado.')
      } finally {
        setCargando(false)
      }
    }

    cargarDetalle()
  }, [id])

  if (cargando) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-green-primary border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm font-semibold text-slate-500">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <section className="section-shell py-28 text-center">
        <p className="eyebrow mb-3">Producto no encontrado</p>
        <h1 className="text-4xl font-extrabold text-eco-green-dark">No pudimos encontrar ese producto.</h1>
        <Link to="/" className="mt-8 inline-block rounded-full bg-eco-green-primary px-6 py-3 font-bold text-white">
          Volver al marketplace
        </Link>
      </section>
    )
  }

  const precioNumerico = Number(producto.precio) || 0
  const imagenUrl = producto.imagenUrl || producto.imagen || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80'
  const contactoCelular = producto.agricultorContacto || ''
  const celularLimpio = contactoCelular.replace(/\D/g, '')

  return (
    <section className="section-shell py-10 lg:py-16">
      <Link to="/" className="mb-8 inline-block text-sm font-bold text-eco-green-primary hover:text-eco-green-dark transition">
        ← Volver a productos
      </Link>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-eco-lg bg-eco-green-light shadow-soft">
          <img src={imagenUrl} alt={producto.nombre} className="aspect-square h-full w-full object-cover" />
        </div>
        <div className="pt-2">
          <p className="eyebrow mb-3">
            {producto.agricultorNombre ? `Cultivo de ${producto.agricultorNombre}` : 'Producto local'}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-eco-green-dark sm:text-5xl">{producto.nombre}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{producto.descripcion}</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-eco-green-primary">S/ {precioNumerico.toFixed(2)}</span>
            <span className="mb-1 text-sm text-slate-500">por unidad</span>
          </div>
          <div className="mt-8 grid gap-3 rounded-eco-md bg-eco-green-light/60 p-5 text-sm">
            <p><strong className="text-eco-green-dark">Stock disponible:</strong> {producto.stock} unidades</p>
            {producto.agricultorNombre && <p><strong className="text-eco-green-dark">Agricultor:</strong> {producto.agricultorNombre}</p>}
            {producto.agricultorContacto && <p><strong className="text-eco-green-dark">Teléfono de contacto:</strong> {producto.agricultorContacto}</p>}
          </div>

          <button
            onClick={() => setModalContactoAbierto(true)}
            className="mt-8 w-full rounded-full bg-eco-green-primary px-7 py-4 font-bold text-white shadow-lg shadow-eco-green-primary/20 transition hover:bg-eco-green-dark cursor-pointer text-center"
          >
            Contactar agricultor
          </button>
        </div>
      </div>

      {/* Modal de Información de Contacto */}
      {modalContactoAbierto &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
              onClick={() => setModalContactoAbierto(false)}
            />
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
              <div className="relative w-full max-w-md transform overflow-hidden rounded-eco-lg border border-slate-100 bg-white p-6 text-left shadow-2xl transition-all sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setModalContactoAbierto(false)}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3 border-b border-eco-green-light pb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-eco-green-light text-2xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-eco-green-dark">Información de Contacto</h3>
                    <p className="text-xs text-slate-500">Contacta directamente con el productor</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <img src={imagenUrl} alt={producto.nombre} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-eco-green-dark">{producto.nombre}</h4>
                      <p className="text-xs font-semibold text-eco-green-primary">S/ {precioNumerico.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl bg-eco-green-light/40 p-4 text-sm">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Agricultor Responsable</p>
                      <p className="text-base font-extrabold text-eco-green-dark">
                        {producto.agricultorNombre || 'Agricultor no especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Número Celular / Teléfono</p>
                      <p className="text-base font-bold text-slate-700">
                        📱 {contactoCelular || 'No registrado'}
                      </p>
                    </div>
                  </div>

                  {celularLimpio && (
                    <div className="flex flex-col gap-2.5 pt-2">
                      <a
                        href={`https://wa.me/51${celularLimpio}?text=${encodeURIComponent(`Hola ${producto.agricultorNombre || ''}, vi tu producto "${producto.nombre}" en EcoPlataforma y me gustaría comprar.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
                      >
                        💬 Enviar WhatsApp
                      </a>
                      <a
                        href={`tel:${celularLimpio}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        📞 Llamar por Teléfono
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setModalContactoAbierto(false)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}
