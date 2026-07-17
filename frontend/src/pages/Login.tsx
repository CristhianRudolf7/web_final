import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export function Login() {
  const navigate = useNavigate()
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!/^\d{8}$/.test(dni)) return setError('El DNI debe tener exactamente 8 números.')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    setLoading(true)
    try {
      await axios.post('/api/login/', { dni, password }, { withCredentials: true })
      navigate('/dashboard')
    } catch {
      setError('No se pudo iniciar sesión. Verifica tus credenciales.')
    } finally { setLoading(false) }
  }

  return <section className="min-h-[calc(100vh-9rem)] bg-eco-green-light/40 px-5 py-16"><div className="mx-auto max-w-md rounded-eco-lg border border-white bg-white p-7 shadow-soft sm:p-10"><Link to="/" className="text-sm font-bold text-eco-green-primary">← Volver al marketplace</Link><p className="eyebrow mt-10 mb-3">Espacio del agricultor</p><h1 className="text-4xl font-extrabold tracking-tight text-eco-green-dark">Bienvenido de vuelta.</h1><p className="mt-3 leading-7 text-slate-500">Accede a tu panel para gestionar tu producción.</p><form onSubmit={submit} className="mt-8 space-y-5"><div><label htmlFor="dni" className="mb-2 block text-sm font-bold text-eco-green-dark">DNI</label><input id="dni" value={dni} onChange={(event) => setDni(event.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" maxLength={8} placeholder="8 números" className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10" /></div><div><label htmlFor="password" className="mb-2 block text-sm font-bold text-eco-green-dark">Contraseña</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-eco-green-primary focus:ring-4 focus:ring-eco-green-primary/10" /></div>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-eco-green-primary px-5 py-3.5 font-bold text-white transition hover:bg-eco-green-dark disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Validando…' : 'Iniciar sesión'}</button></form></div></section>
}
