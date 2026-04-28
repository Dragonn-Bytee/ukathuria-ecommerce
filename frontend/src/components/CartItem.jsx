import React from 'react'
import { useDispatch } from 'react-redux'
import { removeFromCart, updateCartItemQuantity } from '../store/slices/cartSlice'
import LoadingSpinner from './LoadingSpinner'
import { toast } from 'react-hot-toast'

const CartItem = ({ item, isLoading = false }) => {
  const dispatch = useDispatch()

  const handleRemoveFromCart = async () => {
    try {
      await dispatch(removeFromCart(item.product._id)).unwrap()
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error(error.message || 'Failed to remove item')
    }
  }

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return
    
    try {
      await dispatch(updateCartItemQuantity({
        productId: item.product._id,
        quantity: newQuantity
      })).unwrap()
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity')
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
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded-md"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg'
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">
            {item.product.name}
          </h4>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-600 font-bold">
              {formatPrice(item.price)}
            </span>
            
            <span className="text-sm text-gray-600">
              Subtotal: {formatPrice(item.price * item.quantity)}
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min="1"
                max="99"
                className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
              />
              
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Stock Status */}
            <span className="text-sm text-gray-600">
              {item.product.inventory?.trackQuantity 
                ? `${item.product.inventory.quantity} available` 
                : 'In stock'
              }
            </span>
          </div>
        </div>

        {/* Remove Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleRemoveFromCart}
            className="text-red-500 hover:text-red-700 transition-colors p-2"
            title="Remove from cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartItem
