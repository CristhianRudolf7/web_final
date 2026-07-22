import { Link } from 'react-router-dom'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const precioNumerico = Number(producto.precio) || 0
  const imagenUrl = producto.imagenUrl || producto.imagen || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80'

  return (
    <Link
      to={`/productos/${producto.id}`}
      className="group block overflow-hidden rounded-eco-md border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="aspect-[4/3] overflow-hidden bg-eco-green-light relative">
        <img
          src={imagenUrl}
          alt={producto.nombre}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {producto.stock <= 0 && (
          <span className="absolute top-2 right-2 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
            Agotado
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-eco-green-primary">
          {producto.agricultorNombre ? `Fundo de ${producto.agricultorNombre}` : 'Producto local'}
        </p>
        <h3 className="text-lg font-bold text-eco-green-dark line-clamp-1">{producto.nombre}</h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
          {producto.descripcion}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-eco-green-primary">
            S/ {precioNumerico.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-slate-500 group-hover:text-eco-green-primary transition">
            Ver detalle →
          </span>
        </div>
      </div>
    </Link>
  )
}
