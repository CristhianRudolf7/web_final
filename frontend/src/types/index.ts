export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  imagen?: string
  imagenUrl?: string
  agricultorNombre?: string
  agricultorContacto?: string
  fecha_creacion?: string
}

export interface Parcela {
  id: string
  agricultor?: string
  nombre: string
  ubicacion: string
  cultivo_actual?: string | null
  cultivo_nombre?: string | null
  agricultor_nombre: string
  fecha_creacion: string
}

export interface LecturaSensor {
  id: string
  parcela: string
  temperatura: number
  humedad: number
  ph: number
  fecha_registro: string
}

export interface PuntoNormalizado {
  x: number
  y: number
}

export interface RegistroActividad {
  id: string
  sublote: string
  tipo_actividad: 'riego' | 'sensores'
  litros_riego?: number | string | null
  temperatura?: number | string | null
  humedad?: number | string | null
  ph?: number | string | null
  fecha_hora: string
}

export interface Sublote {
  id: string
  parcela: string
  poligono: PuntoNormalizado[]
  ancho_escala: number | string
  largo_escala: number | string
  fecha_creacion: string
  ultimo_riego?: RegistroActividad | null
  ultimo_sensores?: RegistroActividad | null
}

// --- Sprint 6: Dashboard, Alertas/Recomendaciones y Telegram ---

export interface LecturaHistorica {
  parcela_id: string
  parcela_nombre: string
  sublote_id: string
  fecha_hora: string
  temperatura: number | null
  humedad: number | null
  ph: number | null
}

export interface RiegoVsHumedad {
  parcela_id: string
  parcela_nombre: string
  litros_riego_totales: number
  humedad_promedio: number | null
}

export interface CultivoProductivo {
  producto_id: string
  nombre: string
  parcelas_asociadas: number
  litros_riego_totales: number
}

export interface DashboardResumen {
  historico: LecturaHistorica[]
  riego_vs_humedad: RiegoVsHumedad[]
  cultivos_productivos: CultivoProductivo[]
}

export type TipoAlerta = 'alerta' | 'recomendacion'
export type NivelAlerta = 'info' | 'advertencia' | 'critica'

export interface Alerta {
  id: string
  sublote_id: string
  parcela_nombre: string
  tipo: TipoAlerta
  codigo: string
  nivel: NivelAlerta
  titulo: string
  mensaje: string
  leida: boolean
  notificado_telegram: boolean
  fecha_creacion: string
}

export interface RespuestaNotificaciones {
  total_no_leidas: number
  resultados: Alerta[]
}
