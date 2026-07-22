import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import type { Parcela, Producto } from '../types'

export function ParcelasPanel() {
  const navigate = useNavigate()

  // Estados de datos
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroCultivo, setFiltroCultivo] = useState('')

  // Modales
  const [modalCrear, setModalCrear] = useState(false)
  const [modalAsignar, setModalAsignar] = useState(false)
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<Parcela | null>(null)

  // Formulario crear parcela
  const [nuevaNombre, setNuevaNombre] = useState('')
  const [nuevaUbicacion, setNuevaUbicacion] = useState('')
  const [nuevaAncho, setNuevaAncho] = useState('100')
  const [nuevaLargo, setNuevaLargo] = useState('100')
  const [nuevaCultivoId, setNuevaCultivoId] = useState('')

  // Estado de acción
  const [cargandoAccion, setCargandoAccion] = useState(false)
  const [errorModal, setErrorModal] = useState('')

  const cargarDatos = async () => {
    setCargando(true)
    setError('')
    try {
      const [resParcelas, resProductos] = await Promise.all([
        axios.get<Parcela[]>('/api/parcelas/', { withCredentials: true }),
        axios.get<Producto[]>('/api/productos/', { withCredentials: true }),
      ])
      setParcelas(resParcelas.data)
      setProductos(resProductos.data)
    } catch (err: any) {
      console.error('Error al cargar datos de parcelas:', err)
      const msg = 'No se pudieron cargar las parcelas. Por favor, reintenta.'
      setError(msg)
      toast.error(msg)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Cultivos únicos para el filtro desplegable
  const cultivosUnicos = Array.from(
    new Set(parcelas.map((p) => p.cultivo_nombre).filter(Boolean))
  ) as string[]

  // Filtrado de parcelas por búsqueda y cultivo
  const parcelasFiltradas = parcelas.filter((p) => {
    const coincideNombre =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCultivo = filtroCultivo === '' || p.cultivo_nombre === filtroCultivo
    return coincideNombre && coincideCultivo
  })

  // Crear Parcela
  const handleCrearParcela = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorModal('')

    if (!nuevaNombre.trim() || !nuevaUbicacion.trim()) {
      const msg = 'El nombre y la ubicación son obligatorios.'
      setErrorModal(msg)
      toast.error(msg)
      return
    }

    const a = Number(nuevaAncho)
    const l = Number(nuevaLargo)
    if (isNaN(a) || a <= 0 || isNaN(l) || l <= 0) {
      const msg = 'El ancho y el largo deben ser números mayores a cero.'
      setErrorModal(msg)
      toast.error(msg)
      return
    }

    setCargandoAccion(true)
    const nombreGuardar = nuevaNombre.trim()
    try {
      await axios.post(
        '/api/parcelas/',
        {
          nombre: nombreGuardar,
          ubicacion: nuevaUbicacion.trim(),
          ancho: a,
          largo: l,
          cultivo_actual: nuevaCultivoId || null,
        },
        { withCredentials: true }
      )
      setModalCrear(false)
      setNuevaNombre('')
      setNuevaUbicacion('')
      setNuevaAncho('100')
      setNuevaLargo('100')
      setNuevaCultivoId('')
      toast.success(`Parcela "${nombreGuardar}" registrada correctamente.`)
      await cargarDatos()
    } catch (err: any) {
      console.error(err)
      const msg = 'No se pudo crear la parcela. Revisa los datos.'
      setErrorModal(msg)
      toast.error(msg)
    } finally {
      setCargandoAccion(false)
    }
  }

  // Abrir Modal Asignar Producto
  const handleAsignarClick = (parcela: Parcela) => {
    setParcelaSeleccionada(parcela)
    setModalAsignar(true)
  }

  // Guardar asignación de producto
  const handleAsignarProducto = async (productoId: string | null) => {
    if (!parcelaSeleccionada) return
    setCargandoAccion(true)
    const nombrePar = parcelaSeleccionada.nombre
    try {
      await axios.patch(
        `/api/parcelas/${parcelaSeleccionada.id}/`,
        { cultivo_actual: productoId },
        { withCredentials: true }
      )
      setModalAsignar(false)
      setParcelaSeleccionada(null)
      toast.success(productoId ? `Cultivo asignado a "${nombrePar}".` : `Cultivo retirado de "${nombrePar}".`)
      await cargarDatos()
    } catch (err: any) {
      console.error(err)
      toast.error('Error al asignar el producto a la parcela.')
    } finally {
      setCargandoAccion(false)
    }
  }

  const formatFecha = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Exportar a CSV
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
    toast.info('Archivo CSV descargado.')
  }

  // Exportar a JSON
  const exportarJSON = () => {
    const jsonContent = JSON.stringify(parcelasFiltradas, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'parcelas.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.info('Archivo JSON descargado.')
  }

  return (
    <div className="space-y-6">
      {/* Barra de Título y Botones Principales */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-eco-green-light pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">
            Mis Parcelas
          </p>
          <h1 className="text-3xl font-extrabold text-eco-green-dark mt-1">Gestión de Parcelas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona tus parcelas agrícolas y monitorea sus cultivos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setNuevaNombre('')
              setNuevaUbicacion('')
              setNuevaCultivoId('')
              setErrorModal('')
              setModalCrear(true)
            }}
            className="flex items-center gap-2 rounded-xl bg-eco-green-primary px-4 py-3 font-bold text-white shadow-md shadow-eco-green-primary/10 transition hover:bg-eco-green-dark text-sm cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            Nueva Parcela
          </button>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 rounded-xl border-2 border-eco-green-primary px-4 py-3 font-bold text-eco-green-primary transition hover:bg-eco-green-primary hover:text-white text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar CSV
          </button>

          <button
            onClick={exportarJSON}
            className="flex items-center gap-2 rounded-xl border-2 border-eco-green-primary px-4 py-3 font-bold text-eco-green-primary transition hover:bg-eco-green-primary hover:text-white text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar JSON
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar parcela por nombre o ubicación..."
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

      {/* Tabla de Parcelas */}
      {cargando ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-green-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-sm font-semibold text-slate-500">Cargando parcelas del backend...</p>
          </div>
        </div>
      ) : parcelasFiltradas.length === 0 ? (
        <div className="rounded-eco-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
          <span className="text-5xl">🚜</span>
          <h3 className="mt-4 text-lg font-bold text-eco-green-dark">Sin Resultados</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            {parcelas.length === 0
              ? 'Aún no tienes parcelas registradas. ¡Haz clic en "+ Nueva Parcela" para registrar una!'
              : 'No se encontraron parcelas que coincidan con los filtros.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-eco-lg border border-slate-100 bg-white shadow-soft">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-eco-green-light/50 text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Dimensiones</th>
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
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {parcela.ancho} m × {parcela.largo} m
                  </td>
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
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition cursor-pointer"
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
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition cursor-pointer"
                        title="Ver Mapa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                      </button>

                      {/* Asignar Producto */}
                      <button
                        onClick={() => handleAsignarClick(parcela)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-eco-green-primary transition cursor-pointer"
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

      {/* Modal Crear Parcela */}
      {modalCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-eco-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-eco-green-dark">
                🌱 Registrar Nueva Parcela
              </h2>
              <button
                onClick={() => setModalCrear(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearParcela} className="space-y-4">
              {errorModal && (
                <div role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  ⚠️ {errorModal}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-eco-green-dark mb-1">
                  Nombre de la Parcela *
                </label>
                <input
                  type="text"
                  value={nuevaNombre}
                  onChange={(e) => setNuevaNombre(e.target.value)}
                  placeholder="Ej: Fundo San José"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-eco-green-dark mb-1">
                  Ubicación *
                </label>
                <input
                  type="text"
                  value={nuevaUbicacion}
                  onChange={(e) => setNuevaUbicacion(e.target.value)}
                  placeholder="Ej: Huaral, Lima"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-eco-green-dark mb-1">
                    Ancho (m) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={nuevaAncho}
                    onChange={(e) => setNuevaAncho(e.target.value)}
                    placeholder="Ej: 100"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-eco-green-dark mb-1">
                    Largo (m) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={nuevaLargo}
                    onChange={(e) => setNuevaLargo(e.target.value)}
                    placeholder="Ej: 100"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-eco-green-dark mb-1">
                  Cultivo Actual (Opcional)
                </label>
                <select
                  value={nuevaCultivoId}
                  onChange={(e) => setNuevaCultivoId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10 bg-white"
                >
                  <option value="">Sin cultivo asignado</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  disabled={cargandoAccion}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargandoAccion}
                  className="rounded-xl bg-eco-green-primary px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-eco-green-dark disabled:opacity-60"
                >
                  {cargandoAccion ? 'Guardando...' : 'Crear Parcela'}
                </button>
              </div>
            </form>
          </div>
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
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Selecciona un producto para asignar a{' '}
              <strong className="text-eco-green-dark">{parcelaSeleccionada?.nombre}</strong>
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleAsignarProducto(null)}
                disabled={cargandoAccion}
                className="w-full flex items-center gap-3 rounded-eco-sm border border-dashed border-slate-300 p-3 text-left transition hover:bg-red-50 hover:border-red-300 cursor-pointer"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                  🚫
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-700">Sin producto / Retirar cultivo</div>
                  <div className="text-xs text-slate-400">Deja la parcela libre sin cultivo activo</div>
                </div>
              </button>

              {productos.map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => handleAsignarProducto(producto.id)}
                  disabled={cargandoAccion}
                  className={`w-full flex items-center gap-3 rounded-eco-sm border p-3 text-left transition cursor-pointer ${
                    parcelaSeleccionada?.cultivo_actual === producto.id
                      ? 'border-eco-green-primary bg-eco-green-light/40'
                      : 'border-slate-100 hover:bg-eco-green-light/30 hover:border-eco-green-primary'
                  }`}
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
                    <div className="text-xs text-slate-400">S/ {parseFloat(producto.precio as any).toFixed(2)} — Stock: {producto.stock}</div>
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
