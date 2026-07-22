import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from '../components/Layout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Dashboard } from '../pages/Dashboard'
import { DetalleProducto } from '../pages/DetalleProducto'
import { Landing } from '../pages/Landing'
import { Login } from '../pages/Login'
import { Registro } from '../pages/Registro'
import { ProductosPanel } from '../pages/ProductosPanel'
import { ParcelasPanel } from '../pages/ParcelasPanel'
import { ParcelaDetalle } from '../pages/ParcelaDetalle'
import { MapaInteractivo } from '../pages/MapaInteractivo'
import { Perfil } from '../pages/Perfil'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton duration={5000} />
      <Routes>
        {/* Public Layout (Header + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/productos/:id" element={<DetalleProducto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/crear-cuenta" element={<Registro />} />
        </Route>

        {/* Private Dashboard Layout (Header Privado + Sidebar) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<ProductosPanel />} />
          <Route path="parcelas" element={<ParcelasPanel />} />
          <Route path="parcelas/:uuid" element={<ParcelaDetalle />} />
          <Route path="parcelas/:uuid/mapa" element={<MapaInteractivo />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
