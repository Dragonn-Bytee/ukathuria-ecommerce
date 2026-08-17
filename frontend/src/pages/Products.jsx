import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories, getBrands, setFilters, clearFilters } from '../store/slices/productSlice'
import ProductCard from '../components/ProductCard'
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

// ─── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price',      label: 'Price: Low → High' },
  { value: '-price',     label: 'Price: High → Low' },
  { value: '-rating',    label: 'Highest Rated' },
  { value: 'name',       label: 'Name: A – Z' },
]

// ─── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// ─── Collapsible section wrapper ───────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/6 py-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-0 group"
      >
        <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          {title}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 mt-3 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  )
}

// ─── Checkbox row ──────────────────────────────────────────────────────────────
const CheckRow = ({ label, checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group text-left ${
      checked
        ? 'bg-blue-600/15 border border-blue-500/30'
        : 'hover:bg-white/4 border border-transparent'
    }`}
  >
    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
      checked ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-blue-500'
    }`}>
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
    <span className={`text-sm transition-colors capitalize ${checked ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}>
      {label}
    </span>
  </button>
)

// ─── Star rating picker ────────────────────────────────────────────────────────
const RatingPicker = ({ value, onChange }) => (
  <div className="space-y-1.5">
    {[5, 4, 3, 2, 1].map(star => (
      <button
        key={star}
        onClick={() => onChange(value === String(star) ? '' : String(star))}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-150 ${
          value === String(star)
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'border-transparent hover:bg-white/4'
        }`}
      >
        <span className="flex">
          {[1,2,3,4,5].map(i => (
            <svg key={i} className={`w-3 h-3 ${i <= star ? 'text-yellow-400' : 'text-slate-700'}`}
              fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </span>
        <span className={`text-xs font-medium transition-colors ${value === String(star) ? 'text-yellow-300' : 'text-slate-400'}`}>
          {star === 5 ? '5 stars' : `${star}+ stars`}
        </span>
      </button>
    ))}
  </div>
)

// ─── Active filter pill ────────────────────────────────────────────────────────
const Pill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-white transition-colors">
      <X className="w-3 h-3" />
    </button>
  </span>
)

