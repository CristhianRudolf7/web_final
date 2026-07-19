import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'

interface Usuario {
  id: string
  dni: string
  nombre: string
  apellido: string
  email: string
  celular: string
  fecha_registro: string
}

export function Perfil() {
  const { usuario, setUsuario } = useOutletContext<{ usuario: Usuario; setUsuario: (u: Usuario) => void }>()
  
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(usuario.nombre)
  const [apellido, setApellido] = useState(usuario.apellido)
  const [email, setEmail] = useState(usuario.email)
  const [celular, setCelular] = useState(usuario.celular || '')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCancel = () => {
    setNombre(usuario.nombre)
    setApellido(usuario.apellido)
    setEmail(usuario.email)
    setCelular(usuario.celular || '')
    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!nombre.trim() || !apellido.trim()) {
      return setError('El nombre y el apellido son obligatorios.')
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return setError('Por favor, ingresa un correo electrónico válido.')
    }
    
    setLoading(true)
    try {
      const response = await axios.patch(
        '/api/perfil/',
        { nombre, apellido, email, celular },
        { withCredentials: true }
      )
      setUsuario(response.data)
      setSuccess('Perfil actualizado correctamente.')
      setEditing(false)
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.detalle || 
        err.response?.data?.email?.[0] || 
        'No se pudo actualizar el perfil. Inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fechaRegistroLocal = usuario.fecha_registro
    ? new Date(usuario.fecha_registro).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-'

  return (
    <div className="mx-auto max-w-2xl rounded-eco-lg border border-white bg-white p-6 shadow-soft md:p-10">
      <div className="mb-8 border-b border-eco-green-light pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-eco-green-primary">Ajustes de Cuenta</p>
        <h1 className="text-3xl font-extrabold text-eco-green-dark mt-1">Perfil del Agricultor</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gestiona tu información de contacto y visualiza los datos oficiales de tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}
        
        {success && (
          <div role="alert" className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-eco-green-primary">
            ✓ {success}
          </div>
        )}

        {/* Read-Only Fields */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">DNI (Solo Lectura)</label>
            <input
              type="text"
              value={usuario.dni}
              disabled
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 font-semibold text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Fecha de Registro</label>
            <input
              type="text"
              value={fechaRegistroLocal}
              disabled
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 font-semibold text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <hr className="border-eco-green-light" />

        {/* Editable Fields */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="mb-2 block text-sm font-bold text-eco-green-dark">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={!editing || loading}
              placeholder="Tu nombre"
              className={`w-full rounded-xl border px-4 py-3.5 outline-none transition ${
                editing
                  ? 'border-slate-200 focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10'
                  : 'border-slate-100 bg-slate-50 text-slate-600'
              }`}
            />
          </div>

          <div>
            <label htmlFor="apellido" className="mb-2 block text-sm font-bold text-eco-green-dark">Apellido</label>
            <input
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              disabled={!editing || loading}
              placeholder="Tu apellido"
              className={`w-full rounded-xl border px-4 py-3.5 outline-none transition ${
                editing
                  ? 'border-slate-200 focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10'
                  : 'border-slate-100 bg-slate-50 text-slate-600'
              }`}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-eco-green-dark">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing || loading}
              placeholder="correo@ejemplo.com"
              className={`w-full rounded-xl border px-4 py-3.5 outline-none transition ${
                editing
                  ? 'border-slate-200 focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10'
                  : 'border-slate-100 bg-slate-50 text-slate-600'
              }`}
            />
          </div>

          <div>
            <label htmlFor="celular" className="mb-2 block text-sm font-bold text-eco-green-dark">Teléfono / Celular</label>
            <input
              id="celular"
              type="text"
              value={celular}
              onChange={(e) => setCelular(e.target.value.replace(/[^\d+ ]/g, ''))}
              disabled={!editing || loading}
              placeholder="+51 900 000 000"
              className={`w-full rounded-xl border px-4 py-3.5 outline-none transition ${
                editing
                  ? 'border-slate-200 focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10'
                  : 'border-slate-100 bg-slate-50 text-slate-600'
              }`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-eco-green-light">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-xl bg-eco-green-primary px-6 py-3 font-bold text-white shadow-sm transition hover:bg-eco-green-dark"
            >
              Editar Perfil
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-eco-green-primary px-6 py-3 font-bold text-white shadow-sm transition hover:bg-eco-green-dark disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
