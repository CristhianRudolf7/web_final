import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { PuntoNormalizado, RegistroActividad, Sublote } from '../types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const API_BASE = '/api'

type ModoMapa = 'normal' | 'humedad' | 'temperatura'

interface EstadoSublote {
  sublote: string
  ultimo_riego: RegistroActividad | null
  ultimo_sensores: RegistroActividad | null
}

export function MapaInteractivo() {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const [modo, setModo] = useState<ModoMapa>('normal')
  const [sublotes, setSublotes] = useState<Sublote[]>([])
  const [puntosDibujo, setPuntosDibujo] = useState<PuntoNormalizado[]>([])
  const [mostrarCalibracion, setMostrarCalibracion] = useState(false)
  const [anchoEscala, setAnchoEscala] = useState('')
  const [largoEscala, setLargoEscala] = useState('')
  const [subloteActivo, setSubloteActivo] = useState<Sublote | null>(null)
  const [litrosRiego, setLitrosRiego] = useState('')
  const [temperatura, setTemperatura] = useState('')
  const [humedad, setHumedad] = useState('')
  const [ph, setPh] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        const estados = await Promise.all(
          sublotesBase.map((sublote) =>
            axios
              .get<EstadoSublote>(`${API_BASE}/sublotes/${sublote.id}/ultimo-estado/`, {
                withCredentials: true,
              })
              .then((estadoResponse) => estadoResponse.data)
              .catch(() => null)
          )
        )

        setSublotes(
          sublotesBase.map((sublote) => {
            const estado = estados.find((item) => item?.sublote === sublote.id)
            return {
              ...sublote,
              ultimo_riego: estado?.ultimo_riego ?? null,
              ultimo_sensores: estado?.ultimo_sensores ?? null,
            }
          })
        )
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
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
      y: Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
    }
  }

  const handleCanvasClick = (event: MouseEvent<SVGSVGElement>) => {
    if (mostrarCalibracion || subloteActivo) return
    setPuntosDibujo((prev) => [...prev, obtenerPuntoNormalizado(event)])
  }

  const cerrarPoligono = () => {
    if (puntosDibujo.length >= 3) {
      setMostrarCalibracion(true)
    }
  }

  const limpiarDibujo = () => {
    setPuntosDibujo([])
    setMostrarCalibracion(false)
    setAnchoEscala('')
    setLargoEscala('')
  }

  const guardarSublote = async () => {
    if (!uuid || puntosDibujo.length < 3 || !anchoEscala || !largoEscala) return

    try {
      setSaving(true)
      setError('')
      const response = await axios.post<Sublote>(
        `${API_BASE}/parcelas/${uuid}/sublotes/`,
        {
          poligono: puntosDibujo,
          ancho_escala: anchoEscala,
          largo_escala: largoEscala,
        },
        { withCredentials: true }
      )
      setSublotes((prev) => [
        { ...response.data, ultimo_riego: null, ultimo_sensores: null },
        ...prev,
      ])
      limpiarDibujo()
    } catch (err) {
      console.error('No se pudo guardar el sublote', err)
      setError('No se pudo guardar el sublote. Revisa la escala y el poligono.')
    } finally {
      setSaving(false)
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
    } catch (err) {
      console.error('No se pudo registrar la actividad', err)
      setError('No se pudo registrar la actividad del sublote.')
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

  if (!uuidValido) {
    return (
      <div className="rounded-eco-lg border border-red-100 bg-white p-8 text-center shadow-soft">
        <h1 className="text-xl font-extrabold text-red-600">UUID invalido</h1>
        <button
          onClick={() => navigate('/dashboard/parcelas')}
          className="mt-4 rounded-xl bg-eco-green-primary px-5 py-3 text-sm font-bold text-white hover:bg-eco-green-dark"
        >
          Volver a parcelas
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-eco-green-light pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard/parcelas')}
            className="mb-3 text-sm font-bold text-eco-green-primary hover:text-eco-green-dark"
          >
            Volver a parcelas
          </button>
          <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Mapa Interactivo</p>
          <h1 className="mt-1 text-3xl font-extrabold text-eco-green-dark">Sublotes y registros ambientales</h1>
        </div>
        <div className="inline-flex rounded-xl border border-eco-green-light bg-white p-1 shadow-soft">
          {(['normal', 'humedad', 'temperatura'] as ModoMapa[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setModo(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition ${
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
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-eco-lg border border-eco-green-light bg-white p-4 shadow-soft">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-500">
              {loading ? 'Cargando sublotes...' : `${sublotes.length} sublotes registrados`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={cerrarPoligono}
                disabled={puntosDibujo.length < 3}
                className="rounded-xl bg-eco-green-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Cerrar poligono
              </button>
              <button
                onClick={limpiarDibujo}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
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
                strokeWidth="0.65"
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

        <aside className="space-y-4">
          {mostrarCalibracion && (
            <div className="rounded-eco-lg border border-eco-green-light bg-white p-5 shadow-soft">
              <h2 className="text-lg font-extrabold text-eco-green-dark">Calibracion</h2>
              <div className="mt-4 space-y-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={anchoEscala}
                  onChange={(event) => setAnchoEscala(event.target.value)}
                  placeholder="Ancho real en metros"
                  className="w-full rounded-eco-sm border border-slate-200 px-4 py-3 text-sm outline-none focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-light"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={largoEscala}
                  onChange={(event) => setLargoEscala(event.target.value)}
                  placeholder="Largo real en metros"
                  className="w-full rounded-eco-sm border border-slate-200 px-4 py-3 text-sm outline-none focus:border-eco-green-primary focus:ring-2 focus:ring-eco-green-light"
                />
                <button
                  onClick={guardarSublote}
                  disabled={saving || !anchoEscala || !largoEscala}
                  className="w-full rounded-xl bg-eco-green-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Guardar sublote
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
                    className="w-full rounded-xl bg-eco-green-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300"
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
                    className="w-full rounded-xl bg-eco-green-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Registrar sensores
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Selecciona un poligono guardado para registrar riego o sensores.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
