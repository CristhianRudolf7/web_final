import { Link } from 'react-router-dom'
import { ProductoCard } from '../components/ProductoCard'
import { productos } from '../data/productos'

export function Landing() {
  return (
    <>
      <section className="relative overflow-hidden bg-eco-green-light/55">
        <div className="section-shell grid min-h-[560px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="relative z-10">
            <p className="eyebrow mb-5">Del campo a tu mesa</p>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.06em] text-eco-green-dark sm:text-6xl lg:text-7xl">Cultivos con historia. Compras con propósito.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Conectamos a agricultores de Junín con familias y negocios que valoran el origen, la calidad y el trabajo justo.</p>
            <div className="mt-9 flex flex-wrap gap-4"><a href="#productos" className="rounded-full bg-eco-green-primary px-7 py-3.5 font-bold text-white shadow-lg shadow-eco-green-primary/20 transition hover:bg-eco-green-dark">Explorar productos</a><Link to="/login" className="rounded-full border border-eco-green-primary px-7 py-3.5 font-bold text-eco-green-primary transition hover:bg-white">Soy agricultor</Link></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full bg-white/70" />
            <div className="relative overflow-hidden rounded-[40px] shadow-soft"><img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=85" alt="Agricultora revisando un cultivo" className="aspect-[4/4.3] w-full object-cover" /></div>
            <div className="absolute -bottom-5 -left-5 rounded-eco-md bg-white p-5 shadow-xl"><p className="text-3xl font-extrabold text-eco-green-primary">+120</p><p className="text-sm font-semibold text-slate-500">familias agricultoras</p></div>
          </div>
        </div>
      </section>

      <section id="productos" className="section-shell py-20 lg:py-28">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">Marketplace local</p><h2 className="text-4xl font-extrabold tracking-tight text-eco-green-dark">Lo mejor de nuestra tierra</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Compra directo a quienes cultivan. Cada producto mantiene su origen y su historia.</p></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{productos.map((producto) => <ProductoCard key={producto.id} producto={producto} />)}</div>
      </section>

      <section id="historia" className="bg-eco-green-dark py-20 text-white"><div className="section-shell grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center"><p className="eyebrow text-eco-green-light">Nuestra historia</p><p className="max-w-3xl text-2xl font-medium leading-relaxed text-white/90">Creemos que la tecnología debe acercar, no alejar. Por eso creamos una vitrina digital para que el trabajo de cada agricultor llegue directamente a quien lo aprecia.</p></div></section>
    </>
  )
}
