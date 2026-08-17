import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, TrendingUp, ArrowRight, Zap, Shield, Gift } from 'lucide-react'
import { getFeaturedProducts, getProducts } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { toast } from 'react-hot-toast'

const Home = () => {
  const dispatch = useDispatch()
  const { featuredProducts, products, isLoading, error } = useSelector(state => state.products)

  useEffect(() => {
    dispatch(getFeaturedProducts(10))
    dispatch(getProducts({ limit: 12, sort: '-createdAt' }))
  }, [dispatch])

  if (error) return <div className="container mx-auto px-4 py-8"><ErrorMessage message={error} variant="error" /></div>

  const AppliancesSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      {/* Washing Machine */}
      <rect x="6" y="8" width="36" height="38" rx="4" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="10" y="12" width="28" height="8" rx="2" fill="#0d1f36"/>
      <circle cx="24" cy="33" r="9" fill="#0d1f36" stroke="#3b82f6" strokeWidth="1.5"/>
      <circle cx="24" cy="33" r="6" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1"/>
      <path d="M20 33 Q24 27 28 33" stroke="#93c5fd" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <circle cx="14" cy="16" r="1.5" fill="#3b82f6"/>
      <circle cx="19" cy="16" r="1.5" fill="#60a5fa"/>
      <rect x="30" y="14" width="5" height="3" rx="1" fill="#3b82f6"/>
    </svg>
  )

  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/69c6589653afdb9a.png?q=100' },
    { name: 'Fashion & Apparel', slug: 'apparel', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/82b3ca5fb2301045.png?q=100' },
    { name: 'Footwear', slug: 'footwear', icon: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=128&q=80' },
    { name: 'Accessories', slug: 'accessories', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/71050627a56b4693.png?q=100' },
    { name: 'Home & Living', slug: 'home', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/29327f40e9c4d26b.png?q=100' },
    { name: 'Fitness & Sports', slug: 'sports', icon: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=128&q=80' },
    { name: 'Appliances', slug: 'appliances', svg: <AppliancesSVG /> }
  ]

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0d0f1a' }}>
      {/* Category Bar */}
      <div className="bg-[#131624] border-b border-white/5 py-3 overflow-x-auto no-scrollbar">
        <div className="container mx-auto px-4 flex justify-between min-w-[700px]">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.slug}`} className="flex flex-col items-center gap-1 group transition-all">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:scale-105 transition-all overflow-hidden p-2">
                {cat.svg ? cat.svg : (
                  <img src={cat.icon} alt={cat.name} className="w-12 h-12 object-contain rounded-xl" />
                )}
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-white uppercase tracking-wider">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 space-y-8">
        {/* Hero Section / Banner */}
        <section className="relative rounded-[2rem] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80"
            className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
            alt="Hero"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-12 z-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500 text-white font-bold text-[10px] uppercase tracking-widest mb-4 w-fit shadow-lg shadow-blue-500/30">
              Limited Time Offer
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-4 leading-none">
              LEVEL UP YOUR <br /> <span className="text-blue-500">EXPERIENCE</span>
            </h1>
            <p className="text-slate-200 text-lg max-w-lg mb-8 font-medium">
              Grab the latest premium electronics with up to <span className="text-white font-bold">40% off</span>. Tomorrow's tech, today.
            </p>
            <Link
              to="/products"
              className="bg-white text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all w-fit shadow-2xl"
            >
              Shop Collection
            </Link>
          </div>
        </section>

        {/* Dynamic Section: Best of Electronics */}
        <section className="bg-[#131624] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Best of Electronics</h2>
              <p className="text-slate-500 text-sm mt-1">Handpicked premium tech for you</p>
            </div>
            <Link to="/products?category=electronics" className="bg-blue-600 text-white text-xs font-black px-6 py-3 rounded-xl hover:bg-blue-500 transition-all uppercase tracking-widest">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Middle Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Audio Excellence', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', color: 'purple' },
            { title: 'Smart Living', img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80', color: 'emerald' },
            { title: 'New Arrivals', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', color: 'blue' }
          ].map((banner, i) => (
            <div key={i} className="group relative h-[250px] rounded-[2rem] overflow-hidden cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-t from-${banner.color}-900/80 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity`}></div>
              <img src={banner.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={banner.title} />
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                <h3 className="text-2xl font-black text-white mb-2 leading-none">{banner.title}</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Explore Now →</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section: Trending Products */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-2 bg-blue-600 rounded-full"></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Trending Now</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {products.slice(0, 10).map(product => (
                <div key={product._id} className="scale-95 hover:scale-100 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter / Feature */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 relative z-10 leading-tight">
            JOIN THE UKATHURIA <br /> <span className="opacity-50">ECOSYSTEM</span>
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 relative z-10 font-medium">
            Be the first to know about product drops, exclusive events, and premium tech news.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all font-bold"
            />
            <button className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}


export default Home
