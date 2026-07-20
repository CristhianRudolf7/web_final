import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import type { Alerta } from '../types'

const API_BASE = '/api'

const estilosNivel: Record<Alerta['nivel'], string> = {
  critica: 'border-red-200 bg-red-50 text-red-700',
  advertencia: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-eco-green-light bg-eco-green-light/60 text-eco-green-dark',
}

const iconoTipo: Record<Alerta['tipo'], string> = {
  alerta: '⚠️',
  recomendacion: '💡',
}

export function NotificationBell() {
  const [abierto, setAbierto] = useState(false)
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [totalNoLeidas, setTotalNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await axios.get(`${API_BASE}/notificaciones/`, { withCredentials: true })
      setAlertas(data.resultados)
      setTotalNoLeidas(data.total_no_leidas)
    } catch {
      // Si la sesión no está activa o el backend no responde, la campana
      // simplemente se muestra sin notificaciones (sin romper el header).
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, 60_000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const alClickAfuera = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', alClickAfuera)
    return () => document.removeEventListener('mousedown', alClickAfuera)
  }, [])

  const marcarUnaLeida = async (id: string) => {
    setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, leida: true } : a)))
    setTotalNoLeidas((n) => Math.max(0, n - 1))
    try {
      await axios.patch(`${API_BASE}/notificaciones/${id}/leida/`, {}, { withCredentials: true })
    } catch {
      cargar()
    }
  }

  const marcarTodas = async () => {
    setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })))
    setTotalNoLeidas(0)
    try {
      await axios.post(`${API_BASE}/notificaciones/marcar-todas-leidas/`, {}, { withCredentials: true })
    } catch {
      cargar()
    }
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Notificaciones"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-eco-green-light bg-white text-xl transition hover:border-eco-green-primary"
      >
        🔔
        {totalNoLeidas > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {totalNoLeidas > 9 ? '9+' : totalNoLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-50 mt-3 w-96 max-w-[90vw] rounded-eco-lg border border-eco-green-light bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-eco-green-light/70 px-4 py-3">
            <p className="font-bold text-eco-green-dark">Alertas y recomendaciones</p>
            {totalNoLeidas > 0 && (
              <button onClick={marcarTodas} className="text-xs font-semibold text-eco-green-primary hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {cargando && alertas.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-400">Cargando…</p>
            )}
            {!cargando && alertas.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-400">No hay notificaciones por ahora.</p>
            )}
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`mb-2 rounded-xl border p-3 text-sm transition ${estilosNivel[alerta.nivel]} ${
                  alerta.leida ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">
                    {iconoTipo[alerta.tipo]} {alerta.titulo}
                  </p>
                  {!alerta.leida && (
                    <button
                      onClick={() => marcarUnaLeida(alerta.id)}
                      className="shrink-0 text-xs font-semibold underline"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
                <p className="mt-1 text-slate-600">{alerta.mensaje}</p>
                <p className="mt-1 text-xs text-slate-400">{alerta.parcela_nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
