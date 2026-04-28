import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getCart, clearCart } from '../store/slices/cartSlice'
import CartItem from '../components/CartItem'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Cart = () => {
  const dispatch = useDispatch()
  const { items, totalItems, subtotal, isLoading, error } = useSelector(state => state.cart)

  useEffect(() => {
    dispatch(getCart())
  }, [dispatch])

  const handleClearCart = async () => {
    if (window.confirm('Clear your entire cart?')) {
      try {
        await dispatch(clearCart()).unwrap()
        toast.success('Cart cleared')
      } catch (error) {
        toast.error('Failed to clear cart')
      }
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  if (error) return <div className="container mx-auto px-4 py-8 bg-[#0d0f1a]"><ErrorMessage message={error} variant="error" /></div>

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0d0f1a' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Cart Items (Flipkart Style) */}
          <div className="flex-1 space-y-4">
            <div className="bg-[#131624] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">My Cart ({totalItems})</h2>
                {items.length > 0 && (
                  <button onClick={handleClearCart} className="text-xs font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Clear Cart
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 px-8">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Your cart is empty!</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">Explore our premium tech ecosystem and add items to your cart.</p>
                  <Link to="/products" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all inline-block shadow-xl shadow-blue-600/20">
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {items.map(item => (
                    <div key={item.product._id} className="p-8">
                       <CartItem item={item} />
                    </div>
                  ))}
                  
                  {/* Place Order Sticky (Flipkart Style) */}
                  <div className="p-6 bg-[#1a1e2e]/50 border-t border-white/5 flex justify-end">
                    <Link to="/checkout" className="bg-[#fb641b] text-white px-12 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/30 hover:bg-[#ff9f00] transition-all">
                      Place Order
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Price Details (Flipkart Style) */}
          {items.length > 0 && (
            <div className="lg:w-[380px] space-y-4">
              <div className="bg-[#131624] border border-white/5 rounded-3xl overflow-hidden sticky top-24 shadow-2xl">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Price Details</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">Price ({totalItems} items)</span>
                    <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">Platform Fee</span>
                    <span className="text-emerald-400 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">Delivery Charges</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-emerald-400' : 'text-white'}`}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-medium">Tax & GST</span>
                    <span className="text-white font-bold">{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-dashed border-white/10 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-black text-white uppercase tracking-tighter">Total Amount</span>
                      <span className="text-lg font-black text-white">{formatPrice(total)}</span>
                    </div>
                    
                    <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-emerald-500/20">
                      You will save {formatPrice(subtotal * 0.4)} on this order
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-white/2 flex items-center gap-3">
                   <Shield className="w-5 h-5 text-slate-500" />
                   <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight">
                     Safe and Secure Payments. Easy returns. 100% Authentic products.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export default Cart
