import { Link } from 'react-router-dom'

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-eco-lg bg-gradient-to-r from-eco-green-dark to-eco-green-primary p-6 text-white shadow-soft md:p-8">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Espacio del Agricultor
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">¡Bienvenido a tu panel de control!</h1>
        <p className="mt-2 text-sm text-eco-green-light max-w-xl">
          Desde aquí puedes gestionar tu inventario de cultivos locales, monitorear la telemetría de tus parcelas de tierra y ver tus estadísticas de producción.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-eco-sm bg-eco-green-light text-2xl">🌾</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mi Inventario</p>
              <h3 className="text-xl font-extrabold text-eco-green-dark">Gestión de Productos</h3>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-5">
            Agrega nuevos productos agrícolas, edita precios locales y actualiza el stock disponible en tu inventario.
          </p>
          <Link
            to="/dashboard/productos"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-eco-green-primary transition hover:text-eco-green-dark"
          >
            Ir a Productos →
          </Link>
        </div>

        {/* Card 2 */}
        <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-eco-sm bg-eco-green-light text-2xl">🚜</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mis Tierras</p>
              <h3 className="text-xl font-extrabold text-eco-green-dark">Gestión de Parcelas</h3>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-5">
            Visualiza tus parcelas en un mapa interactivo y dibuja sublotes para organizar tu siembra de manera eficiente.
          </p>
          <Link
            to="/dashboard/parcelas"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-eco-green-primary transition hover:text-eco-green-dark"
          >
            Ver Mis Parcelas →
          </Link>
        </div>

        {/* Card 3 */}
        <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-eco-sm bg-eco-green-light text-2xl">👤</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mi Cuenta</p>
              <h3 className="text-xl font-extrabold text-eco-green-dark">Perfil de Agricultor</h3>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-5">
            Mantén tu correo, teléfono y nombre actualizados para que los clientes del marketplace puedan contactarte.
          </p>
          <Link
            to="/dashboard/perfil"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-eco-green-primary transition hover:text-eco-green-dark"
          >
            Administrar Cuenta →
          </Link>
        </div>
      </div>
    </div>
  )
}
