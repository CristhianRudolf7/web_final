import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parcelasData } from '../data/parcelas'
import { productos as productosData } from '../data/productos'
import type { Parcela } from '../types'

export function ParcelasPanel() {
  const navigate = useNavigate()

  const [parcelas, setParcelas] = useState<Parcela[]>(parcelasData)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCultivo, setFiltroCultivo] = useState('')
  const [modalAsignar, setModalAsignar] = useState(false)
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<Parcela | null>(null)

  // Get unique cultivo names for filter dropdown
  const cultivosUnicos = Array.from(
    new Set(parcelas.map((p) => p.cultivo_nombre).filter(Boolean))
  ) as string[]

  // Filter parcelas
  const parcelasFiltradas = parcelas.filter((p) => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCultivo = filtroCultivo === '' || p.cultivo_nombre === filtroCultivo
    return coincideNombre && coincideCultivo
  })

  const handleAsignarClick = (parcela: Parcela) => {
    setParcelaSeleccionada(parcela)
    setModalAsignar(true)
  }

  const handleAsignarProducto = (productoId: string, productoNombre: string) => {
    if (!parcelaSeleccionada) return
    setParcelas((prev) =>
      prev.map((p) =>
        p.id === parcelaSeleccionada.id
          ? { ...p, cultivo_actual: productoId, cultivo_nombre: productoNombre }
          : p
      )
    )
    setModalAsignar(false)
    setParcelaSeleccionada(null)
  }

  const formatFecha = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Export CSV
  const exportarCSV = () => {
    const headers = ['Nombre', 'Ubicación', 'Cultivo Actual', 'Agricultor', 'Fecha Creación']
    const rows = parcelasFiltradas.map((p) => [
      p.nombre,
      p.ubicacion,
      p.cultivo_nombre || 'Sin asignar',
      p.agricultor_nombre,
      p.fecha_creacion,
    ])
    const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'parcelas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export JSON
  const exportarJSON = () => {
    const jsonContent = JSON.stringify(parcelasFiltradas, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'parcelas.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-eco-green-light pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Mis Parcelas</p>
          <h1 className="text-3xl font-extrabold text-eco-green-dark mt-1">Gestión de Parcelas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona tus parcelas y datos de sensores
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 rounded-xl bg-eco-green-primary px-4 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar CSV
          </button>
          <button
            onClick={exportarJSON}
            className="flex items-center gap-2 rounded-xl border-2 border-eco-green-primary px-4 py-3 font-bold text-eco-green-primary transition hover:bg-eco-green-primary hover:text-white text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar parcela por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-eco-sm focus:ring-2 focus:ring-eco-green-primary focus:border-transparent outline-none text-sm transition"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={filtroCultivo}
            onChange={(e) => setFiltroCultivo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-eco-sm focus:ring-2 focus:ring-eco-green-primary focus:border-transparent outline-none text-sm transition bg-white"
          >
            <option value="">Todos los cultivos</option>
            {cultivosUnicos.map((cultivo) => (
              <option key={cultivo} value={cultivo}>
                {cultivo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {parcelasFiltradas.length === 0 ? (
        <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
          <span className="text-5xl">🌱</span>
          <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Sin Resultados</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            No se encontraron parcelas con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-eco-lg border border-slate-100 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-eco-green-light/50 text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Cultivo Actual</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {parcelasFiltradas.map((parcela) => (
                <tr key={parcela.id} className="transition hover:bg-eco-green-light/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-eco-green-dark">{parcela.nombre}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{parcela.agricultor_nombre}</div>
                  </td>
                  <td className="px-6 py-4">{parcela.ubicacion}</td>
                  <td className="px-6 py-4">
                    {parcela.cultivo_nombre ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-eco-green-primary">
                        🌿 {parcela.cultivo_nombre}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatFecha(parcela.fecha_creacion)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Ver Detalle */}
                      <button
                        onClick={() => navigate(`/dashboard/parcelas/${parcela.id}`)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition"
                        title="Ver Detalle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {/* Ver Mapa */}
                      <button
                        onClick={() => navigate(`/dashboard/parcelas/${parcela.id}/mapa`)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition"
                        title="Ver Mapa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                      </button>

                      {/* Asignar Producto */}
                      <button
                        onClick={() => handleAsignarClick(parcela)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition"
                        title="Asignar Producto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Asignar Producto */}
      {modalAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-eco-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-eco-green-dark">
                Asignar Producto
              </h2>
              <button
                onClick={() => {
                  setModalAsignar(false)
                  setParcelaSeleccionada(null)
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Selecciona un producto para asignar a <strong className="text-eco-green-dark">{parcelaSeleccionada?.nombre}</strong>
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {productosData.map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => handleAsignarProducto(producto.id, producto.nombre)}
                  className="w-full flex items-center gap-3 rounded-eco-sm border border-slate-100 p-3 text-left transition hover:bg-eco-green-light/30 hover:border-eco-green-primary"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-eco-green-light bg-slate-50">
                    {producto.imagenUrl ? (
                      <img src={producto.imagenUrl} alt={producto.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg bg-eco-green-light text-eco-green-primary">🌽</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-eco-green-dark">{producto.nombre}</div>
                    <div className="text-xs text-slate-400">{producto.agricultorNombre}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setModalAsignar(false)
                setParcelaSeleccionada(null)
              }}
              className="mt-4 w-full rounded-eco-sm border border-slate-200 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
