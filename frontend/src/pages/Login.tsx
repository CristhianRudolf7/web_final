import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function Login() {
  const navegacion = useNavigate()
  const [dni, setDni] = useState('')
  const [clave, setClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const alEnviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setError('')
    if (!/^\d{8}$/.test(dni)) {
      const msg = 'El DNI debe tener exactamente 8 números.'
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
    setCargando(true)
    try {
      await axios.post('/api/login/', { dni, password: clave }, { withCredentials: true })
      toast.success('¡Bienvenido! Sesión iniciada correctamente.')
      navegacion('/dashboard')
    } catch {
      const msg = 'No se pudo iniciar sesión. Verifica tus credenciales.'
      setError(msg)
      toast.error(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-9rem)] bg-eco-green-light/40 px-5 py-16">
      <div className="mx-auto max-w-md rounded-eco-lg border border-white bg-white p-7 shadow-soft sm:p-10">
        <Link to="/" className="text-sm font-bold text-eco-green-primary">
          ← Volver al marketplace
        </Link>
        <p className="eyebrow mt-10 mb-3">Espacio del agricultor</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-eco-green-dark">
          Bienvenido de vuelta.
        </h1>
        <p className="mt-3 leading-7 text-slate-500">
          Accede a tu panel para gestionar tu producción.
        </p>

        <form onSubmit={alEnviar} className="mt-8 space-y-5">
          <div>
            <label htmlFor="dni" className="mb-2 block text-sm font-bold text-eco-green-dark">
              DNI
            </label>
            <input
              id="dni"
              value={dni}
              onChange={(evento) => setDni(evento.target.value.replace(/\D/g, '').slice(0, 8))}
              inputMode="numeric"
              maxLength={8}
              placeholder="8 números"
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
            />
          </div>

          <div>
            <label htmlFor="clave" className="mb-2 block text-sm font-bold text-eco-green-dark">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="clave"
                type={mostrarClave ? 'text' : 'password'}
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                placeholder="Tu contraseña"
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 pr-12 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10"
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

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            disabled={cargando}
            className="w-full rounded-xl bg-eco-green-primary px-5 py-3.5 font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargando ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-bold text-eco-green-primary hover:underline">
            Crea tu cuenta aquí
          </Link>
        </p>
      </div>
    </section>
  )
}

