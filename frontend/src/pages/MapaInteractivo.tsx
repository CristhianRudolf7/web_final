import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { PuntoNormalizado, RegistroActividad, Sublote } from '../types'
import { ConfirmModal } from '../components/ConfirmModal'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const API_BASE = '/api'

type ModoMapa = 'normal' | 'humedad' | 'temperatura'

interface EstadoSublote {
  sublote: string
  ultimo_riego: RegistroActividad | null
  ultimo_sensores: RegistroActividad | null
}

function calcularAreaSublote(poligono: PuntoNormalizado[], ancho: number, largo: number): number {
  if (!poligono || poligono.length < 3 || isNaN(ancho) || isNaN(largo)) return 0
  let suma = 0
  const n = poligono.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    suma += poligono[i].x * poligono[j].y
    suma -= poligono[j].x * poligono[i].y
  }
  const areaNormalizada = Math.abs(suma) / 2
  return areaNormalizada * (ancho * largo)
}

function puntoEnPoligono(punto: { x: number; y: number }, poligono: { x: number; y: number }[]): boolean {
  let dentro = false
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const xi = poligono[i].x, yi = poligono[i].y
    const xj = poligono[j].x, yj = poligono[j].y
    const intersecta = yi > punto.y !== yj > punto.y && punto.x < ((xj - xi) * (punto.y - yi)) / (yj - yi) + xi
    if (intersecta) dentro = !dentro
  }
  return dentro
}

function segmentosSeIntersecan(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  function ccw(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
  }
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
}

function poligonosSeCruzan(polyA: { x: number; y: number }[], polyB: { x: number; y: number }[]): boolean {
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i]
    const a2 = polyA[(i + 1) % polyA.length]
    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j]
      const b2 = polyB[(j + 1) % polyB.length]
      if (segmentosSeIntersecan(a1, a2, b1, b2)) return true
    }
  }
  return false
}

function poligonosSeSolapan(polyA: { x: number; y: number }[], polyB: { x: number; y: number }[]): boolean {
  if (!polyA || polyA.length < 3 || !polyB || polyB.length < 3) return false
  if (poligonosSeCruzan(polyA, polyB)) return true
  for (const pt of polyA) {
    if (puntoEnPoligono(pt, polyB)) return true
  }
  for (const pt of polyB) {
    if (puntoEnPoligono(pt, polyA)) return true
  }
  return false
}

