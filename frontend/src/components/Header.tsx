import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Marketplace' },
  { to: '/#historia', label: 'Nuestra historia' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-eco-green-light bg-white/95 shadow-sm backdrop-blur">
      <div className="section-shell flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-11 w-11 place-items-center rounded-eco-sm bg-eco-green-light text-2xl">🌱</span>
          <span className="text-xl font-extrabold tracking-tight text-eco-green-dark">EcoPlataforma</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.label} to={link.to} className="text-sm font-semibold text-slate-600 transition hover:text-eco-green-primary">
              {link.label}
            </NavLink>
          ))}
          <Link to="/login" className="rounded-full bg-eco-green-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-eco-green-dark">
            Acceder
          </Link>
        </nav>

        <button className="rounded-lg p-2 text-eco-green-dark md:hidden" aria-label="Abrir menú" onClick={() => setOpen(!open)}>
          <span className="block h-0.5 w-6 bg-current" />
          <span className="my-1.5 block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </button>
      </div>
      {open && (
        <nav className="border-t border-eco-green-light bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => <NavLink key={link.label} to={link.to} onClick={() => setOpen(false)} className="font-semibold text-slate-700">{link.label}</NavLink>)}
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl bg-eco-green-primary px-4 py-3 text-center font-bold text-white">Acceder</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
