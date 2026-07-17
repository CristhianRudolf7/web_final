import { Link } from 'react-router-dom'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  return (
    <Link to={`/productos/${producto.id}`} className="group block overflow-hidden rounded-eco-md border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="aspect-[4/3] overflow-hidden bg-eco-green-light">
        <img src={producto.imagenUrl} alt={producto.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-eco-green-primary">Producto local</p>
        <h3 className="text-lg font-bold text-eco-green-dark">{producto.nombre}</h3>
        <div className="mt-4 flex items-center justify-between"><span className="text-lg font-extrabold text-eco-green-primary">S/ {producto.precio.toFixed(2)}</span><span className="text-sm font-semibold text-slate-500">Ver detalle →</span></div>
      </div>
    </Link>
  )
}
