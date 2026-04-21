import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import { CartContext } from "../context/CartContext";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// ─── Fallback deals (shown when localStorage has no deals) ─────────────────────
const FALLBACK_DEALS = [
  { id: 9001, name: "Air Runner Pro Sneakers",   priceNum: 62.99,  originalPrice: 89.99,  category: "shoes",       isDeal: true, description: "Lightweight everyday trainer with cushioned sole.",        img: null },
  { id: 9002, name: "Slim Chino Trouser",         priceNum: 32.99,  originalPrice: 54.99,  category: "clothing",    isDeal: true, description: "Tailored slim-fit chino in stretch cotton.",              img: null },
  { id: 9003, name: "Aviator Sunglasses",         priceNum: 29.99,  originalPrice: 49.99,  category: "accessories", isDeal: true, description: "UV400 polarised frames, full wrap protection.",           img: null },
  { id: 9004, name: "Minimalist Field Watch",     priceNum: 99.99,  originalPrice: 149.99, category: "watches",     isDeal: true, description: "Clean-dial Japanese quartz movement, leather strap.",     img: null },
  { id: 9005, name: "Roll-top Backpack 20L",      priceNum: 49.99,  originalPrice: 79.99,  category: "bags",        isDeal: true, description: "Waterproof 20L roll-top pack with laptop sleeve.",       img: null },
  { id: 9006, name: "Fleece Pullover Hoodie",     priceNum: 39.99,  originalPrice: 69.99,  category: "clothing",    isDeal: true, description: "Warm brushed fleece, kangaroo pocket, ribbed cuffs.",    img: null },
  { id: 9007, name: "Leather Bifold Wallet",      priceNum: 19.99,  originalPrice: 34.99,  category: "accessories", isDeal: true, description: "Slim genuine leather wallet, 6 card slots.",             img: null },
  { id: 9008, name: "Chrono Sport Watch",         priceNum: 139.99, originalPrice: 229.99, category: "watches",     isDeal: true, description: "Stainless steel chronograph, 50m water resistance.",     img: null },
];

const CATEGORY_TABS = ["All", "Shoes", "Clothing", "Accessories", "Watches", "Bags"];

