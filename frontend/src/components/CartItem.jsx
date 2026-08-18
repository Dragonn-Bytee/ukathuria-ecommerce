import React from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { removeFromCart, updateCartItemQuantity } from '../store/slices/cartSlice'
import { Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'react-hot-toast'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'

const CartItem = ({ item, isLoading = false }) => {
  const dispatch = useDispatch()

  if (!item || !item.product) {
    return null
  }

  const product = item.product
  const productId = product._id || product

  const handleRemoveFromCart = async () => {
    try {
      await dispatch(removeFromCart(productId)).unwrap()
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error(error.message || error || 'Failed to remove item')
    }
  }

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return
    
    try {
      await dispatch(updateCartItemQuantity({
        productId,
        quantity: newQuantity
      })).unwrap()
    } catch (error) {
      toast.error(error.message || error || 'Failed to update quantity')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="bg-[#131624] rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white/5 rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-white/5 rounded w-1/2"></div>
            <div className="h-4 bg-white/5 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  const imgSrc = product.images?.[0]?.url || FALLBACK_IMAGE

  return (
    <div className="group bg-[#131624] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Product Image */}
        <Link to={`/product/${productId}`} className="flex-shrink-0">
          <div className="w-24 h-24 bg-[#0d0f1a] rounded-xl overflow-hidden p-2 flex items-center justify-center border border-white/5">
            <img
              src={imgSrc}
              alt={product.name || 'Product'}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE
              }}
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link to={`/product/${productId}`}>
                <h4 className="text-base font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                  {product.name}
                </h4>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {product.brand || 'Premium'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  {product.inventory?.trackQuantity 
                    ? (product.inventory.quantity > 0 ? `${product.inventory.quantity} in stock` : 'Out of stock')
                    : 'In stock'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-black text-white">
                {formatPrice(item.price * item.quantity)}
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-slate-500">
                  {formatPrice(item.price)} each
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Qty:</span>
              <div className="flex items-center bg-[#0d0f1a] border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={handleRemoveFromCart}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-rose-500/10"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem
