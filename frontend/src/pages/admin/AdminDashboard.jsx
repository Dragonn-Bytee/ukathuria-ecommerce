import React, { useEffect } from 'react'
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from '../../services/api'
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Menu,
  X,
  Home,
  Settings,
  LogOut
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const menuItems = [
    {
      path: '/admin',
      icon: Home,
      label: 'Dashboard',
      description: 'Overview and analytics'
    },
    {
      path: '/admin/products',
      icon: Package,
      label: 'Products',
      description: 'Manage products and inventory'
    },
    {
      path: '/admin/orders',
      icon: ShoppingCart,
      label: 'Orders',
      description: 'View and manage orders'
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Users',
      description: 'Manage customer accounts'
    },
    {
      path: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Detailed analytics and reports'
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Settings',
      description: 'Store configuration'
    }
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0f1a' }}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col`}
        style={{ background: '#131624', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`flex items-center gap-2.5 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
              <span className="text-white font-black text-xs">A</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white text-sm">Admin Panel</h1>
                <p className="text-[10px] text-slate-500">Ukathuria E-Commerce</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-white transition-colors absolute -right-3 top-6 bg-[#131624] border border-white/10 rounded-full p-0.5">
              <Menu className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                      active
                        ? 'bg-blue-600/15 border border-blue-500/25 text-blue-400'
                        : 'text-slate-400 hover:bg-white/4 hover:text-white border border-transparent'
                    }`}
                  >
                    <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'}`} style={{ width: '18px', height: '18px' }} />
                    {sidebarOpen && (
                      <div>
                        <div className={`text-sm font-semibold ${active ? 'text-blue-300' : ''}`}>{item.label}</div>
                        <div className="text-[10px] text-slate-600">{item.description}</div>
                      </div>
                    )}
                    {active && sidebarOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-slate-500">Administrator</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d0f1a' }}>
          <h2 className="text-white font-bold text-lg">
            {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">Welcome back,</div>
              <div className="text-sm font-semibold text-white">{user?.name}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/products/*" element={<AdminProducts />} />
            <Route path="/orders/*" element={<AdminOrders />} />
            <Route path="/users/*" element={<AdminUsers />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

// Admin Overview Component
const AdminOverview = () => {
  const [stats, setStats] = React.useState({
    totalRevenue: 125430,
    totalOrders: 342,
    totalUsers: 1284,
    avgOrderValue: 366.82,
    recentOrders: [
      { id: '1', customer: 'John Doe', amount: 299.99, status: 'delivered', date: '2024-01-15' },
      { id: '2', customer: 'Jane Smith', amount: 199.99, status: 'processing', date: '2024-01-15' },
      { id: '3', customer: 'Bob Johnson', amount: 549.99, status: 'shipped', date: '2024-01-14' },
    ],
    topProducts: [
      { name: 'Premium Wireless Headphones', sales: 45, revenue: 13499.55 },
      { name: 'Smart Watch Series X', sales: 38, revenue: 7599.62 },
      { name: 'Professional DSLR Camera', sales: 22, revenue: 19799.78 },
    ]
  })
  const [loading, setLoading] = React.useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time store performance metrics</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'emerald', trend: '+12%' },
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'blue', trend: '+8%' },
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'purple', trend: '+15%' },
          { label: 'Avg Order Value', value: formatPrice(stats.avgOrderValue), icon: TrendingUp, color: 'orange', trend: '+3%' },
        ].map((item, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors" style={{ background: '#131624' }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-${item.color}-500/10 text-${item.color}-400`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold text-${item.color}-400 bg-${item.color}-500/10 px-2 py-1 rounded-lg`}>
                {item.trend}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#131624' }}>
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{order.customer}</div>
                      <div className="text-xs text-slate-500">{order.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">{formatPrice(order.amount)}</div>
                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                      order.status === 'delivered' ? 'text-emerald-400' :
                      order.status === 'shipped' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/8 hover:text-white transition-all uppercase tracking-widest">
              View All Orders
            </button>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#131624' }}>
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">Top Performing Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {stats.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.sales} units sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">{formatPrice(product.revenue)}</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+12% growth</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/8 hover:text-white transition-all uppercase tracking-widest">
              Inventory Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// User Management Component
const AdminUsers = () => {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth`)
      setUsers(data.data.users)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load users')
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const toggleAdminRole = async (user) => {
    if (window.confirm(`Are you sure you want to change ${user.name}'s role to ${user.role === 'admin' ? 'user' : 'admin'}?`)) {
      try {
        await axios.put(`${API_URL}/auth/${user._id}/status`, {
          role: user.role === 'admin' ? 'user' : 'admin',
          isActive: user.isActive !== undefined ? user.isActive : true
        })
        toast.success(`Role updated for ${user.name}`)
        fetchUsers() // Refresh list
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update role')
      }
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Users Management</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage customer accounts and access levels</p>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#131624', border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Email</th>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Role</th>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-medium text-white text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    u.role === 'admin' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border-white/10'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleAdminRole(u)}
                    className={`text-xs font-bold px-4 py-1.5 rounded-xl transition-all ${
                      u.role === 'admin'
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-16 text-center text-slate-600 italic">No registered users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


// Products Management Component
const AdminProducts = () => {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '', price: '', category: '', brand: '', description: '', inventory: { quantity: 0 }
  })
  const [editingId, setEditingId] = React.useState(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  const fetchProducts = async () => {
    try {
      // Admin view: fetch all products regardless of status
      const { data } = await axios.get(`${API_URL}/products?limit=100&status=all`)
      setProducts(data.data.products || [])
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load products')
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`)
        toast.success('Product deleted')
        fetchProducts()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        inventory: { quantity: Number(formData.inventory.quantity) }
      }

      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, payload)
        toast.success('Product updated')
      } else {
        // Auto-generate SKU: first 3 letters of name + timestamp suffix
        const skuBase = formData.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5)
        const skuSuffix = Date.now().toString().slice(-6)
        payload.sku = `${skuBase}-${skuSuffix}`
        payload.status = 'active'
        await axios.post(`${API_URL}/products`, payload)
        toast.success('Product created')
      }
      setIsModalOpen(false)
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    }
  }

  const openEdit = (prod) => {
    setFormData({
      name: prod.name,
      price: prod.price,
      category: prod.category,
      brand: prod.brand,
      description: prod.description || '',
      inventory: { quantity: prod.inventory?.quantity || 0 }
    })
    setEditingId(prod._id)
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setFormData({ name: '', price: '', category: '', brand: '', description: '', inventory: { quantity: 0 } })
    setEditingId(null)
    setIsModalOpen(true)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Products Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
        >
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#131624', border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="w-full text-left">
          <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Price</th>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Stock</th>
              <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                <td className="px-6 py-4 text-slate-300">${p.price?.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.inventory?.quantity > 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {p.inventory?.quantity || 0} in stock
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-rose-400 hover:text-rose-300 text-sm font-semibold transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-16 text-center text-slate-600">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-8 w-full max-w-lg shadow-2xl" style={{ background: '#131624', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-lg font-bold text-white mb-6">{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Stock Qty</label>
                  <input required type="number" value={formData.inventory.quantity} onChange={e => setFormData({...formData, inventory: {quantity: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Brand</label>
                  <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none" rows="3" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/8 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const AdminOrders = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4">
      <ShoppingCart className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Orders Management</h3>
    <p className="text-slate-500 max-w-xs mx-auto text-sm">Order tracking and invoice management is being optimized for the new Ukathuria engine.</p>
  </div>
)

const AdminAnalytics = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-purple-600/10 text-purple-400 rounded-2xl flex items-center justify-center mb-4">
      <BarChart3 className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
    <p className="text-slate-500 max-w-xs mx-auto text-sm">Predictive sales forecasting and user heatmaps will be available in the next release.</p>
  </div>
)

const AdminSettings = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-slate-600/10 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
      <Settings className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">System Settings</h3>
    <p className="text-slate-500 max-w-xs mx-auto text-sm">API keys, webhook configurations, and storefront customization settings coming soon.</p>
  </div>
)

export default AdminDashboard