const SORT_OPTIONS = [
  { value: "discount", label: "Biggest Discount" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name", label: "Name: A → Z" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toNum(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

function discountPct(original, current) {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch { return null; }
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

const IconTag = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const IconClock = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconStar = () => (
  <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24"
    fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

// ─── Countdown Timer ───────────────────────────────────────────────────────────
// Counts down to midnight — resets daily, creating genuine urgency

function useCountdown() {
  const getRemaining = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = Math.max(0, midnight - now);
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };

  const [time, setTime] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function CountdownTimer() {
  const { h, m, s } = useCountdown();
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3" aria-live="polite" aria-label="Deal ends in">
      {[
        { val: pad(h), label: "HRS"  },
        { val: pad(m), label: "MIN"  },
        { val: pad(s), label: "SEC"  },
      ].map(({ val, label }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <span className="text-red-300 font-bold text-lg -mt-2" aria-hidden="true">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl w-14 h-14 flex items-center justify-center
              border border-white/30 shadow-inner">
              <span className="text-white font-extrabold text-xl tabular-nums leading-none">{val}</span>
            </div>
            <span className="text-red-200 text-[9px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Deal Card ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_GRADIENTS = [
  "from-green-50  to-emerald-100",
  "from-sky-50    to-blue-100",
  "from-amber-50  to-orange-100",
  "from-violet-50 to-purple-100",
  "from-rose-50   to-pink-100",
  "from-slate-50  to-gray-100",
];

function DealCard({ product, rank }) {
  const { addToCart } = useContext(CartContext);
  const [imgError, setImgError] = useState(false);
  const [added,    setAdded]    = useState(false);

  const priceNum   = toNum(product.priceNum ?? product.price);
  const origPrice  = toNum(product.originalPrice);
  const pct        = discountPct(origPrice, priceNum);
  const hasImg     = product.img && !imgError;
  const grad       = PLACEHOLDER_GRADIENTS[product.id % PLACEHOLDER_GRADIENTS.length];

  // Mock star rating seeded from product id (consistent per product)
  const stars   = 3 + (product.id % 3);           // 3, 4, or 5
  const reviews = 12 + ((product.id * 7) % 88);   // 12–99

  const handleAdd = useCallback(() => {
    addToCart({ id: product.id, name: product.name, price: priceNum, img: product.img });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [product, priceNum, addToCart]);

  return (
    <article className="group bg-white border border-gray-100 rounded-2xl overflow-hidden
      flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1
      transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500">

      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0 aspect-[4/3]">
        {hasImg ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
            <span className="text-5xl opacity-25 select-none" aria-hidden="true">🛍️</span>
          </div>
        )}

        {/* Badges */}
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold
          uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
          Deal
        </span>
        {pct > 0 && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold
            uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
            −{pct}%
          </span>
        )}
        {rank <= 3 && (
          <span className="absolute bottom-2 left-2 bg-amber-400 text-white text-[10px] font-bold
            uppercase tracking-wide px-2.5 py-1 rounded-full shadow flex items-center gap-1">
            🔥 Hot deal
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category tag */}
        {product.category && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">
            {product.category}
          </span>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>
        )}

        {/* Star rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < stars ? "text-amber-400" : "text-gray-200"}>
              <IconStar />
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">({reviews})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-lg font-extrabold text-gray-900">
            GH₵ {priceNum.toFixed(2)}
          </span>
          {origPrice > priceNum && (
            <span className="text-xs text-gray-400 line-through">
              GH₵ {origPrice.toFixed(2)}
            </span>
          )}
          {pct > 0 && (
            <span className="text-xs font-bold text-red-500 ml-auto">
              Save GH₵ {(origPrice - priceNum).toFixed(2)}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleAdd}
          aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            text-sm font-semibold transition-all duration-200 active:scale-[0.97]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1
            ${added
              ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
              : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
            }`}
        >
          <IconCart />
          {added ? "✓ Added to Cart!" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="h-10 bg-gray-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 gap-5">
      <div className="text-gray-200"><IconTag /></div>
      <div>
        <p className="text-xl font-bold text-gray-700">No deals right now</p>
        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
          Our team is preparing exciting deals. Check back soon — new offers drop daily!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
            text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          Browse all products <ArrowRight />
        </Link>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 border border-gray-200
            text-gray-700 hover:border-green-400 hover:text-green-700 font-semibold
            text-sm px-6 py-3 rounded-xl transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          New arrivals
        </Link>
      </div>
    </div>
  );
}

// ─── Hero Banner ───────────────────────────────────────────────────────────────

function HeroBanner({ dealCount }) {
  return (
    <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/10"   aria-hidden="true" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white/5"   aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left — headline */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
              rounded-full px-4 py-1.5 mb-4 border border-white/30">
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                🔥 Limited time offers
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.05] mb-3">
              Today's<br />
              <span className="text-yellow-300">Hot Deals</span>
            </h1>
            <p className="text-red-100 text-sm sm:text-base max-w-sm">
              {dealCount > 0
                ? `${dealCount} hand-picked deal${dealCount !== 1 ? "s" : ""} — at prices too good to miss.`
                : "Fresh deals added daily — don't miss out on massive savings."}
            </p>
          </div>

          {/* Right — countdown */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-red-100 text-xs font-bold uppercase tracking-widest">
              <IconClock />
              Deals reset in
            </div>
            <CountdownTimer />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Deals() {
  const [allDeals, setAllDeals] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [heroSlides, setHeroSlides] = useState([]);
  const [activeTab, setActiveTab]   = useState("All");
  const [sort,      setSort]        = useState("discount");

  // Load deals from localStorage, fall back to hardcoded
  useEffect(() => {
    const load = () => {
      const stored = loadFromStorage("products");
      let deals = [];

      if (stored) {
        const fromStorage = stored.filter(p => p.isDeal);
        deals = fromStorage.length > 0 ? fromStorage : FALLBACK_DEALS;
      } else {
        deals = FALLBACK_DEALS;
      }

      // Normalise priceNum for stored products that use price string
      deals = deals.map(p => ({
        ...p,
        priceNum:      toNum(p.priceNum ?? p.price),
        originalPrice: toNum(p.originalPrice),
      }));

      setAllDeals(deals);
      setHeroSlides(
        deals.filter(p => p.img).slice(0, 5).map(p => ({
          src:     p.img,
          alt:     p.name,
          caption: p.name,
        }))
      );
      setLoading(false);
    };

    load();
    window.addEventListener("productsUpdate", load);
    return () => window.removeEventListener("productsUpdate", load);
  }, []);

  // Filter by tab
  const filtered = useMemo(() => {
    return activeTab === "All"
      ? allDeals
      : allDeals.filter(p => (p.category || "").toLowerCase() === activeTab.toLowerCase());
  }, [allDeals, activeTab]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "discount":   return arr.sort((a, b) => discountPct(b.originalPrice, b.priceNum) - discountPct(a.originalPrice, a.priceNum));
      case "price-asc":  return arr.sort((a, b) => a.priceNum - b.priceNum);
      case "price-desc": return arr.sort((a, b) => b.priceNum - a.priceNum);
      case "name":       return arr.sort((a, b) => a.name.localeCompare(b.name));
      default:           return arr;
    }
  }, [filtered, sort]);

  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: "'Sora', sans-serif" }}>

      {/* Hero banner */}
      <HeroBanner dealCount={allDeals.length} />

      {/* Carousel — only when there are images */}
      {heroSlides.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
          <Carousel images={heroSlides} interval={5000} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-700 font-medium">Deals</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left — count */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Deals</h2>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">
                {sorted.length} deal{sorted.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>

          {/* Right — sort + link */}
          <div className="flex items-center gap-3">
            <label htmlFor="deals-sort" className="sr-only">Sort deals</label>
            <select
              id="deals-sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white
                text-gray-700 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold
                text-green-600 hover:text-green-800 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
            >
              All products <ArrowRight />
            </Link>
          </div>
        </div>

        {/* Category tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
          role="tablist"
          aria-label="Filter deals by category"
        >
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border
                transition-all duration-200 focus:outline-none focus-visible:ring-2
                focus-visible:ring-green-500
                ${activeTab === tab
                  ? "bg-red-500 text-white border-red-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
                }`}
            >
              {tab}
              {tab !== "All" && !loading && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${activeTab === tab ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {allDeals.filter(p => (p.category || "").toLowerCase() === tab.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && sorted.length === 0 && <EmptyState />}

        {/* Grid */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sorted.map((product, i) => (
              <DealCard key={product.id} product={product} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Bottom CTA strip */}
        {!loading && sorted.length > 0 && (
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400
            px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div className="text-center sm:text-left">
              <p className="text-white font-extrabold text-lg">Want more options?</p>
              <p className="text-red-100 text-sm mt-0.5">Browse our full catalogue — over a hundred products.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-red-600 font-bold
                  text-sm px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Shop All <ArrowRight />
              </Link>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 border-2 border-white/40
                  hover:border-white text-white font-semibold text-sm px-6 py-3
                  rounded-xl transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}