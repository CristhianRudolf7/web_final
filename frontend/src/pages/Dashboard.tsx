import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardResumen } from '../types'

const API_BASE = '/api'

const COLOR_TEMPERATURA = '#EF6C00'
const COLOR_HUMEDAD = '#1E88E5'
const COLOR_PH = '#8E24AA'
const COLOR_RIEGO = '#2E7D32'
const COLOR_HUMEDAD_PROMEDIO = '#1E88E5'

function formatearFechaCorta(iso: string) {
  return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function Dashboard() {
  const [datos, setDatos] = useState<DashboardResumen | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<string>('todas')

  useEffect(() => {
    axios
      .get<DashboardResumen>(`${API_BASE}/dashboard/resumen/`, { withCredentials: true })
      .then((response) => setDatos(response.data))
      .catch(() => setError('No se pudieron cargar las estadísticas del dashboard.'))
      .finally(() => setCargando(false))
  }, [])

  const parcelasDisponibles = useMemo(() => {
    if (!datos) return []
    const nombresUnicos = new Map<string, string>()
    datos.historico.forEach((lectura) => nombresUnicos.set(lectura.parcela_id, lectura.parcela_nombre))
    return Array.from(nombresUnicos, ([id, nombre]) => ({ id, nombre }))
  }, [datos])

  const historicoFiltrado = useMemo(() => {
    if (!datos) return []
    const lecturas =
      parcelaSeleccionada === 'todas'
        ? datos.historico
        : datos.historico.filter((lectura) => lectura.parcela_id === parcelaSeleccionada)

    return lecturas.map((lectura) => ({
      fecha: formatearFechaCorta(lectura.fecha_hora),
      Temperatura: lectura.temperatura,
      Humedad: lectura.humedad,
      pH: lectura.ph,
    }))
  }, [datos, parcelaSeleccionada])

  const riegoVsHumedad = useMemo(
    () =>
      (datos?.riego_vs_humedad ?? []).map((item) => ({
        parcela: item.parcela_nombre,
        'Riego (L)': item.litros_riego_totales,
        'Humedad promedio (%)': item.humedad_promedio ?? 0,
      })),
    [datos],
  )

  const cultivosProductivos = useMemo(
    () =>
      (datos?.cultivos_productivos ?? []).map((item) => ({
        cultivo: item.nombre,
        'Litros de riego invertidos': item.litros_riego_totales,
      })),
    [datos],
  )

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

      {/* Dashboard Estadístico (Sprint 6) */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Sprint 6</p>
        <h2 className="mt-1 text-2xl font-extrabold text-eco-green-dark">Dashboard estadístico</h2>
        <p className="mt-1 text-sm text-slate-500">
          Evolución de tus sensores, uso de riego y rendimiento de tus cultivos.
        </p>
      </div>

      {cargando && <p className="text-slate-500">Cargando estadísticas…</p>}
      {error && <p className="rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}

      {!cargando && !error && datos && (
        <div className="space-y-8">
          {/* Histórico de temperatura, humedad y pH */}
          <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-eco-green-dark">
                Histórico de temperatura, humedad y pH
              </h3>
              {parcelasDisponibles.length > 0 && (
                <select
                  value={parcelaSeleccionada}
                  onChange={(event) => setParcelaSeleccionada(event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-eco-green-dark outline-none focus:border-eco-green-primary"
                >
                  <option value="todas">Todas las parcelas</option>
                  {parcelasDisponibles.map((parcela) => (
                    <option key={parcela.id} value={parcela.id}>
                      {parcela.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {historicoFiltrado.length === 0 ? (
              <p className="py-12 text-center text-slate-400">
                Todavía no hay lecturas de sensores registradas para graficar.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={historicoFiltrado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} minTickGap={24} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Temperatura" stroke={COLOR_TEMPERATURA} dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Humedad" stroke={COLOR_HUMEDAD} dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="pH" stroke={COLOR_PH} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Comparativa riego vs humedad */}
          <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-lg font-bold text-eco-green-dark">
              Volumen de riego (litros) vs. estado de humedad del suelo
            </h3>

            {riegoVsHumedad.length === 0 ? (
              <p className="py-12 text-center text-slate-400">Aún no hay parcelas con actividad registrada.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={riegoVsHumedad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis dataKey="parcela" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="litros" orientation="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="humedad" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="litros" dataKey="Riego (L)" fill={COLOR_RIEGO} radius={[6, 6, 0, 0]} />
                  <Bar
                    yAxisId="humedad"
                    dataKey="Humedad promedio (%)"
                    fill={COLOR_HUMEDAD_PROMEDIO}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Cultivos más productivos */}
          <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
            <h3 className="mb-1 text-lg font-bold text-eco-green-dark">Cultivos más productivos</h3>
            <p className="mb-4 text-sm text-slate-500">
              Ranking según inversión de riego y cantidad de parcelas donde se cultiva actualmente.
            </p>

            {cultivosProductivos.length === 0 ? (
              <p className="py-12 text-center text-slate-400">
                Asigna un cultivo actual a tus parcelas para ver este ranking.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, cultivosProductivos.length * 60)}>
                <BarChart data={cultivosProductivos} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="cultivo" tick={{ fontSize: 12 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="Litros de riego invertidos" fill={COLOR_RIEGO} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