export function MapaInteractivo() {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const [modo, setModo] = useState<ModoMapa>('normal')
  const [sublotes, setSublotes] = useState<Sublote[]>([])
  const [puntosDibujo, setPuntosDibujo] = useState<PuntoNormalizado[]>([])
  const [mostrarCalibracion, setMostrarCalibracion] = useState(false)

  // Escala global del lote (ancho y largo de todo el plano)
  const [anchoLote, setAnchoLote] = useState('100')
  const [largoLote, setLargoLote] = useState('100')
  const [mensajeEscalaGuardada, setMensajeEscalaGuardada] = useState('')

  const [subloteActivo, setSubloteActivo] = useState<Sublote | null>(null)
  const [litrosRiego, setLitrosRiego] = useState('')
  const [temperatura, setTemperatura] = useState('')
  const [humedad, setHumedad] = useState('')
  const [ph, setPh] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Estados para modal de confirmación de eliminación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [subloteAEliminar, setSubloteAEliminar] = useState<{ id: string; idx: number } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const uuidValido = Boolean(uuid && UUID_REGEX.test(uuid))

  useEffect(() => {
    if (!uuidValido || !uuid) {
      setLoading(false)
      return
    }

    const cargarSublotes = async () => {
      try {
        setError('')
        const response = await axios.get<Sublote[]>(`${API_BASE}/parcelas/${uuid}/sublotes/`, {
          withCredentials: true,
        })
        const sublotesBase = response.data

        if (sublotesBase.length > 0) {
          setAnchoLote(sublotesBase[0].ancho_escala.toString())
          setLargoLote(sublotesBase[0].largo_escala.toString())
        }

        setSublotes(sublotesBase)
      } catch (err) {
        console.error('No se pudo cargar el mapa', err)
        setError('No se pudieron cargar los sublotes de la parcela.')
      } finally {
        setLoading(false)
      }
    }

    cargarSublotes()
  }, [uuid, uuidValido])

  const puntosPolyline = useMemo(
    () => puntosDibujo.map((p) => `${p.x * 100},${p.y * 62}`).join(' '),
    [puntosDibujo]
  )

  const obtenerPuntoNormalizado = (event: MouseEvent<SVGSVGElement>) => {
    const target = event.currentTarget || (event.target as HTMLElement | null)
    if (!target || typeof target.getBoundingClientRect !== 'function') return null
    const rect = target.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    return {
      x: Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
      y: Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
    }
  }

  const handleCanvasClick = (event: MouseEvent<SVGSVGElement>) => {
    if (mostrarCalibracion) return
    // Si hay un sublote seleccionado, al hacer clic en área libre del lienzo se deselecciona para permitir dibujar
    if (subloteActivo) {
      setSubloteActivo(null)
    }
    const nuevoPunto = obtenerPuntoNormalizado(event)
    if (nuevoPunto) {
      // Bloquear si el punto se coloca dentro de un sublote ya registrado
      const caeDentro = sublotes.some((s) => puntoEnPoligono(nuevoPunto, s.poligono))
      if (caeDentro) {
        toast.warning('Ese punto cae dentro de un sublote ya registrado. Dibuja en una zona libre.')
        return
      }
      setPuntosDibujo((prev) => [...prev, nuevoPunto])
    }
  }

  const cerrarPoligono = () => {
    if (puntosDibujo.length >= 3) {
      setMostrarCalibracion(true)
    }
  }

  const limpiarDibujo = () => {
    setPuntosDibujo([])
    setMostrarCalibracion(false)
    setSubloteActivo(null)
  }

  // Escuchar la tecla ESC para limpiar trazados o deseleccionar sublotes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        limpiarDibujo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleActualizarEscala = () => {
    const a = Number(anchoLote)
    const l = Number(largoLote)
    if (isNaN(a) || a <= 0 || isNaN(l) || l <= 0) {
      const msg = 'El ancho y largo deben ser números mayores a cero.'
      setError(msg)
      toast.error(msg)
      return
    }
    setError('')
    setSublotes((prev) =>
      prev.map((s) => ({
        ...s,
        ancho_escala: a,
        largo_escala: l,
      }))
    )
    const msgExito = `✓ Escala del lote actualizada a ${a} m × ${l} m`
    setMensajeEscalaGuardada(msgExito)
    toast.success(msgExito)
    setTimeout(() => setMensajeEscalaGuardada(''), 4000)
  }

  const guardarSublote = async (poligonoPuntos: PuntoNormalizado[] = puntosDibujo) => {
    if (!uuid || poligonoPuntos.length < 3 || !anchoLote || !largoLote) return

    // Validar si el polígono solapa o choca con algún sublote existente
    const haySolapamiento = sublotes.some((subloteExistente) =>
      poligonosSeSolapan(poligonoPuntos, subloteExistente.poligono)
    )

    if (haySolapamiento) {
      toast.error('⚠️ El sublote choca o se solapa con un sublote ya registrado. Dibuja en un área libre.')
      return
    }

    try {
      setSaving(true)
      setError('')
      const response = await axios.post<Sublote>(
        `${API_BASE}/parcelas/${uuid}/sublotes/`,
        {
          poligono: poligonoPuntos,
          ancho_escala: anchoLote,
          largo_escala: largoLote,
        },
        { withCredentials: true }
      )
      setSublotes((prev) => [
        { ...response.data, ultimo_riego: null, ultimo_sensores: null },
        ...prev,
      ])
      limpiarDibujo()
      toast.success('¡Sublote creado y guardado exitosamente!')
    } catch (err: any) {
      console.error('No se pudo guardar el sublote', err)
      const msg = err.response?.data?.error || 'No se pudo guardar el sublote. Revisa la escala y el polígono.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCanvasDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault()
    if (puntosDibujo.length >= 3) {
      guardarSublote(puntosDibujo)
    }
  }

  const handleSolicitarEliminarSublote = (subloteId: string, idx: number) => {
    setSubloteAEliminar({ id: subloteId, idx })
    setIsConfirmOpen(true)
  }

  const handleConfirmarEliminarSublote = async () => {
    if (!subloteAEliminar) return
    setActionLoading(true)
    try {
      await axios.delete(`${API_BASE}/sublotes/${subloteAEliminar.id}/`, { withCredentials: true })
      setSublotes((prev) => prev.filter((s) => s.id !== subloteAEliminar.id))
      if (subloteActivo?.id === subloteAEliminar.id) {
        setSubloteActivo(null)
      }
      toast.success(`Sublote #${subloteAEliminar.idx + 1} eliminado correctamente.`)
      setIsConfirmOpen(false)
      setSubloteAEliminar(null)
    } catch (err) {
      console.error('No se pudo eliminar el sublote', err)
      toast.error('No se pudo eliminar el sublote.')
    } finally {
      setActionLoading(false)
    }
  }

  const registrarActividad = async (tipo: 'riego' | 'sensores') => {
    if (!subloteActivo) return
    const payload =
      tipo === 'riego'
        ? { tipo_actividad: tipo, litros_riego: litrosRiego }
        : { tipo_actividad: tipo, temperatura, humedad, ph }

    try {
      setSaving(true)
      setError('')
      const response = await axios.post<RegistroActividad>(
        `${API_BASE}/sublotes/${subloteActivo.id}/actividades/`,
        payload,
        { withCredentials: true }
      )

      setSublotes((prev) =>
        prev.map((sublote) =>
          sublote.id === subloteActivo.id
            ? {
                ...sublote,
                ultimo_riego: tipo === 'riego' ? response.data : sublote.ultimo_riego ?? null,
                ultimo_sensores: tipo === 'sensores' ? response.data : sublote.ultimo_sensores ?? null,
              }
            : sublote
        )
      )
      setSubloteActivo((prev) =>
        prev
          ? {
              ...prev,
              ultimo_riego: tipo === 'riego' ? response.data : prev.ultimo_riego ?? null,
              ultimo_sensores: tipo === 'sensores' ? response.data : prev.ultimo_sensores ?? null,
            }
          : null
      )
      setLitrosRiego('')
      setTemperatura('')
      setHumedad('')
      setPh('')
      toast.success(
        tipo === 'riego'
          ? 'Riego registrado exitosamente en el sublote.'
          : 'Lectura de sensores registrada exitosamente.'
      )
    } catch (err) {
      console.error('No se pudo registrar la actividad', err)
      const msg = 'No se pudo registrar la actividad del sublote.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const colorSublote = (sublote: Sublote) => {
    if (modo === 'humedad') {
      const valor = Number(sublote.ultimo_sensores?.humedad ?? 0)
      return `rgba(46, 125, 50, ${Math.min(Math.max(valor / 100, 0.08), 0.85)})`
    }
    if (modo === 'temperatura') {
      const valor = Number(sublote.ultimo_sensores?.temperatura ?? 0)
      const ratio = Math.min(Math.max((valor - 10) / 30, 0), 1)
      const r = Math.round(201 - ratio * 96)
      const g = Math.round(216 - ratio * 92)
      const b = Math.round(121 - ratio * 56)
      return `rgba(${r}, ${g}, ${b}, 0.72)`
    }
    return 'rgba(46, 125, 50, 0.16)'
  }

  const formatoFecha = (fecha?: string) => {
    if (!fecha) return 'Sin registro'
    return new Date(fecha).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const anchoNum = Number(anchoLote) || 0
  const largoNum = Number(largoLote) || 0
  const areaLoteTotal = anchoNum * largoNum

  if (!uuidValido) {
    return (
      <div className="rounded-eco-lg border border-red-100 bg-white p-8 text-center shadow-soft">
        <h1 className="text-xl font-extrabold text-red-600">UUID inválido</h1>
        <button
          onClick={() => navigate('/dashboard/parcelas')}
          className="mt-4 rounded-xl bg-eco-green-primary px-5 py-3 text-sm font-bold text-white hover:bg-eco-green-dark cursor-pointer"
        >
          Volver a parcelas
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de Título y Modos */}
      <div className="flex flex-col gap-4 border-b border-eco-green-light pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard/parcelas')}
            className="mb-3 text-sm font-bold text-eco-green-primary hover:text-eco-green-dark cursor-pointer inline-flex items-center gap-1"
          >
            ← Volver a parcelas
          </button>
          <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Mapa Interactivo</p>
          <h1 className="mt-1 text-3xl font-extrabold text-eco-green-dark">Sublotes y registros ambientales</h1>
        </div>
        <div className="inline-flex rounded-xl border border-eco-green-light bg-white p-1 shadow-soft">
          {(['normal', 'humedad', 'temperatura'] as ModoMapa[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setModo(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition cursor-pointer ${
                modo === tab
                  ? 'bg-eco-green-primary text-white'
                  : 'text-slate-500 hover:bg-eco-green-light/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-eco-sm border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Grid Principal: Mapa SVG + Panel de Acciones */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Contenedor del Lienzo SVG */}
        <section className="rounded-eco-lg border border-eco-green-light bg-white p-4 shadow-soft">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-500">
              {loading ? 'Cargando sublotes...' : `${sublotes.length} sublotes registrados`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={cerrarPoligono}
                disabled={puntosDibujo.length < 3}
                className="rounded-xl bg-eco-green-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
              >
                Cerrar polígono
              </button>
              <button
                onClick={limpiarDibujo}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50 cursor-pointer"
              >
                Limpiar
              </button>
            </div>
          </div>

          <svg
            viewBox="0 0 100 62"
            role="img"
            aria-label="Plano interactivo de la parcela"
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            className="aspect-[16/10] w-full cursor-crosshair rounded-eco-md border border-eco-green-light bg-white"
          >
            <defs>
              <pattern id="map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(46,125,50,0.12)" strokeWidth="0.25" />
              </pattern>
            </defs>
            <rect width="100" height="62" fill="url(#map-grid)" />

            {sublotes.map((sublote, index) => (
              <polygon
                key={sublote.id}
                points={sublote.poligono.map((p) => `${p.x * 100},${p.y * 62}`).join(' ')}
                fill={colorSublote(sublote)}
                stroke="#2E7D32"
                strokeWidth={subloteActivo?.id === sublote.id ? "1.5" : "0.65"}
                onClick={(event) => {
                  event.stopPropagation()
                  setSubloteActivo(sublote)
                }}
                className="cursor-pointer transition hover:opacity-80"
              >
                <title>{`Sublote ${index + 1}`}</title>
              </polygon>
            ))}

            {puntosDibujo.length > 1 && (
              <polyline points={puntosPolyline} fill="none" stroke="#1B5E20" strokeWidth="0.7" />
            )}
            {puntosDibujo.map((punto, index) => (
              <circle key={`${punto.x}-${punto.y}-${index}`} cx={punto.x * 100} cy={punto.y * 62} r="1" fill="#1B5E20" />
            ))}
          </svg>
        </section>

        {/* Panel Lateral: Calibración y Registro de Riego/Sensores */}
        <aside className="space-y-4">
          {mostrarCalibracion && (
            <div className="rounded-eco-lg border border-eco-green-light bg-white p-5 shadow-soft">
              <h2 className="text-lg font-extrabold text-eco-green-dark">Confirmar Sublote</h2>
              <p className="mt-1 text-xs text-slate-500">
                Se usará la escala del lote completo ({anchoLote}m × {largoLote}m).
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={guardarSublote}
                  disabled={saving || !anchoLote || !largoLote}
                  className="w-full rounded-xl bg-eco-green-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                >
                  {saving ? 'Guardando...' : 'Guardar sublote'}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-eco-lg border border-slate-100 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-extrabold text-eco-green-dark">Acciones del sublote</h2>
            {subloteActivo ? (
              <div className="mt-4 space-y-5">
                <div className="rounded-eco-sm bg-eco-green-light/40 p-3 text-xs font-semibold text-slate-600">
                  <div>Riego: {formatoFecha(subloteActivo.ultimo_riego?.fecha_hora)}</div>
                  <div>Sensores: {formatoFecha(subloteActivo.ultimo_sensores?.fecha_hora)}</div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-eco-green-dark">Regar</h3>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={litrosRiego}
                    onChange={(event) => setLitrosRiego(event.target.value)}
                    placeholder="Litros de riego"
                    className="w-full rounded-eco-sm border border-slate-200 px-4 py-3 text-sm outline-none focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-light"
                  />
                  <button
                    onClick={() => registrarActividad('riego')}
                    disabled={saving || !litrosRiego}
                    className="w-full rounded-xl bg-eco-green-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                  >
                    Registrar riego
                  </button>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-extrabold text-eco-green-dark">Ingresar datos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={temperatura} onChange={(event) => setTemperatura(event.target.value)} placeholder="Temp." className="rounded-eco-sm border border-slate-200 px-3 py-3 text-sm outline-none focus:border-eco-green-primary" />
                    <input type="number" value={humedad} onChange={(event) => setHumedad(event.target.value)} placeholder="Hum." className="rounded-eco-sm border border-slate-200 px-3 py-3 text-sm outline-none focus:border-eco-green-primary" />
                    <input type="number" value={ph} onChange={(event) => setPh(event.target.value)} placeholder="pH" className="rounded-eco-sm border border-slate-200 px-3 py-3 text-sm outline-none focus:border-eco-green-primary" />
                  </div>
                  <button
                    onClick={() => registrarActividad('sensores')}
                    disabled={saving || !temperatura || !humedad || !ph}
                    className="w-full rounded-xl bg-eco-green-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                  >
                    Registrar sensores
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Selecciona un polígono guardado para registrar riego o sensores.</p>
            )}
          </div>
        </aside>
      </div>

      {/* SECCIÓN DEBAJO DE LA INTERFAZ DE LOTES: Escala del Lote Completo & Lista de Sublotes */}
      <div className="space-y-6 pt-4 border-t border-eco-green-light/60">
        {/* Tarjeta de Dimensión y Escala del Lote Completo */}
        <div className="rounded-eco-lg border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-eco-green-light pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">
                Ejes del Plano
              </p>
              <h2 className="text-xl font-extrabold text-eco-green-dark mt-0.5">
                📏 Escala General del Lote Completo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa las dimensiones reales del lote en metros y haz clic en "Actualizar Escala".
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-eco-green-light text-eco-green-dark">
                Área Total: {areaLoteTotal.toLocaleString('es-PE')} m²
              </span>
            </div>
          </div>

          {mensajeEscalaGuardada && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
              {mensajeEscalaGuardada}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-eco-green-dark mb-1">
                Ancho Real del Lote (m) *
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={anchoLote}
                onChange={(e) => setAnchoLote(e.target.value)}
                placeholder="Ej: 100"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-eco-green-dark mb-1">
                Largo Real del Lote (m) *
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={largoLote}
                onChange={(e) => setLargoLote(e.target.value)}
                placeholder="Ej: 100"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-primary/10"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleActualizarEscala}
                className="w-full rounded-xl bg-eco-green-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-eco-green-dark cursor-pointer"
              >
                💾 Actualizar Escala
              </button>
            </div>

            <div>
              <div className="w-full rounded-xl bg-eco-green-light/50 p-2.5 text-center border border-eco-green-light">
                <p className="text-xs font-bold text-eco-green-dark uppercase">Superficie Total</p>
                <p className="text-base font-extrabold text-eco-green-primary mt-0.5">
                  {areaLoteTotal.toLocaleString('es-PE')} m²
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Sublotes Registrados */}
        <div className="rounded-eco-lg border border-slate-100 bg-white shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-eco-green-light bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-eco-green-dark">
                📑 Lista de Sublotes Registrados
              </h3>
              <p className="text-xs text-slate-500">
                Resumen de dimensiones, área estimada y lecturas registradas por cada sublote.
              </p>
            </div>
            <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600">
              {sublotes.length} Sublote(s)
            </span>
          </div>

          {sublotes.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl">🗺️</span>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Aún no has dibujado ningún sublote en el mapa.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Haz clic en el plano rectangular superior para marcar vértices y registrar tu primer sublote.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-eco-green-light/40 text-xs font-bold uppercase tracking-wider text-eco-green-dark">
                  <tr>
                    <th className="px-6 py-3.5">Sublote</th>
                    <th className="px-6 py-3.5">Vértices</th>
                    <th className="px-6 py-3.5">Área Estimada</th>
                    <th className="px-6 py-3.5">Último Riego</th>
                    <th className="px-6 py-3.5">Últimos Sensores</th>
                    <th className="px-6 py-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {sublotes.map((sublote, idx) => {
                    const anchoSub = Number(sublote.ancho_escala) || anchoNum
                    const largoSub = Number(sublote.largo_escala) || largoNum
                    const areaM2 = calcularAreaSublote(sublote.poligono, anchoSub, largoSub)
                    const porcArea = areaLoteTotal > 0 ? (areaM2 / areaLoteTotal) * 100 : 0
                    const esSeleccionado = subloteActivo?.id === sublote.id

                    return (
                      <tr
                        key={sublote.id}
                        className={`transition hover:bg-eco-green-light/20 ${
                          esSeleccionado ? 'bg-eco-green-light/40 font-semibold' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-eco-green-dark">
                          Sublote #{idx + 1}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {sublote.poligono.length} puntos
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {areaM2.toLocaleString('es-PE', { maximumFractionDigits: 1 })} m²
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            ({porcArea.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {sublote.ultimo_riego ? (
                            <div>
                              <span className="font-bold text-eco-green-primary">
                                💧 {sublote.ultimo_riego.litros_riego} L
                              </span>
                              <div className="text-slate-400">{formatoFecha(sublote.ultimo_riego.fecha_hora)}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Sin riego</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {sublote.ultimo_sensores ? (
                            <div className="space-y-0.5">
                              <div>🌡️ {sublote.ultimo_sensores.temperatura}°C</div>
                              <div>💧 {sublote.ultimo_sensores.humedad}%</div>
                              <div>🧪 pH {sublote.ultimo_sensores.ph}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Sin lecturas</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSubloteActivo(sublote)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                esSeleccionado
                                  ? 'bg-eco-green-dark text-white'
                                  : 'bg-eco-green-light text-eco-green-primary hover:bg-eco-green-primary hover:text-white'
                              }`}
                            >
                              {esSeleccionado ? 'Seleccionado' : 'Seleccionar'}
                            </button>

                            <button
                              onClick={() => handleSolicitarEliminarSublote(sublote.id, idx)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                              title="Eliminar sublote"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        estaAbierto={isConfirmOpen}
        alCerrar={() => setIsConfirmOpen(false)}
        titulo="⚠️ Eliminar Sublote"
        mensaje={
          subloteAEliminar
            ? `¿Estás seguro de que deseas eliminar permanentemente el Sublote #${subloteAEliminar.idx + 1}? Esta acción eliminará su trazado en el mapa y todas sus actividades registradas.`
            : ''
        }
        alConfirmar={handleConfirmarEliminarSublote}
        cargando={actionLoading}
      />
    </div>
  )
}
