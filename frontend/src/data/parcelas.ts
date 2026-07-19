import type { Parcela, LecturaSensor } from '../types'

export const parcelasData: Parcela[] = [
  {
    id: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e01',
    nombre: 'Parcela Valle del Mantaro',
    ubicacion: 'Huancayo, Junín',
    cultivo_actual: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1004',
    cultivo_nombre: 'Papa Nativa Amarilla',
    agricultor_nombre: 'Carlos Quispe Huamán',
    fecha_creacion: '2026-03-15T08:30:00Z',
  },
  {
    id: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e02',
    nombre: 'Lote San Jerónimo',
    ubicacion: 'San Jerónimo, Junín',
    cultivo_actual: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1002',
    cultivo_nombre: 'Quinua Orgánica',
    agricultor_nombre: 'María Elena Torres',
    fecha_creacion: '2026-04-02T10:15:00Z',
  },
  {
    id: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e03',
    nombre: 'Fundo Concepción Alto',
    ubicacion: 'Concepción, Junín',
    cultivo_actual: null,
    cultivo_nombre: null,
    agricultor_nombre: 'Roberto Mendoza Flores',
    fecha_creacion: '2026-04-18T14:45:00Z',
  },
  {
    id: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e04',
    nombre: 'Terreno Jauja Norte',
    ubicacion: 'Jauja, Junín',
    cultivo_actual: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1001',
    cultivo_nombre: 'Maíz Amiláceo',
    agricultor_nombre: 'Ana Luz Cárdenas',
    fecha_creacion: '2026-05-10T09:00:00Z',
  },
  {
    id: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e05',
    nombre: 'Parcela Tarma Baja',
    ubicacion: 'Tarma, Junín',
    cultivo_actual: null,
    cultivo_nombre: null,
    agricultor_nombre: 'Luis Fernando Rojas',
    fecha_creacion: '2026-05-28T16:20:00Z',
  },
  {
    id: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e06',
    nombre: 'Lote Chupaca Sur',
    ubicacion: 'Chupaca, Junín',
    cultivo_actual: 'a5b1b54e-1c5d-4f5a-8c31-7b7e430f1003',
    cultivo_nombre: 'Habas Verdes',
    agricultor_nombre: 'Sofía Ramos Vilca',
    fecha_creacion: '2026-06-05T11:30:00Z',
  },
]

export const lecturasData: LecturaSensor[] = [
  // Parcela Valle del Mantaro
  { id: 'lec-001', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e01', temperatura: 14.2, humedad: 68.5, ph: 6.2, fecha_registro: '2026-06-01T06:00:00Z' },
  { id: 'lec-002', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e01', temperatura: 18.7, humedad: 55.0, ph: 6.4, fecha_registro: '2026-06-08T06:00:00Z' },
  { id: 'lec-003', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e01', temperatura: 12.1, humedad: 72.3, ph: 6.1, fecha_registro: '2026-06-15T06:00:00Z' },
  { id: 'lec-004', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e01', temperatura: 16.5, humedad: 60.0, ph: 6.5, fecha_registro: '2026-07-01T06:00:00Z' },

  // Lote San Jerónimo
  { id: 'lec-005', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e02', temperatura: 15.8, humedad: 45.2, ph: 6.8, fecha_registro: '2026-06-02T08:00:00Z' },
  { id: 'lec-006', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e02', temperatura: 19.3, humedad: 38.7, ph: 7.0, fecha_registro: '2026-06-10T08:00:00Z' },
  { id: 'lec-007', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e02', temperatura: 10.5, humedad: 62.1, ph: 6.7, fecha_registro: '2026-06-20T08:00:00Z' },
  { id: 'lec-008', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e02', temperatura: 22.0, humedad: 33.5, ph: 7.2, fecha_registro: '2026-07-05T08:00:00Z' },

  // Fundo Concepción Alto
  { id: 'lec-009', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e03', temperatura: 8.9, humedad: 80.4, ph: 5.8, fecha_registro: '2026-06-03T07:00:00Z' },
  { id: 'lec-010', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e03', temperatura: 11.4, humedad: 75.0, ph: 5.9, fecha_registro: '2026-06-12T07:00:00Z' },
  { id: 'lec-011', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e03', temperatura: 9.7, humedad: 82.1, ph: 5.6, fecha_registro: '2026-06-22T07:00:00Z' },
  { id: 'lec-012', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e03', temperatura: 13.2, humedad: 69.8, ph: 6.0, fecha_registro: '2026-07-03T07:00:00Z' },

  // Terreno Jauja Norte
  { id: 'lec-013', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e04', temperatura: 20.1, humedad: 42.0, ph: 7.1, fecha_registro: '2026-06-05T09:00:00Z' },
  { id: 'lec-014', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e04', temperatura: 24.5, humedad: 35.8, ph: 7.3, fecha_registro: '2026-06-14T09:00:00Z' },
  { id: 'lec-015', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e04', temperatura: 17.8, humedad: 50.2, ph: 6.9, fecha_registro: '2026-06-25T09:00:00Z' },
  { id: 'lec-016', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e04', temperatura: 21.3, humedad: 40.5, ph: 7.0, fecha_registro: '2026-07-08T09:00:00Z' },

  // Parcela Tarma Baja
  { id: 'lec-017', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e05', temperatura: 16.0, humedad: 58.3, ph: 6.3, fecha_registro: '2026-06-06T10:00:00Z' },
  { id: 'lec-018', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e05', temperatura: 13.9, humedad: 65.7, ph: 6.5, fecha_registro: '2026-06-18T10:00:00Z' },
  { id: 'lec-019', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e05', temperatura: 19.4, humedad: 48.0, ph: 6.1, fecha_registro: '2026-07-02T10:00:00Z' },

  // Lote Chupaca Sur
  { id: 'lec-020', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e06', temperatura: 11.8, humedad: 73.4, ph: 5.7, fecha_registro: '2026-06-07T11:00:00Z' },
  { id: 'lec-021', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e06', temperatura: 15.2, humedad: 61.0, ph: 6.0, fecha_registro: '2026-06-17T11:00:00Z' },
  { id: 'lec-022', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e06', temperatura: 9.3, humedad: 84.2, ph: 5.5, fecha_registro: '2026-07-06T11:00:00Z' },
  { id: 'lec-023', parcela: 'c3a1e8b2-4f6d-4a1b-9c3e-1a2b3c4d5e06', temperatura: 14.6, humedad: 66.8, ph: 5.9, fecha_registro: '2026-07-14T11:00:00Z' },
]
