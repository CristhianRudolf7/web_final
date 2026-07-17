export function Footer() {
  return (
    <footer className="border-t border-eco-green-light bg-eco-green-light/40">
      <div className="section-shell flex flex-col gap-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-eco-green-dark">© 2026 EcoPlataforma</p>
        <div className="flex gap-5"><a href="mailto:hola@ecoplataforma.pe" className="hover:text-eco-green-primary">Contacto</a><a href="#" className="hover:text-eco-green-primary">Instagram</a><a href="#" className="hover:text-eco-green-primary">Facebook</a></div>
      </div>
    </footer>
  )
}
