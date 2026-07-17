import { Link } from 'react-router-dom'

export function Dashboard() { return <section className="section-shell min-h-[calc(100vh-9rem)] py-20"><p className="eyebrow mb-3">Panel privado</p><h1 className="text-5xl font-extrabold text-eco-green-dark">Tu espacio de cultivo</h1><p className="mt-4 text-lg text-slate-600">La gestión de parcelas y productos estará disponible en los siguientes sprints.</p><Link to="/" className="mt-8 inline-block rounded-full bg-eco-green-primary px-6 py-3 font-bold text-white">Volver al marketplace</Link></section> }
