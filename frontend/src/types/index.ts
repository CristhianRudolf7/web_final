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
