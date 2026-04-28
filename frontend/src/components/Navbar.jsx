import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice.js'
import { ShoppingCart, Search, User, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { getProducts, setFilters } from '../store/slices/productSlice'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user: userInfo } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)
  const [search, setSearch] = useState('')

  const logoutHandler = () => {
    dispatch(logout())
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search }))
    dispatch(getProducts({ search }))
    navigate('/products')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 shadow-2xl" style={{ background: '#131624' }}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4 lg:gap-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:rotate-6 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"/>
            </svg>
          </div>
          <span className="text-white font-black text-2xl tracking-tighter hidden sm:block">Ukathuria</span>
        </Link>

        {/* Search - Flipkart Style (Center, Wide) */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands and more"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-5 py-2.5 pr-12 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/10 transition-all shadow-inner"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Action Links */}
        <div className="flex items-center gap-6 lg:gap-8 ml-auto">
          {userInfo ? (
            <div className="flex items-center gap-6">
              {userInfo.role === 'admin' && (
                <Link to="/admin" className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Seller Hub
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 text-white font-bold text-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[10px] font-black border-2 border-white/10">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{userInfo.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500 group-hover:rotate-180 transition-transform" />
                </button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1e2e] border border-white/5 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                  <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white font-medium">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white font-medium">Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white font-medium">Wishlist</Link>
                  <hr className="my-2 border-white/5" />
                  <button onClick={logoutHandler} className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 font-bold flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-white text-black hover:bg-blue-600 hover:text-white px-7 py-2 rounded-xl text-sm font-black transition-all shadow-lg">
              Login
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-2 text-white font-bold text-sm group">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg shadow-rose-600/30">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden lg:block uppercase tracking-widest text-[10px]">Cart</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        </form>
      </div>
    </nav>
  )
}


export default Navbar
