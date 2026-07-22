import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LecturaSensor, Parcela, RegistroActividad } from '../types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function ParcelaDetalle() {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()

  const [parcela, setParcela] = useState<Parcela | null>(null)
  const [lecturas, setLecturas] = useState<LecturaSensor[]>([])
  const [riegos, setRiegos] = useState<RegistroActividad[]>([])
  const [cargando, setCargando] = useState(true)

  const [tabActivo, setTabActivo] = useState<'sensores' | 'riego'>('sensores')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [filtroActivo, setFiltroActivo] = useState(false)

  const uuidValido = Boolean(uuid && UUID_REGEX.test(uuid))

  const cargarDatosParcela = async (fInicio = '', fFin = '') => {
    if (!uuid || !uuidValido) return
    setCargando(true)
    try {
      const params: Record<string, string> = {}
      if (fInicio) params.fecha_inicio = fInicio
      if (fFin) params.fecha_fin = fFin

      const [resParcela, resLecturas, resRiegos] = await Promise.all([
        axios.get<Parcela>(`/api/parcelas/${uuid}/`, { withCredentials: true }),
        axios.get<LecturaSensor[]>(`/api/parcelas/${uuid}/historico/`, {
          params,
          withCredentials: true,
        }),
        axios.get<RegistroActividad[]>(`/api/parcelas/${uuid}/actividades/`, {
          params: { ...params, tipo: 'riego' },
          withCredentials: true,
        }),
      ])

      setParcela(resParcela.data)
      setLecturas(resLecturas.data)
      setRiegos(resRiegos.data)
    } catch (err: any) {
      console.error(err)
      toast.error('No se pudo cargar la información de la parcela.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (uuidValido) {
      cargarDatosParcela()
    } else {
      setCargando(false)
    }
  }, [uuid])

  // Datos formateados para los gráficos de líneas
  const datosGraficoSensores = useMemo(() => {
    return [...lecturas]
      .reverse()
      .map((l) => ({
        fecha: new Date(l.fecha_registro).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
        }),
        temperatura: Number(l.temperatura),
        humedad: Number(l.humedad),
        ph: Number(l.ph),
      }))
  }, [lecturas])

  const datosGraficoRiego = useMemo(() => {
    return [...riegos]
      .reverse()
      .map((r) => ({
        fecha: new Date(r.fecha_hora).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
        }),
        litros: Number(r.litros_riego) || 0,
      }))
  }, [riegos])

  // Validación de UUID
  if (!uuidValido) {
    return (
      <div className="space-y-6">
        <div className="rounded-eco-lg border border-dashed border-red-200 bg-white px-6 py-16 text-center shadow-soft">
          <span className="text-5xl">⚠️</span>
          <h3 className="mt-4 text-lg font-bold text-red-600">Identificador Inválido</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            El UUID proporcionado no es válido. Verifica la URL e inténtalo de nuevo.
          </p>
          <button
            onClick={() => navigate('/dashboard/parcelas')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md transition hover:bg-eco-green-dark cursor-pointer"
          >
            ← Volver a Parcelas
          </button>
        </div>
      </div>
    )
  }

  if (cargando && !parcela) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-green-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-semibold text-slate-500">Cargando información de la parcela...</p>
        </div>
      </div>
    )
  }

  if (!parcela) {
    return (
      <div className="space-y-6">
        <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
          <span className="text-5xl">🔍</span>
          <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Parcela no encontrada</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            No se encontró ninguna parcela con el identificador proporcionado.
          </p>
          <button
            onClick={() => navigate('/dashboard/parcelas')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md transition hover:bg-eco-green-dark cursor-pointer"
          >
            ← Volver a Parcelas
          </button>
        </div>
      </div>
    )
  }

  const handleFiltrar = () => {
    setFiltroActivo(true)
    cargarDatosParcela(fechaInicio, fechaFin)
  }

  const handleLimpiarFiltro = () => {
    setFechaInicio('')
    setFechaFin('')
    setFiltroActivo(false)
    cargarDatosParcela()
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const formatFechaCorta = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const tempColor = (t: number) => (t > 30 || t < 5 ? 'text-red-600 font-bold' : 'text-slate-700')
  const humedadColor = (h: number) => (h < 30 ? 'text-amber-600 font-bold' : 'text-slate-700')
  const phColor = (ph: number) => (ph > 8 || ph < 5 ? 'text-red-600 font-bold' : 'text-slate-700')

  const descargarCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []

    if (tabActivo === 'sensores') {
      headers = ['Fecha', 'Temperatura (°C)', 'Humedad (%)', 'pH']
      rows = lecturas.map((l) => [l.fecha_registro, l.temperatura, l.humedad, l.ph])
    } else {
      headers = ['Fecha y Hora', 'Litros de Riego']
      rows = riegos.map((r) => [r.fecha_hora, r.litros_riego ?? 0])
    }

    const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tabActivo}_${parcela.nombre.replace(/\s+/g, '_')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const descargarJSON = () => {
    const dataExportar = tabActivo === 'sensores' ? lecturas : riegos
    const jsonContent = JSON.stringify(dataExportar, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tabActivo}_${parcela.nombre.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button
        onClick={() => navigate('/dashboard/parcelas')}
        className="inline-flex items-center gap-1 text-sm font-bold text-eco-green-primary hover:text-eco-green-dark transition cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a Parcelas
      </button>

      {/* Cabecera de la Parcela */}
      <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Detalle de Parcela</p>
            <h1 className="text-3xl font-extrabold text-eco-green-dark mt-1">{parcela.nombre}</h1>
            <p className="mt-1 text-sm text-slate-500">{parcela.agricultor_nombre}</p>
          </div>
          <div className="shrink-0">
            {parcela.cultivo_nombre ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-eco-green-primary">
                🌿 {parcela.cultivo_nombre}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                Sin cultivo asignado
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-eco-sm bg-eco-green-light/40 p-3">
            <p className="text-xs font-semibold text-eco-green-dark uppercase tracking-wide">Ubicación</p>
            <p className="mt-1 text-sm font-bold text-slate-700">📍 {parcela.ubicacion}</p>
          </div>
          <div className="rounded-eco-sm bg-eco-green-light/40 p-3">
            <p className="text-xs font-semibold text-eco-green-dark uppercase tracking-wide">Dimensiones del Terreno</p>
            <p className="mt-1 text-sm font-bold text-slate-700">{parcela.ancho} m × {parcela.largo} m</p>
          </div>
          <div className="rounded-eco-sm bg-eco-green-light/40 p-3">
            <p className="text-xs font-semibold text-eco-green-dark uppercase tracking-wide">Fecha de Creación</p>
            <p className="mt-1 text-sm font-bold text-slate-700">📅 {formatFechaCorta(parcela.fecha_creacion)}</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector: Sensores vs Riego */}
      <div className="flex border-b border-slate-200 gap-2 bg-white rounded-t-eco-lg px-4 pt-2 shadow-soft">
        <button
          onClick={() => setTabActivo('sensores')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
            tabActivo === 'sensores'
              ? 'border-eco-green-primary text-eco-green-primary bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          📡 Información de Sensores
        </button>
        <button
          onClick={() => setTabActivo('riego')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
            tabActivo === 'riego'
              ? 'border-eco-green-primary text-eco-green-primary bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          💧 Información de Riego
        </button>
      </div>

      {/* Filtro por Rango de Fechas */}
      <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-extrabold text-eco-green-dark mb-4">
          {tabActivo === 'sensores' ? 'Histórico de Lecturas de Sensores' : 'Histórico de Actividades de Riego'}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-eco-sm focus:ring-2 focus:ring-eco-green-primary outline-none text-sm transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-eco-sm focus:ring-2 focus:ring-eco-green-primary outline-none text-sm transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFiltrar}
              className="rounded-xl bg-eco-green-primary px-5 py-2 font-bold text-white shadow-md transition hover:bg-eco-green-dark text-sm cursor-pointer"
            >
              Filtrar
            </button>
            {filtroActivo && (
              <button
                onClick={handleLimpiarFiltro}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-500 transition hover:bg-slate-50 text-sm cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO TAB 1: SENSORES */}
      {tabActivo === 'sensores' && (
        <>
          {/* Tabla de Sensores */}
          {lecturas.length === 0 ? (
            <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
              <span className="text-5xl">📡</span>
              <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Sin Lecturas de Sensores</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                No se encontraron registros de sensores para el rango de fechas seleccionado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-eco-lg border border-slate-100 bg-white shadow-soft">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-eco-green-light/50 text-xs font-bold uppercase tracking-wider text-eco-green-dark">
                  <tr>
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4">Temperatura (°C)</th>
                    <th className="px-6 py-4">Humedad (%)</th>
                    <th className="px-6 py-4">pH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {lecturas.map((lectura) => {
                    const tempNum = Number(lectura.temperatura)
                    const humedadNum = Number(lectura.humedad)
                    const phNum = Number(lectura.ph)
                    return (
                      <tr key={lectura.id} className="transition hover:bg-eco-green-light/30">
                        <td className="px-6 py-4 text-slate-600">{formatFecha(lectura.fecha_registro)}</td>
                        <td className={`px-6 py-4 ${tempColor(tempNum)}`}>
                          🌡️ {tempNum.toFixed(1)}°C
                        </td>
                        <td className={`px-6 py-4 ${humedadColor(humedadNum)}`}>
                          💧 {humedadNum.toFixed(1)}%
                        </td>
                        <td className={`px-6 py-4 ${phColor(phNum)}`}>
                          🧪 {phNum.toFixed(1)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Gráfico de Línea de Sensores */}
          {lecturas.length > 0 && (
            <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
              <h3 className="text-base font-extrabold text-eco-green-dark mb-4">
                📈 Tendencia Histórica de Sensores (Temperatura, Humedad, pH)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGraficoSensores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperatura" name="Temperatura (°C)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="humedad" name="Humedad (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="ph" name="pH" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* CONTENIDO TAB 2: RIEGO */}
      {tabActivo === 'riego' && (
        <>
          {/* Tabla de Riego */}
          {riegos.length === 0 ? (
            <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
              <span className="text-5xl">💧</span>
              <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Sin Registros de Riego</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                No se encontraron actividades de riego registradas para el rango de fechas seleccionado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-eco-lg border border-slate-100 bg-white shadow-soft">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-eco-green-light/50 text-xs font-bold uppercase tracking-wider text-eco-green-dark">
                  <tr>
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4">Volumen Aplicado (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {riegos.map((riego) => {
                    const litrosNum = Number(riego.litros_riego) || 0
                    return (
                      <tr key={riego.id} className="transition hover:bg-eco-green-light/30">
                        <td className="px-6 py-4 text-slate-600">{formatFecha(riego.fecha_hora)}</td>
                        <td className="px-6 py-4 font-bold text-eco-green-primary">
                          💧 {litrosNum.toLocaleString('es-PE')} L
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Gráfico de Línea de Riego */}
          {riegos.length > 0 && (
            <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
              <h3 className="text-base font-extrabold text-eco-green-dark mb-4">
                📈 Histórico de Volumen de Riego Aplicado (Litros)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGraficoRiego}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="litros" name="Riego (Litros)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Botones de Descarga */}
      {((tabActivo === 'sensores' && lecturas.length > 0) || (tabActivo === 'riego' && riegos.length > 0)) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={descargarCSV}
            className="flex items-center justify-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar CSV ({tabActivo === 'sensores' ? 'Sensores' : 'Riego'})
          </button>
          <button
            onClick={descargarJSON}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-eco-green-primary px-5 py-3 font-bold text-eco-green-primary transition hover:bg-eco-green-primary hover:text-white text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar JSON ({tabActivo === 'sensores' ? 'Sensores' : 'Riego'})
          </button>
        </div>
      )}
    </div>
  )
}
