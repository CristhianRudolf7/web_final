import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { parcelasData, lecturasData } from '../data/parcelas'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function ParcelaDetalle() {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [filtroActivo, setFiltroActivo] = useState(false)
  const [fechaInicioAplicada, setFechaInicioAplicada] = useState('')
  const [fechaFinAplicada, setFechaFinAplicada] = useState('')

  // UUID Validation
  if (!uuid || !UUID_REGEX.test(uuid)) {
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark"
          >
            ← Volver a Parcelas
          </button>
        </div>
      </div>
    )
  }

  const parcela = parcelasData.find((p) => p.id === uuid)

  // Parcela not found
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark"
          >
            ← Volver a Parcelas
          </button>
        </div>
      </div>
    )
  }

  // Get lecturas for this parcela
  const lecturasParcelaRaw = lecturasData
    .filter((l) => l.parcela === parcela.id)
    .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())

  // Apply date filter
  const lecturasFiltradas = filtroActivo
    ? lecturasParcelaRaw.filter((l) => {
        const fecha = new Date(l.fecha_registro)
        const inicio = fechaInicioAplicada ? new Date(fechaInicioAplicada) : null
        const fin = fechaFinAplicada ? new Date(fechaFinAplicada + 'T23:59:59Z') : null
        if (inicio && fecha < inicio) return false
        if (fin && fecha > fin) return false
        return true
      })
    : lecturasParcelaRaw

  const handleFiltrar = () => {
    setFechaInicioAplicada(fechaInicio)
    setFechaFinAplicada(fechaFin)
    setFiltroActivo(true)
  }

  const handleLimpiarFiltro = () => {
    setFechaInicio('')
    setFechaFin('')
    setFechaInicioAplicada('')
    setFechaFinAplicada('')
    setFiltroActivo(false)
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

  // Color coding helpers
  const tempColor = (t: number) => {
    if (t > 30 || t < 5) return 'text-red-600 font-bold'
    return 'text-slate-700'
  }

  const humedadColor = (h: number) => {
    if (h < 30) return 'text-amber-600 font-bold'
    return 'text-slate-700'
  }

  const phColor = (ph: number) => {
    if (ph > 8 || ph < 5) return 'text-red-600 font-bold'
    return 'text-slate-700'
  }

  // Export CSV (filtered lecturas only)
  const descargarCSV = () => {
    const headers = ['Fecha', 'Temperatura (°C)', 'Humedad (%)', 'pH']
    const rows = lecturasFiltradas.map((l) => [l.fecha_registro, l.temperatura, l.humedad, l.ph])
    const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lecturas_${parcela.nombre.replace(/\s+/g, '_')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export JSON (filtered lecturas only)
  const descargarJSON = () => {
    const jsonContent = JSON.stringify(lecturasFiltradas, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lecturas_${parcela.nombre.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/parcelas')}
        className="inline-flex items-center gap-1 text-sm font-bold text-eco-green-primary hover:text-eco-green-dark transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a Parcelas
      </button>

      {/* Parcela Header Card */}
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
            <p className="text-xs font-semibold text-eco-green-dark uppercase tracking-wide">Fecha de Creación</p>
            <p className="mt-1 text-sm font-bold text-slate-700">📅 {formatFechaCorta(parcela.fecha_creacion)}</p>
          </div>
          <div className="rounded-eco-sm bg-eco-green-light/40 p-3">
            <p className="text-xs font-semibold text-eco-green-dark uppercase tracking-wide">Lecturas Registradas</p>
            <p className="mt-1 text-sm font-bold text-slate-700">📊 {lecturasParcelaRaw.length} lecturas</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-extrabold text-eco-green-dark mb-4">Historial de Sensores</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-eco-sm focus:ring-2 focus:ring-eco-green-primary focus:border-transparent outline-none text-sm transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-eco-sm focus:ring-2 focus:ring-eco-green-primary focus:border-transparent outline-none text-sm transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFiltrar}
              className="rounded-xl bg-eco-green-primary px-5 py-2 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark text-sm"
            >
              Filtrar
            </button>
            {filtroActivo && (
              <button
                onClick={handleLimpiarFiltro}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-500 transition hover:bg-slate-50 text-sm"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sensor Data Table */}
      {lecturasFiltradas.length === 0 ? (
        <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
          <span className="text-5xl">📡</span>
          <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Sin Lecturas</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            No se encontraron lecturas de sensores para el rango de fechas seleccionado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-eco-lg border border-slate-100 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-eco-green-light/50 text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Temperatura (°C)</th>
                <th className="px-6 py-4">Humedad (%)</th>
                <th className="px-6 py-4">pH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {lecturasFiltradas.map((lectura) => (
                <tr key={lectura.id} className="transition hover:bg-eco-green-light/30">
                  <td className="px-6 py-4 text-slate-600">{formatFecha(lectura.fecha_registro)}</td>
                  <td className={`px-6 py-4 ${tempColor(lectura.temperatura)}`}>
                    🌡️ {lectura.temperatura.toFixed(1)}°C
                  </td>
                  <td className={`px-6 py-4 ${humedadColor(lectura.humedad)}`}>
                    💧 {lectura.humedad.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 ${phColor(lectura.ph)}`}>
                    🧪 {lectura.ph.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Download Buttons */}
      {lecturasFiltradas.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={descargarCSV}
            className="flex items-center justify-center gap-2 rounded-xl bg-eco-green-primary px-5 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar CSV
          </button>
          <button
            onClick={descargarJSON}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-eco-green-primary px-5 py-3 font-bold text-eco-green-primary transition hover:bg-eco-green-primary hover:text-white text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar JSON
          </button>
        </div>
      )}
    </div>
  )
}
