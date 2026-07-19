import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Dashboard } from '../pages/Dashboard'
import { DetalleProducto } from '../pages/DetalleProducto'
import { Landing } from '../pages/Landing'
import { Login } from '../pages/Login'
import { ProductosPanel } from '../pages/ProductosPanel'
import { ParcelasPanel } from '../pages/ParcelasPanel'
import { ParcelaDetalle } from '../pages/ParcelaDetalle'
import { Perfil } from '../pages/Perfil'

// Placeholders para sprints futuros
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-eco-lg border border-dashed border-slate-200 bg-white shadow-soft">
      <span className="text-4xl">🔧</span>
      <h2 className="text-xl font-extrabold text-eco-green-dark">{label}</h2>
      <p className="text-sm text-slate-500">Esta sección estará disponible en el siguiente sprint.</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout (Header + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/productos/:id" element={<DetalleProducto />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Private Dashboard Layout (Header Privado + Sidebar) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<ProductosPanel />} />
          <Route path="parcelas" element={<ParcelasPanel />} />
          <Route path="parcelas/:uuid" element={<ParcelaDetalle />} />
          <Route path="datos-parcelas" element={<ComingSoon label="Datos de Parcelas" />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
