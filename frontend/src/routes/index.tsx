import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Dashboard } from '../pages/Dashboard'
import { DetalleProducto } from '../pages/DetalleProducto'
import { Landing } from '../pages/Landing'
import { Login } from '../pages/Login'

export function AppRoutes() { return <BrowserRouter><Routes><Route element={<Layout />}><Route path="/" element={<Landing />} /><Route path="/productos/:id" element={<DetalleProducto />} /><Route path="/login" element={<Login />} /><Route path="/dashboard" element={<Dashboard />} /></Route></Routes></BrowserRouter> }