// ══════════════════════════════════════════════════════════════════════════════
const Products = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, categories, brands, pagination, isLoading } = useSelector(s => s.products)

  // Parse filters from URL params
  const urlCategory = searchParams.get('category') || ''
  const urlBrand = searchParams.get('brand') || ''
  const urlSearch = searchParams.get('search') || ''
  const urlSort = searchParams.get('sort') || '-createdAt'
  const urlMinPrice = searchParams.get('minPrice') || ''
  const urlMaxPrice = searchParams.get('maxPrice') || ''
  const urlRating = searchParams.get('rating') || ''

  const [f, setF] = useState({
    category: urlCategory,
    brand: urlBrand,
    search: urlSearch,
    sort: urlSort,
    minPrice: urlMinPrice,
    maxPrice: urlMaxPrice,
    rating: urlRating,
  })

  const [priceMax, setPriceMax] = useState(urlMaxPrice ? parseInt(urlMaxPrice) : 3000)
  const [showFilters, setShowFilters] = useState(true)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef()

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load static category/brand metadata once
  useEffect(() => {
    dispatch(getCategories())
    dispatch(getBrands())
  }, [dispatch])

  // Sync state whenever URL searchParams change
  useEffect(() => {
    const currentCategory = searchParams.get('category') || ''
    const currentBrand = searchParams.get('brand') || ''
    const currentSearch = searchParams.get('search') || ''
    const currentSort = searchParams.get('sort') || '-createdAt'
    const currentMinPrice = searchParams.get('minPrice') || ''
    const currentMaxPrice = searchParams.get('maxPrice') || ''
    const currentRating = searchParams.get('rating') || ''

    const newFilter = {
      category: currentCategory,
      brand: currentBrand,
      search: currentSearch,
      sort: currentSort,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      rating: currentRating,
    }

    setF(newFilter)
    if (currentMaxPrice) setPriceMax(parseInt(currentMaxPrice))

    // Fetch matching products
    const queryParams = { ...newFilter }
    Object.keys(queryParams).forEach(key => {
      if (!queryParams[key]) delete queryParams[key]
    })
    dispatch(setFilters(queryParams))
    dispatch(getProducts(queryParams))
  }, [searchParams, dispatch])

  // ── Sync filter changes to URL searchParams ────────────────────────────────
  const applyFiltersToUrl = useCallback((newFilters) => {
    const params = new URLSearchParams()
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== '-createdAt') {
        params.set(key, newFilters[key])
      }
    })
    setSearchParams(params)
  }, [setSearchParams])

  const debouncedApplyUrl = useDebounce(applyFiltersToUrl, 300)

  // Update a single filter key immediately (or debounced for slider)
  const update = (key, val, debounce = false) => {
    const next = { ...f, [key]: val }
    setF(next)
    if (debounce) debouncedApplyUrl(next)
    else applyFiltersToUrl(next)
  }

  // ── Clear everything ────────────────────────────────────────────────────────
  const handleClear = () => {
    setPriceMax(3000)
    setSearchParams(new URLSearchParams())
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  const handlePage = (page) => {
    const queryParams = { ...f, page }
    Object.keys(queryParams).forEach(key => {
      if (!queryParams[key]) delete queryParams[key]
    })
    dispatch(getProducts(queryParams))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Active filter pills ─────────────────────────────────────────────────────
  const activePills = [
    f.search   && { label: `"${f.search}"`, key: 'search' },
    f.category && { label: `Category: ${f.category}`, key: 'category' },
    f.brand    && { label: `Brand: ${f.brand}`, key: 'brand' },
    f.maxPrice && { label: `Under $${f.maxPrice}`, key: 'maxPrice' },
    f.rating   && { label: `${f.rating}+ ★`, key: 'rating' },
  ].filter(Boolean)

  const sortLabel = SORT_OPTIONS.find(o => o.value === f.sort)?.label || 'Newest First'
  const hasActive = activePills.length > 0

  return (
    <div className="min-h-screen" style={{ background: '#0d0f1a' }}>
      <div className="max-w-screen-xl mx-auto px-6 py-8">

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                showFilters
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActive && (
                <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activePills.length}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort by: <span className="text-white">{sortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-2 bg-[#1a1f35] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-30 w-56 py-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { update('sort', opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        f.sort === opt.value
                          ? 'text-blue-400 bg-blue-600/10 font-semibold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {opt.label}
                      {f.sort === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product count */}
          <p className="text-slate-500 text-sm">
            Showing <span className="text-white font-semibold">{pagination?.total ?? products.length}</span> products
          </p>
        </div>

        {/* ── Active filter pills ──────────────────────────────────────────── */}
        {hasActive && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs text-slate-500 mr-1">Active filters:</span>
            {activePills.map(p => (
              <Pill key={p.key} label={p.label} onRemove={() => update(p.key, '')} />
            ))}
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}

        {/* ── Main layout ──────────────────────────────────────────────────── */}
        <div className="flex gap-7 items-start">

          {/* ── Filter Sidebar ────────────────────────────────────────────── */}
          <div className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${showFilters ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
            {showFilters && (
              <div className="w-64 rounded-2xl overflow-hidden" style={{ background: '#131624', border: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <span className="text-white font-bold text-sm tracking-wide">Filter Options</span>
                  {hasActive && (
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                <div className="px-4 pb-5">
                  {/* Category */}
                  <Section title="Category">
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {categories.length > 0 ? categories.map(cat => (
                        <CheckRow
                          key={cat}
                          label={cat}
                          checked={f.category.toLowerCase() === cat.toLowerCase()}
                          onChange={() => update('category', f.category.toLowerCase() === cat.toLowerCase() ? '' : cat)}
                        />
                      )) : (
                        <p className="text-xs text-slate-600 px-3">Loading categories...</p>
                      )}
                    </div>
                  </Section>

                  {/* Brand */}
                  <Section title="Brand">
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {brands.length > 0 ? brands.map(brand => (
                        <CheckRow
                          key={brand}
                          label={brand}
                          checked={f.brand.toLowerCase() === brand.toLowerCase()}
                          onChange={() => update('brand', f.brand.toLowerCase() === brand.toLowerCase() ? '' : brand)}
                        />
                      )) : (
                        <p className="text-xs text-slate-600 px-3">Loading brands...</p>
                      )}
                    </div>
                  </Section>

                  {/* Price Range */}
                  <Section title="Price Range">
                    <div className="px-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-3">
                        <span>$0</span>
                        <span className="text-blue-400">${priceMax}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={0} max={3000} step={25}
                          value={priceMax}
                          onChange={e => {
                            const v = e.target.value
                            setPriceMax(parseInt(v))
                            update('maxPrice', v, true) // debounced
                          }}
                          className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 ${(priceMax/3000)*100}%, #2a3050 ${(priceMax/3000)*100}%)`
                          }}
                        />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="flex-1 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-center">
                          <p className="text-[10px] text-slate-500 mb-0.5">Min</p>
                          <p className="text-sm text-white font-semibold">$0</p>
                        </div>
                        <div className="flex-1 bg-blue-600/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-center">
                          <p className="text-[10px] text-blue-400 mb-0.5">Max</p>
                          <p className="text-sm text-blue-300 font-semibold">${priceMax}</p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Rating */}
                  <Section title="Minimum Rating">
                    <RatingPicker
                      value={f.rating}
                      onChange={val => update('rating', val)}
                    />
                  </Section>
                </div>
              </div>
            )}
          </div>

          {/* ── Products Grid ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={`grid gap-5 ${showFilters ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                {[...Array(6)].map((_, i) => <ProductCard key={i} isLoading />)}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-5 ${showFilters ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => handlePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm disabled:opacity-30 hover:border-white/20 hover:text-white transition-all"
                    >Previous</button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          pagination.page === i+1
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white/5 border border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                        }`}
                      >{i+1}</button>
                    ))}
                    <button
                      onClick={() => handlePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm disabled:opacity-30 hover:border-white/20 hover:text-white transition-all"
                    >Next</button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center bg-[#131624] rounded-2xl border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-white/4 flex items-center justify-center mb-4 border border-white/6">
                  <SlidersHorizontal className="w-7 h-7 text-slate-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No products match the selected filters</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Try clearing or adjusting some filters to explore other items.</p>
                <button
                  onClick={handleClear}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slider thumb style */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #1e3a8a;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
          cursor: pointer;
          transition: box-shadow .15s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(59,130,246,0.35);
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #1e3a8a;
          cursor: pointer;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}

export default Products
