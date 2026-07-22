import { createPortal } from 'react-dom'

interface PropiedadesConfirmModal {
  estaAbierto: boolean
  alCerrar: () => void
  alConfirmar: () => void
  titulo: string
  mensaje: string
  cargando?: boolean
}

export function ConfirmModal({ estaAbierto, alCerrar, alConfirmar, titulo, mensaje, cargando }: PropiedadesConfirmModal) {
  if (!estaAbierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro opacador del contenido inferior */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={alCerrar}
      />

      {/* Contenedor flexible para garantizar centrado y scroll correcto */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        {/* Tarjeta Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-eco-lg border border-red-100 bg-white p-6 text-left shadow-2xl transition-all sm:my-8 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Insignia de advertencia */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
            <span className="text-2xl">⚠️</span>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-xl font-extrabold text-eco-green-dark">{titulo}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{mensaje}</p>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={alCerrar}
              disabled={cargando}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={alConfirmar}
              disabled={cargando}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60 cursor-pointer"
            >
              {cargando ? 'Eliminando...' : 'Sí, Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
