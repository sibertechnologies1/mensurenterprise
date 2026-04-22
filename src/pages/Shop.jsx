import React, {
  useContext, useEffect, useState, useMemo,
  useRef, useCallback, memo,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Carousel from "../components/Carousel";

// ─── Fallback products (shown when Admin hasn't added any yet) ────────────────
// Using public Unsplash URLs so they actually load fast in dev & production.
// Replace these with your own images once uploaded via the Admin panel.

const FALLBACK_PRODUCTS = [
  { id: 1, name: "Casual Linen Shirt",      priceNum: 59.99,   category: "Clothing",    img: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&q=80", description: "Lightweight and breathable — perfect for Ghana's climate.",  isNew: true  },
  { id: 2, name: "Studio Headphones",       priceNum: 129.99,  category: "Electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", description: "Crystal clear sound with deep bass and 30hr battery life."             },
  { id: 3, name: "Leather Crossbody Bag",   priceNum: 89.99,   category: "Bags",        img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", description: "Full-grain leather with adjustable strap and zip closure.",  isNew: true  },
  { id: 4, name: "Silver Dining Set",       priceNum: 49.99,   category: "Accessories", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", description: "Elegant 24-piece stainless steel cutlery set."                            },
  { id: 5, name: "Running Sneakers",        priceNum: 110.00,  category: "Shoes",       img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", description: "Lightweight mesh upper with responsive foam sole.",         isDeal: true, originalPrice: 150.00 },
  { id: 6, name: "Smartwatch Pro",          priceNum: 249.99,  category: "Watches",     img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", description: "Heart rate, GPS, sleep tracking and 7-day battery."                    },
  { id: 7, name: "Lightweight Laptop",      priceNum: 899.99,  category: "Electronics", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", description: "14\" FHD display, 16GB RAM, 512GB SSD, all-day battery.",  isDeal: true, originalPrice: 1099.99 },
  { id: 8, name: "Classic Leather Loafers", priceNum: 75.00,   category: "Shoes",       img: "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&q=80", description: "Genuine leather upper with cushioned insole."                          },
  { id: 9, name: "Tote Bag",               priceNum: 45.00,   category: "Bags",        img: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&q=80", description: "Spacious canvas tote with interior pockets.",             isNew: true  },
  { id: 10, name: "Analog Field Watch",     priceNum: 185.00,  category: "Watches",     img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80", description: "Japanese movement, sapphire crystal glass, 100m water resistant."      },
  { id: 11, name: "Polo Shirt",             priceNum: 42.00,   category: "Clothing",    img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80", description: "100% cotton piqué with reinforced collar.",               isDeal: true, originalPrice: 60.00  },
  { id: 12, name: "Sunglasses",             priceNum: 55.00,   category: "Accessories", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", description: "UV400 polarised lenses in a lightweight titanium frame."               },
];

const FALLBACK_SLIDES = FALLBACK_PRODUCTS.slice(0, 5).map((p) => ({
  src: p.img, alt: p.name, caption: p.name,
}));

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_TABS = ["All", "Clothing", "Electronics", "Shoes", "Bags", "Watches", "Accessories"];

const SORT_OPTIONS = [
  { value: "default",    label: "Featured"           },
  { value: "price-asc",  label: "Price: Low → High"  },
  { value: "price-desc", label: "Price: High → Low"  },
  { value: "name-asc",   label: "Name: A → Z"        },
  { value: "name-desc",  label: "Name: Z → A"        },
];

const PRICE_RANGES = [
  { label: "All prices",     min: 0,   max: Infinity },
  { label: "Under ₹ 50",  min: 0,   max: 50       },
  { label: "₹ 50 – 150",  min: 50,  max: 150      },
  { label: "₹ 150 – 500", min: 150, max: 500      },
  { label: "Over ₹ 500",  min: 500, max: Infinity  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
  return 0;
};

const fmt = (n) => `₹ ${toNum(n).toFixed(2)}`;

function loadProducts() {
  try {
    const raw = localStorage.getItem("products");
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch { return null; }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Ic = {
  Cart: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  X: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Filter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  ),
  Grid2: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>
    </svg>
  ),
  Grid4: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="4" height="4"/><rect x="10" y="3" width="4" height="4"/><rect x="17" y="3" width="4" height="4"/>
      <rect x="3" y="10" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/><rect x="17" y="10" width="4" height="4"/>
      <rect x="3" y="17" width="4" height="4"/><rect x="10" y="17" width="4" height="4"/><rect x="17" y="17" width="4" height="4"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
};

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = memo(function ProductCard({ product }) {
  const { addToCart }           = useContext(CartContext);
  const [added,    setAdded]    = useState(false);
  const [wished,   setWished]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const priceNum  = toNum(product.priceNum ?? product.price);
  const origPrice = toNum(product.originalPrice);
  const discount  = origPrice > priceNum
    ? Math.round(((origPrice - priceNum) / origPrice) * 100)
    : 0;

  const handleAdd = useCallback(() => {
    addToCart({
      id:       product.id,
      name:     product.name,
      priceNum: priceNum,          // ← always priceNum so cart/checkout work
      img:      product.img,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [product, priceNum, addToCart]);

  return (
    <article className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">

      {/* Wishlist */}
      <button
        type="button"
        onClick={() => setWished((v) => !v)}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
          wished ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-400 hover:bg-red-50"
        }`}
      >
        <Ic.Heart filled={wished} />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isDeal && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Deal
          </span>
        )}
        {product.isNew && !product.isDeal && (
          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            New
          </span>
        )}
        {discount > 0 && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] flex-shrink-0">
        {!imgError && product.img ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {product.category && (
          <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <span className="text-base font-bold text-green-700">{fmt(priceNum)}</span>
            {origPrice > priceNum && (
              <span className="block text-xs text-gray-400 line-through mt-0.5">{fmt(origPrice)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-200 active:scale-95 ${
              added
                ? "bg-green-50 text-green-700 border border-green-300"
                : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
            }`}
          >
            {added ? <><Ic.Check /> Added!</> : <><Ic.Cart /> Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ProductSkeleton = memo(() => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="bg-gray-200 aspect-[4/3]" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-3/5" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center mt-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded-xl w-24" />
      </div>
    </div>
  </div>
));

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClear }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </div>
      <div>
        <p className="text-lg font-bold text-gray-700">No products found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
      </div>
      <button
        onClick={onClear}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, priceRange, setPriceRange, onReset, activeCount }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">Filters</span>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={onReset} className="text-xs text-green-600 font-semibold">
                Clear ({activeCount})
              </button>
            )}
            <button onClick={onClose} aria-label="Close filters"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <Ic.X />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Price Range</p>
          <div className="flex flex-col gap-1.5">
            {PRICE_RANGES.map((r, i) => (
              <button
                key={i}
                onClick={() => { setPriceRange(i); }}
                className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  priceRange === i
                    ? "bg-green-600 text-white font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Shop() {
  const [searchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [heroSlides,  setHeroSlides]  = useState(FALLBACK_SLIDES);
  const [loading,     setLoading]     = useState(true);

  // Filters
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [search,      setSearch]      = useState(searchParams.get("q") || "");
  const [activeTab,   setActiveTab]   = useState(searchParams.get("category") || "All");
  const [sort,        setSort]        = useState("default");
  const [priceRange,  setPriceRange]  = useState(0);
  const [cols,        setCols]        = useState(4);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  const searchDebounce = useRef(null);

  // ── Load products ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = () => {
      const stored = loadProducts();
      const products = stored ?? FALLBACK_PRODUCTS;
      setAllProducts(products);
      setHeroSlides(
        products.filter((p) => p.img).slice(0, 5).map((p) => ({
          src: p.img, alt: p.name, caption: p.name,
        }))
      );
      setLoading(false);
    };

    load();
    window.addEventListener("productsUpdate", load);
    return () => window.removeEventListener("productsUpdate", load);
  }, []);

  // ── Sync URL params ─────────────────────────────────────────────────────────
  useEffect(() => {
    const q   = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q)   { setSearchInput(q); setSearch(q); }
    if (cat) { setActiveTab(cat.charAt(0).toUpperCase() + cat.slice(1)); }
  }, [searchParams]);

  // ── Debounced search ────────────────────────────────────────────────────────
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setSearch(val), 250);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearch("");
  }, []);

  const resetFilters = useCallback(() => {
    setSearchInput(""); setSearch("");
    setActiveTab("All"); setSort("default"); setPriceRange(0);
  }, []);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const visibleProducts = useMemo(() => {
    const { min, max } = PRICE_RANGES[priceRange];
    const q = search.toLowerCase();

    let list = allProducts.filter((p) => {
      const price    = toNum(p.priceNum ?? p.price);
      const matchQ   = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      const matchCat = activeTab === "All" || (p.category || "").toLowerCase() === activeTab.toLowerCase();
      const matchP   = price >= min && price < max;
      return matchQ && matchCat && matchP;
    });

    switch (sort) {
      case "price-asc":  list = list.slice().sort((a, b) => toNum(a.priceNum ?? a.price) - toNum(b.priceNum ?? b.price)); break;
      case "price-desc": list = list.slice().sort((a, b) => toNum(b.priceNum ?? b.price) - toNum(a.priceNum ?? a.price)); break;
      case "name-asc":   list = list.slice().sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc":  list = list.slice().sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return list;
  }, [allProducts, search, activeTab, priceRange, sort]);

  const activeFilterCount = (priceRange !== 0 ? 1 : 0) + (activeTab !== "All" ? 1 : 0) + (search ? 1 : 0);

  const gridCls = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[cols];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Dark hero banner ─────────────────────────────────────────────── */}
      <div className="bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse at 15% 60%, rgba(22,163,74,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(2,132,199,0.12) 0%, transparent 45%)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Mensur Enterprises</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
            Everything in <span className="text-green-400">one place</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-sm">
            Quality products across all categories — at prices that make sense.
          </p>
        </div>
      </div>

      {/* ── Hero carousel ────────────────────────────────────────────────── */}
      {heroSlides.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <Carousel images={heroSlides} interval={4500} />
        </div>
      )}

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Shop</span>
          {activeTab !== "All" && <><span>/</span><span className="text-gray-700 font-medium">{activeTab}</span></>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative max-w-xl mb-6">
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Ic.Search />
          </span>
          <input
            id="shop-search"
            type="search"
            value={searchInput}
            onChange={handleSearch}
            placeholder="Search products…"
            autoComplete="off"
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <Ic.X />
            </button>
          )}
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

          {/* Category tabs — scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }} role="tablist" aria-label="Filter by category">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                  activeTab === tab
                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open filters"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors shadow-sm ${
                activeFilterCount > 0
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <Ic.Filter />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <label htmlFor="shop-sort" className="sr-only">Sort products</label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Grid toggle — desktop only */}
            <div className="hidden lg:flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {[4, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => setCols(n)}
                  aria-label={`${n}-column layout`}
                  aria-pressed={cols === n}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${
                    cols === n ? "bg-green-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {n === 4 ? <Ic.Grid4 /> : <Ic.Grid2 />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Active filter chips ───────────────────────────────────────────── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {activeTab !== "All" && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                {activeTab}
                <button onClick={() => setActiveTab("All")} aria-label="Remove category filter" className="ml-0.5 hover:text-green-900"><Ic.X /></button>
              </span>
            )}
            {priceRange !== 0 && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                {PRICE_RANGES[priceRange].label}
                <button onClick={() => setPriceRange(0)} aria-label="Remove price filter" className="ml-0.5 hover:text-green-900"><Ic.X /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                "{search}"
                <button onClick={clearSearch} aria-label="Clear search" className="ml-0.5 hover:text-green-900"><Ic.X /></button>
              </span>
            )}
            <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* ── Result count ─────────────────────────────────────────────────── */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-5">
            {visibleProducts.length === 0
              ? "No products match your filters"
              : `${visibleProducts.length} product${visibleProducts.length !== 1 ? "s" : ""}`
            }
          </p>
        )}

        {/* ── Product grid ─────────────────────────────────────────────────── */}
        <div className={`grid gap-5 ${gridCls}`}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : visibleProducts.length === 0
              ? <EmptyState onClear={resetFilters} />
              : visibleProducts.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>

        {/* ── Bottom deals CTA ─────────────────────────────────────────────── */}
        {!loading && visibleProducts.length > 0 && (
          <div className="mt-14 rounded-2xl bg-green-700 px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-center sm:text-left">
              <p className="font-extrabold text-white text-lg">Looking for deals?</p>
              <p className="text-green-200 text-sm mt-0.5">Up to 50% off on selected products — updated weekly.</p>
            </div>
            <Link
              to="/deals"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-green-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow"
            >
              View Deals <Ic.ArrowRight />
            </Link>
          </div>
        )}
      </div>

      {/* ── Filter drawer ─────────────────────────────────────────────────── */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onReset={() => setPriceRange(0)}
        activeCount={priceRange !== 0 ? 1 : 0}
      />
    </main>
  );
}