import type { Producto } from '../types'

export const productos: Producto[] = [
  {
    id: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1001',
    nombre: 'Café de altura',
    descripcion: 'Café arábica cultivado en altura, tostado artesanalmente y con notas de cacao.',
    precio: 28,
    stock: 42,
    imagenUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=85',
    agricultorNombre: 'Cooperativa Valle Verde',
    agricultorContacto: '+51 964 220 184',
  },
  {
    id: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1002',
    nombre: 'Miel de abeja',
    descripcion: 'Miel pura de apiarios familiares, recolectada en floración de eucalipto.',
    precio: 22,
    stock: 18,
    imagenUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=85',
    agricultorNombre: 'Apiarios La Esperanza',
    agricultorContacto: '+51 978 421 630',
  },
  {
    id: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1003',
    nombre: 'Palta Hass',
    descripcion: 'Paltas Hass de pulpa cremosa, cosechadas en su punto ideal de maduración.',
    precio: 9.5,
    stock: 65,
    imagenUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=1000&q=85',
    agricultorNombre: 'Fundo Los Cedros',
    agricultorContacto: '+51 981 307 526',
  },
  {
    id: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1004',
    nombre: 'Quinua orgánica',
    descripcion: 'Grano andino seleccionado, producido sin pesticidas y con trazabilidad local.',
    precio: 14,
    stock: 31,
    imagenUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=85',
    agricultorNombre: 'Asociación Semillas del Sol',
    agricultorContacto: '+51 955 019 742',
  },
]
