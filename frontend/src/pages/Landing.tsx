import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ProductoCard } from '../components/ProductoCard'
import type { Producto } from '../types'

export function Landing() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true)
        setError('')
        const respuesta = await axios.get<Producto[]>('/api/productos/')
        setProductos(respuesta.data)
      } catch (err) {
        console.error('Error al cargar productos para la landing:', err)
        setError('No se pudieron cargar los productos del catálogo.')
      } finally {
        setCargando(false)
      }
    }

    cargarProductos()
  }, [])

  return (
    <>
      {/* Sección Hero: Reducida en altura, manteniendo el ancho y diseño responsivo */}
      <section className="relative overflow-hidden bg-eco-green-light/55">
        <div className="section-shell grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-[1.1fr_.9fr] lg:py-12">
          <div className="relative z-10">
            <p className="eyebrow mb-3">Del campo a tu mesa</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-.04em] text-eco-green-dark sm:text-5xl lg:text-6xl">
              Cultivos con historia. Compras con propósito.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Conectamos a agricultores locales con familias y negocios que valoran el origen, la calidad y el trabajo justo.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#productos"
                className="rounded-full bg-eco-green-primary px-6 py-3 font-bold text-white shadow-md shadow-eco-green-primary/20 transition hover:bg-eco-green-dark text-sm sm:text-base cursor-pointer"
              >
                Explorar productos
              </a>
              <Link
                to="/login"
                className="rounded-full border border-eco-green-primary px-6 py-3 font-bold text-eco-green-primary transition hover:bg-white text-sm sm:text-base"
              >
                Soy agricultor
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=85"
                alt="Agricultora revisando un cultivo"
                className="h-56 w-full object-cover sm:h-64 lg:h-72"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-3.5 shadow-lg border border-slate-100 hidden sm:block">
              <p className="text-2xl font-extrabold text-eco-green-primary">+120</p>
              <p className="text-xs font-semibold text-slate-500">familias agricultoras</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Productos desde la Base de Datos */}
      <section id="productos" className="section-shell py-12 lg:py-16">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-2">Marketplace local</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-eco-green-dark sm:text-4xl">
              Lo mejor de nuestra tierra
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">
            Compra directo a quienes cultivan. Cada producto proviene directamente del inventario en vivo del agricultor.
          </p>
        </div>

        {cargando ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-green-primary border-t-transparent mx-auto"></div>
              <p className="mt-3 text-sm font-semibold text-slate-500">Cargando productos del catálogo...</p>
            </div>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        ) : productos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <span className="text-4xl">🌾</span>
            <h3 className="mt-3 text-lg font-bold text-eco-green-dark">Catálogo vacío</h3>
            <p className="mt-1 text-sm text-slate-500">
              Actualmente no hay productos registrados en el marketplace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
