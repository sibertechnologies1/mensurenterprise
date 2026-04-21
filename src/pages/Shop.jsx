import React, { useContext, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Carousel from "../components/Carousel";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// ─── Dynamic image imports ─────────────────────────────────────────────────────
const imageModules = import.meta.glob(
  "../components/images/*.{jpg,jpeg,png}",
  { eager: true, as: "url" }
);

// ✅ FIXED: All prices now in ₹ (Ghanaian Cedis) — was ₹ (Indian Rupees)
const FRIENDLY_NAMES = {
  "camera-equipment-capturing-single-macro-object-generative-ai.jpg": { name: "Camera Equipment",    price: 199.99,  category: "Accessories" },
  "clean-room-with-rug-large-bed.jpg":                                 { name: "Bedroom Rug Set",      price: 79.99,   category: "Accessories" },
  "closeup-shot-silver-utensils-set-isolated-black-surface.jpg":       { name: "Silver Utensils Set",  price: 49.99,   category: "Accessories" },
  "double-bed-with-pillows.jpg":                                       { name: "Double Bed & Pillows", price: 299.99,  category: "Accessories" },
  "shirt.jpg":                                                         { name: "Casual Shirt",         price: 59.99,   category: "Clothing"    },
  "view-3d-laptop-device-with-screen-keyboard.jpg":                    { name: "Lightweight Laptop",   price: 899.99,  category: "Electronics" },
  "headphones-displayed-against-dark-background.jpg":                  { name: "Studio Headphones",    price: 129.99,  category: "Accessories" },
  "elegant-smartphone-composition.jpg":                                { name: "iPhone 17 Pro Max",    price: 1199.99, category: "Electronics" },
  "phone-14-pro-front-side-arabic-themed-background.jpg":              { name: "Phone 14 Pro",         price: 999.99,  category: "Electronics" },
};

const generatedProducts = Object.entries(imageModules).map(([path, url], idx) => {
  const file     = path.split("/").pop();
  const base     = file.toLowerCase();
  const friendly = FRIENDLY_NAMES[base];
  const rawName  = file.replace(/\.(jpg|jpeg|png)$/i, "").replace(/[-_]/g, " ");
  const name     = friendly?.name ?? (rawName.charAt(0).toUpperCase() + rawName.slice(1));
  const price    = friendly?.price ?? parseFloat((29.99 + idx * 10).toFixed(2)); // ✅ ₹ range
  const category = friendly?.category ?? "Accessories";
  return {
    id:          1000 + idx,
    name,
    price,       // always a number
    category,
    img:         url,
    description: `${name} — quality product, built to last.`,
  };
});

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_TABS = ["All", "Shoes", "Clothing", "Electronics", "Accessories", "Watches", "Bags"];

const SORT_OPTIONS = [
  { value: "default",    label: "Featured"          },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc",   label: "Name: A → Z"       },
  { value: "name-desc",  label: "Name: Z → A"       },
];

// ✅ FIXED: Price bands now in ₹ — was ₹
const PRICE_RANGES = [
  { label: "All",              min: 0,    max: Infinity },
  { label: "Under ₹ 50",    min: 0,    max: 50       },
  { label: "₹ 50 – 150",    min: 50,   max: 150      },
  { label: "₹ 150 – 500",   min: 150,  max: 500      },
  { label: "Over ₹ 500",    min: 500,  max: Infinity  },
];

// ✅ FIXED: 6 gradients to match Home.jsx exactly (was only 4)
const PLACEHOLDER_GRADIENTS = [
  "from-green-50  to-emerald-100",
  "from-sky-50    to-blue-100",
  "from-amber-50  to-orange-100",
  "from-violet-50 to-purple-100",
  "from-rose-50   to-pink-100",
  "from-slate-50  to-gray-100",
];

// ─── Helpers — identical to Home.jsx ──────────────────────────────────────────

function toNum(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

// ✅ FIXED: formatGHS replaces formatINR — matches Home.jsx exactly
function formatGHS(price) {
  const n = toNum(price);
  return `₹ ${n.toFixed(2)}`;
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch { return null; }
}

// ─── Scroll reveal hook — identical to Home.jsx ────────────────────────────────

function useReveal(threshold = 0.05) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconCart = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconHeart = ({ filled }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="6"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const IconX = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const IconFilter = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const IconGrid2 = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/>
    <rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>
  </svg>
);

const IconGrid3 = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="5" height="5"/><rect x="9.5" y="3" width="5" height="5"/>
    <rect x="16" y="3" width="5" height="5"/><rect x="3" y="9.5" width="5" height="5"/>
    <rect x="9.5" y="9.5" width="5" height="5"/><rect x="16" y="9.5" width="5" height="5"/>
    <rect x="3" y="16" width="5" height="5"/><rect x="9.5" y="16" width="5" height="5"/>
    <rect x="16" y="16" width="5" height="5"/>
  </svg>
);

const IconStar = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// ★  PRODUCT CARD — pixel-perfect match to Home.jsx
//    Every token below is synchronised. Do not change one without changing both.
// ══════════════════════════════════════════════════════════════════════════════

function ProductCard({ product, delay = 0 }) {
  const { addToCart }           = useContext(CartContext);
  const [added,    setAdded]    = useState(false);
  const [wished,   setWished]   = useState(false);
  const [imgError, setImgError] = useState(false);
  const [ref, visible]          = useReveal(0.05);

  // ✅ Handles both `priceNum` (Home defaults) and `price` (localStorage/generated)
  const priceNum  = toNum(product.priceNum ?? product.price);
  const origPrice = toNum(product.originalPrice);
  const hasImg    = product.img && !imgError;

  // ✅ 6-gradient array — matches Home.jsx
  const grad    = PLACEHOLDER_GRADIENTS[product.id % PLACEHOLDER_GRADIENTS.length];
  const stars   = 3 + (product.id % 3);                  // ✅ same seed as Home
  const reviews = 8 + ((product.id * 13) % 92);          // ✅ same seed as Home

  const handleAdd = useCallback(() => {
    addToCart({ id: product.id, name: product.name, price: priceNum, img: product.img });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [product, priceNum, addToCart]);

  return (
    <article
      ref={ref}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden
        flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1
        transition-all duration-500 focus-within:ring-2 focus-within:ring-green-500"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms,
                     box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      {/* ── Wishlist ── */}
      <button
        type="button"
        onClick={() => setWished(v => !v)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center
          justify-center transition-all duration-200 shadow-sm
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
          ${wished
            ? "bg-red-50 text-red-500 scale-110"          // ✅ scale-110 matches Home
            : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-red-50"
          }`}
      >
        <IconHeart filled={wished} />
      </button>

      {/* ── Badges top-left ── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isDeal && (
          <span className="bg-red-500 text-white text-[10px] font-bold
            px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
            Deal
          </span>
        )}
        {product.isNew && !product.isDeal && (
          <span className="bg-green-600 text-white text-[10px] font-bold
            px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
            New
          </span>
        )}
      </div>

      {/* ── Image ── */}
      <div className="relative overflow-hidden flex-shrink-0 bg-gray-50 aspect-[4/3]">
        {hasImg ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            // ✅ scale-105 matches Home (was scale-110 — too aggressive)
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
            <span className="text-5xl opacity-25 select-none" aria-hidden="true">🛍️</span>
          </div>
        )}

        {/* ✅ FIXED: Category label as white pill ON the image — matches Home */}
        {product.category && (
          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm
            text-gray-700 text-[10px] font-bold uppercase tracking-wider
            px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Description — only if provided */}
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>
        )}

        {/* Stars — same seed formula as Home */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < stars ? "text-amber-400" : "text-gray-200"}>
              <IconStar />
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({reviews})</span>
        </div>

        {/* ✅ FIXED: Price left + button right in one row — matches Home layout exactly */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-base font-extrabold text-green-700">
              {formatGHS(priceNum)}
            </span>
            {origPrice > priceNum && (
              <span className="block text-xs text-gray-400 line-through">
                {formatGHS(origPrice)}
              </span>
            )}
          </div>

          {/* ✅ FIXED: compact button px-3 py-2 text-xs — matches Home exactly */}
          <button
            type="button"
            onClick={handleAdd}
            aria-label={added ? `${product.name} added` : `Add ${product.name} to cart`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
              transition-all duration-200 active:scale-[0.96] flex-shrink-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1
              ${added
                ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
              }`}
          >
            {added ? <><IconCheck /> Added!</> : <><IconCart /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse shadow-sm">
      <div className="bg-gray-200 aspect-[4/3]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-3/5" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded-xl w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
      <span className="text-6xl" aria-hidden="true">🔍</span>
      <div>
        <p className="text-xl font-bold text-gray-700">No products found</p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
          text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        Clear all filters
      </button>
    </div>
  );
}

// ─── Mobile Filter Drawer ──────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, priceRange, setPriceRange, onReset, activeCount }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog" aria-modal="true" aria-label="Filter products"
        className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col"
        style={{ animation: "slideInLeft 0.25s ease" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-gray-900">Filters</span>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button type="button" onClick={onReset}
                className="text-xs text-green-600 font-semibold focus:outline-none">
                Clear ({activeCount})
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close filters"
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-gray-500 hover:bg-gray-100 focus:outline-none">
              <IconX />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Price Range
          </p>
          <div className="flex flex-col gap-1.5">
            {PRICE_RANGES.map((r, i) => (
              <button
                key={i} type="button" onClick={() => setPriceRange(i)}
                className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
                  ${priceRange === i
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
          <button type="button" onClick={onClose}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold
              text-sm rounded-xl transition-colors focus:outline-none">
            Apply Filters
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: none; } }
      `}</style>
    </>
  );
}

// ─── Shop Hero ─────────────────────────────────────────────────────────────────

function ShopHero() {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.13]" aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 10% 60%, #16a34a 0%, transparent 55%),
            radial-gradient(ellipse at 90% 20%, #0284c7 0%, transparent 45%),
            radial-gradient(ellipse at 60% 90%, #d97706 0%, transparent 40%)
          `,
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        <div className="max-w-xl">
          <p className="text-green-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">
            Mensur Enterprises
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] mb-4">
            Everything<br/>
            <span className="text-green-400">in one place</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed">
            Quality products across all categories — shoes, clothing, accessories,
            watches and bags — at prices that make sense.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Shop() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [heroSlides,  setHeroSlides]  = useState([]);

  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("All");
  const [sort,       setSort]       = useState("default");
  const [priceRange, setPriceRange] = useState(0);
  const [cols,       setCols]       = useState(3);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      const stored = loadFromStorage("products");
      const source = stored ?? generatedProducts;
      const normalised = source.map(p => ({ ...p, price: toNum(p.price) }));
      setAllProducts(normalised);
      setHeroSlides(
        normalised.filter(p => p.img).slice(0, 5).map(p => ({
          src: p.img, alt: p.name, caption: p.name,
        }))
      );
      setLoading(false);
    };
    load();
    window.addEventListener("productsUpdate", load);
    return () => window.removeEventListener("productsUpdate", load);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch(""); setActiveTab("All"); setSort("default"); setPriceRange(0);
  }, []);

  const activeFilterCount = priceRange !== 0 ? 1 : 0;

  const visibleProducts = useMemo(() => {
    const range = PRICE_RANGES[priceRange];
    let list = allProducts.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchTab    = activeTab === "All" || (p.category || "").toLowerCase() === activeTab.toLowerCase();
      const price       = toNum(p.price);
      const matchPrice  = price >= range.min && price < range.max;
      return matchSearch && matchTab && matchPrice;
    });
    switch (sort) {
      case "price-asc":  list = list.slice().sort((a, b) => toNum(a.price) - toNum(b.price)); break;
      case "price-desc": list = list.slice().sort((a, b) => toNum(b.price) - toNum(a.price)); break;
      case "name-asc":   list = list.slice().sort((a, b) => a.name.localeCompare(b.name));    break;
      case "name-desc":  list = list.slice().sort((a, b) => b.name.localeCompare(a.name));    break;
      default: break;
    }
    return list;
  }, [allProducts, search, activeTab, priceRange, sort]);

  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: "'Sora', sans-serif" }}>

      <ShopHero />

      {heroSlides.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <Carousel images={heroSlides} interval={4500} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-700 font-medium">Shop</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Search */}
        <div className="relative max-w-xl mb-6">
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <IconSearch />
          </div>
          <input
            id="shop-search" type="search" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…" autoComplete="off"
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3
              text-sm text-gray-900 placeholder:text-gray-400 shadow-sm
              focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search"
              className="absolute inset-y-0 right-3 flex items-center
                text-gray-400 hover:text-gray-600 focus:outline-none">
              <IconX />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-wrap">
          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
            role="tablist" aria-label="Filter by category">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab} type="button" role="tab" aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border
                  transition-all duration-200 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-green-500
                  ${activeTab === tab
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
              type="button" onClick={() => setDrawerOpen(true)}
              aria-label="Open filters"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200
                bg-white text-sm text-gray-700 hover:border-green-400 hover:text-green-700
                transition-colors shadow-sm focus:outline-none
                focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <IconFilter />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold
                  w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <label htmlFor="shop-sort" className="sr-only">Sort by</label>
            <select
              id="shop-sort" value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white
                text-gray-700 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {[3, 2].map(n => (
                <button
                  key={n} type="button" onClick={() => setCols(n)}
                  aria-label={`${n}-column grid`} aria-pressed={cols === n}
                  className={`w-9 h-9 flex items-center justify-center transition-colors
                    ${cols === n ? "bg-green-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  {n === 2 ? <IconGrid2 /> : <IconGrid3 />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {(priceRange !== 0 || search || activeTab !== "All") && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {activeTab !== "All" && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700
                border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                {activeTab}
                <button type="button" onClick={() => setActiveTab("All")}
                  aria-label="Remove category filter"
                  className="hover:text-green-900 focus:outline-none ml-0.5">
                  <IconX />
                </button>
              </span>
            )}
            {priceRange !== 0 && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700
                border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                {PRICE_RANGES[priceRange].label}
                <button type="button" onClick={() => setPriceRange(0)}
                  aria-label="Remove price filter"
                  className="hover:text-green-900 focus:outline-none ml-0.5">
                  <IconX />
                </button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700
                border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                "{search}"
                <button type="button" onClick={() => setSearch("")}
                  aria-label="Remove search"
                  className="hover:text-green-900 focus:outline-none ml-0.5">
                  <IconX />
                </button>
              </span>
            )}
            <button type="button" onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-gray-700 font-medium
                transition-colors focus:outline-none">
              Clear all
            </button>
          </div>
        )}

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-5">
            {visibleProducts.length === 0
              ? "No products match your filters"
              : `Showing ${visibleProducts.length} product${visibleProducts.length !== 1 ? "s" : ""}`}
          </p>
        )}

        {/* Product grid */}
        <div className={`grid gap-5
          ${cols === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : visibleProducts.length === 0
              ? <EmptyState onClear={resetFilters} />
              : visibleProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} delay={i * 60} />
                ))
          }
        </div>

        {/* Bottom CTA */}
        {!loading && visibleProducts.length > 0 && (
          <div className="mt-14 rounded-2xl bg-green-600 px-8 py-8
            flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div className="relative text-center sm:text-left">
              <p className="font-extrabold text-white text-lg">Looking for deals?</p>
              <p className="text-green-100 text-sm mt-0.5">
                Check our deals page for up to 50% off selected products.
              </p>
            </div>
            <Link
              to="/deals"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-green-700
                font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-green-50 transition-colors
                shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                focus-visible:ring-offset-2 focus-visible:ring-offset-green-600"
            >
              View Deals <ArrowRight />
            </Link>
          </div>
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onReset={() => setPriceRange(0)}
        activeCount={activeFilterCount}
      />
    </main>
  );
}