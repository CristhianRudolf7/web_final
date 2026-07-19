export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number | string
  stock: number
  imagen?: string | null
  imagenUrl?: string | null
  agricultorNombre?: string
  agricultorContacto?: string
  fecha_creacion?: string
}
