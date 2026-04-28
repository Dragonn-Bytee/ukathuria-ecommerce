import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { Star, ShoppingCart, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

const FALLBACK_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  apparel: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
}

const getFallback = (product) =>
  FALLBACK_IMAGES[product?.category?.toLowerCase()] || FALLBACK_IMAGES.default

const StarRating = ({ rating = 4.5, reviews = 0 }) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className={`w-3.5 h-3.5 ${i <= full ? 'text-yellow-400' : i === full+1 && half ? 'text-yellow-400' : 'text-slate-600'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      {reviews > 0 && <span className="text-xs text-slate-400">({reviews} reviews)</span>}
    </div>
  )
}

const ProductCard = ({ product, isLoading = false }) => {
  const dispatch = useDispatch()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap()
      toast.success('Added to cart!')
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

  if (isLoading) {
    return (
      <div className="bg-[#131624] rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-square shimmer"></div>
        <div className="p-4 space-y-2">
          <div className="h-4 shimmer rounded w-3/4"></div>
          <div className="h-3 shimmer rounded w-1/2"></div>
          <div className="h-6 shimmer rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  const imgSrc = product.images?.[0]?.url || getFallback(product)
  const outOfStock = product.inventory?.trackQuantity && product.inventory?.quantity === 0
  const discountPrice = product.price * 1.4 // Mock original price for discount effect

  return (
    <div className="group relative bg-[#131624] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl">
      {/* Image Area */}
      <Link to={`/product/${product._id}`} className="block relative p-4 bg-white/2">
        <div className="aspect-square overflow-hidden rounded-xl bg-[#0d0f1a] flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = getFallback(product) }}
          />
        </div>
        
        {/* Floating Add to Cart */}
        <button 
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="absolute bottom-6 right-6 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-10 hover:bg-blue-500"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>

        {/* Badges */}
        {product.featured && (
          <span className="absolute top-6 left-6 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-lg">
            Best Seller
          </span>
        )}
      </Link>

      {/* Info Area */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{product.brand || 'Premium'}</p>
          <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400">
            <span>{product.rating || 4.5}</span>
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="text-white font-bold text-sm leading-tight mb-2 hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Ukathuria Assured (Flipkart Style) */}
        <div className="flex items-center gap-1 mb-3">
          <div className="bg-blue-600 px-1 py-0.5 rounded flex items-center">
             <span className="text-[8px] font-black text-white italic">Ukathuria</span>
          </div>
          <span className="text-[9px] font-bold text-slate-500">Assured</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
          <span className="text-xs text-slate-500 line-through">{formatPrice(discountPrice)}</span>
          <span className="text-xs font-bold text-emerald-400">40% off</span>
        </div>
      </div>

      {outOfStock && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
          <span className="bg-white/10 text-white text-[10px] font-black px-4 py-2 rounded-xl border border-white/20 uppercase tracking-widest">Out of Stock</span>
        </div>
      )}
    </div>
  )
}


export default ProductCard
