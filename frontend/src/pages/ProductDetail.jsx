import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProduct, addReview } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { ShoppingCart, Star, Heart, Share2, Truck, Shield, RefreshCw, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentProduct, isLoading, error } = useSelector(state => state.products)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' })

  useEffect(() => {
    dispatch(getProduct(id))
    window.scrollTo(0, 0)
  }, [dispatch, id])

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: id, quantity })).unwrap()
      toast.success('Added to cart!')
    } catch (error) {
      const msg = typeof error === 'string' ? error : (error?.message || 'Failed to add to cart')
      toast.error(msg)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-[#0d0f1a]"><LoadingSpinner size="lg" /></div>
  if (error) return <div className="container mx-auto px-4 py-8 bg-[#0d0f1a]"><ErrorMessage message={error} variant="error" /></div>
  if (!currentProduct) return <div className="container mx-auto px-4 py-8 bg-[#0d0f1a] text-white">Product not found</div>

  const product = currentProduct
  const discountPrice = product.price * 1.4

  return (
    <div className="min-h-screen pb-20" style={{ background: '#0d0f1a' }}>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">
          <Link to="/" className="hover:text-blue-500">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-500">Shop</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT COLUMN: Sticky Images & Primary Actions (Flipkart Style) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-24 space-y-4">
            <div className="bg-[#131624] border border-white/5 rounded-3xl p-4 sm:p-10 flex items-center justify-center aspect-square relative overflow-hidden group">
               <img
                src={product.images?.[selectedImage]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <button className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white/2 ${
                    selectedImage === index ? 'border-blue-500 scale-105' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={image.url} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* ACTION BUTTONS (Flipkart Style: Large, Side-by-side) */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.inventory?.quantity === 0}
                className="flex items-center justify-center gap-3 bg-[#ff9f00] hover:bg-[#fb641b] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                disabled={product.inventory?.quantity === 0}
                className="flex items-center justify-center gap-3 bg-[#fb641b] hover:bg-[#ff9f00] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-600/30"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info */}
          <div className="w-full lg:w-[60%] space-y-6">
            <div>
              <p className="text-blue-500 font-black text-xs uppercase tracking-widest mb-2">{product.brand || 'Premium Edition'}</p>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-emerald-500 px-3 py-1 rounded-lg text-white font-black text-sm">
                  <span>{product.rating || 4.5}</span>
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-slate-500 font-bold text-sm">
                  {product.numReviews || 128} Ratings & {product.reviews?.length || 45} Reviews
                </span>
                <div className="bg-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                   <span className="text-[10px] font-black text-white italic">Ukathuria</span>
                   <span className="text-[10px] font-bold text-white/70">Assured</span>
                </div>
              </div>
            </div>

            <div className="bg-white/2 rounded-3xl p-8 border border-white/5 space-y-4">
               <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-white">{formatPrice(product.price)}</span>
                  <span className="text-xl text-slate-500 line-through font-bold">{formatPrice(discountPrice)}</span>
                  <span className="text-xl text-emerald-400 font-black">40% off</span>
               </div>
               
               {/* Bank Offers (Flipkart Style) */}
               <div className="space-y-3 pt-4 border-t border-white/5">
                 <p className="text-sm font-black text-white uppercase tracking-wider">Available Offers</p>
                 {[
                   'Bank Offer: 10% instant discount on Credit Cards',
                   'Combo Offer: Buy 2 items save 5%',
                   'No Cost EMI: Available on select cards',
                   'Special Price: Get extra $50 off'
                 ].map((offer, i) => (
                   <div key={i} className="flex items-start gap-3">
                     <Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                     <p className="text-sm text-slate-300 font-medium">{offer}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-[#131624] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400"><Truck className="w-6 h-6" /></div>
                <div>
                  <p className="text-white font-bold text-sm">Free Delivery</p>
                  <p className="text-slate-500 text-xs">by Tomorrow, 11:00 AM</p>
                </div>
              </div>
              <div className="p-6 bg-[#131624] border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400"><Shield className="w-6 h-6" /></div>
                <div>
                  <p className="text-white font-bold text-sm">1 Year Warranty</p>
                  <p className="text-slate-500 text-xs">Full manufacturer coverage</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Description</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Specifications (Flipkart Style) */}
            <div className="space-y-4 pt-8 border-t border-white/5">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Specifications</h3>
               <div className="bg-[#131624] rounded-2xl border border-white/5 divide-y divide-white/5">
                 {[
                   { label: 'Model Name', value: product.name },
                   { label: 'Category', value: product.category },
                   { label: 'Brand', value: product.brand || 'Premium' },
                   { label: 'Color', value: 'Cosmic Black' },
                   { label: 'Material', value: 'Aerospace Grade Aluminum' }
                 ].map((spec, i) => (
                   <div key={i} className="grid grid-cols-3 p-4">
                     <span className="text-slate-500 font-bold text-sm">{spec.label}</span>
                     <span className="col-span-2 text-white font-medium text-sm">{spec.value}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default ProductDetail
