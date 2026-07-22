import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function Registro() {
  const navegacion = useNavigate()
  const [dni, setDni] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [celular, setCelular] = useState('')
  const [clave, setClave] = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const [mostrarConfirmarClave, setMostrarConfirmarClave] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(false)

  const alEnviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setError('')
    setExito('')

    if (!/^\d{8}$/.test(dni)) {
      const msg = 'El DNI debe tener exactamente 8 dígitos numéricos.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (!nombre.trim()) {
      const msg = 'El nombre es obligatorio.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (!apellido.trim()) {
      const msg = 'El apellido es obligatorio.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (!/^\d{9}$/.test(celular)) {
      const msg = 'El celular es obligatorio y debe tener exactamente 9 dígitos.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (email.trim() && !email.includes('@')) {
      const msg = 'Ingresa un correo electrónico válido.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (clave.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (clave !== confirmarClave) {
      const msg = 'Las contraseñas no coinciden.'
      setError(msg)
      toast.error(msg)
      return
    }

    setCargando(true)
    try {
      await axios.post('/api/registro/', {
        dni,
        nombre,
        apellido,
        celular,
        email: email.trim() || null,
        password: clave,
        confirmar_password: confirmarClave,
      })
      const msgExito = '¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...'
      setExito(msgExito)
      toast.success(msgExito)
      setTimeout(() => {
        navegacion('/login')
      }, 1500)
    } catch (errorAxios: any) {
      let msg = 'Ocurrió un error al crear la cuenta. Inténtalo nuevamente.'
      if (errorAxios.response?.data) {
        const r = errorAxios.response.data
        if (r.dni) msg = 'El DNI ya se encuentra registrado.'
        else if (r.celular) msg = 'El número de celular ya se encuentra registrado.'
        else if (r.email) msg = 'El correo electrónico ya se encuentra registrado.'
        else if (r.password) msg = r.password[0]
        else if (r.detalle) msg = r.detalle
      }
      setError(msg)
      toast.error(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-9rem)] bg-eco-green-light/40 px-5 py-12">
      <div className="mx-auto max-w-lg rounded-eco-lg border border-white bg-white p-7 shadow-soft sm:p-10">
        <Link to="/" className="text-sm font-bold text-eco-green-primary">
          ← Volver al marketplace
        </Link>
        <p className="eyebrow mt-8 mb-2">Espacio del agricultor</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-eco-green-dark sm:text-4xl">
          Crea tu cuenta.
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Únete a la plataforma para gestionar tu producción agrícola y parcelas.
        </p>

        <form onSubmit={alEnviar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="dni" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              DNI *
            </label>
            <input
              id="dni"
              value={dni}
              onChange={(evento) => setDni(evento.target.value.replace(/\D/g, '').slice(0, 8))}
              inputMode="numeric"
              maxLength={8}
              placeholder="8 números de DNI"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
                Nombre *
              </label>
              <input
                id="nombre"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
            </div>
            <div>
              <label htmlFor="apellido" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
                Apellido *
              </label>
              <input
                id="apellido"
                value={apellido}
                onChange={(evento) => setApellido(evento.target.value)}
                placeholder="Tu apellido"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="celular" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              Número de Celular *
            </label>
            <input
              id="celular"
              value={celular}
              onChange={(evento) => setCelular(evento.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              maxLength={9}
              placeholder="9 números de celular"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              Correo Electrónico <span className="font-normal lowercase text-slate-400">(opcional)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
            />
          </div>

          <div>
            <label htmlFor="clave" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              Contraseña *
            </label>
            <div className="relative">
              <input
                id="clave"
                type={mostrarClave ? 'text' : 'password'}
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-eco-green-dark"
                aria-label={mostrarClave ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarClave ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274-4.057 5.065-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmarClave" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-eco-green-dark">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <input
                id="confirmarClave"
                type={mostrarConfirmarClave ? 'text' : 'password'}
                value={confirmarClave}
                onChange={(evento) => setConfirmarClave(evento.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarClave(!mostrarConfirmarClave)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-eco-green-dark"
                aria-label={mostrarConfirmarClave ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarConfirmarClave ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274-4.057 5.065-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {exito && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {exito}
            </p>
          )}

          <button
            disabled={cargando}
            className="mt-2 w-full rounded-xl bg-eco-green-primary px-5 py-3.5 font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-eco-green-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </section>
  )
}
