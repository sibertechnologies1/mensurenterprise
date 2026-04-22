import React, { useContext, useEffect, useState, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Carousel from "../components/Carousel";

// ─── Fallback products — same Unsplash URLs as Shop/Home (browser caches them) ─
const FALLBACK_NEW = [
  { id: 1,  name: "Casual Linen Shirt",    priceNum: 59.99,  category: "Clothing",    img: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&q=80", description: "Lightweight and breathable — perfect for Ghana's climate.", isNew: true },
  { id: 3,  name: "Leather Crossbody Bag", priceNum: 89.99,  category: "Bags",        img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", description: "Full-grain leather with adjustable strap and zip closure.",  isNew: true },
  { id: 9,  name: "Canvas Tote Bag",       priceNum: 45.00,  category: "Bags",        img: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&q=80", description: "Spacious canvas tote with interior pockets.",             isNew: true },
  { id: 11, name: "Polo Shirt",            priceNum: 42.00,  category: "Clothing",    img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80", description: "100% cotton piqué with reinforced collar.",               isNew: true, isDeal: true, originalPrice: 60.00 },
  { id: 12, name: "Polarised Sunglasses",  priceNum: 55.00,  category: "Accessories", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", description: "UV400 polarised lenses in a lightweight titanium frame.",  isNew: true },
  { id: 5,  name: "Running Sneakers",      priceNum: 110.00, category: "Shoes",       img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", description: "Lightweight mesh upper with responsive foam sole.",        isNew: true, isDeal: true, originalPrice: 150.00 },
  { id: 10, name: "Analog Field Watch",    priceNum: 185.00, category: "Watches",     img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80", description: "Japanese movement, sapphire crystal, 100m water resistant.", isNew: true },
  { id: 6,  name: "Smartwatch Pro",        priceNum: 249.99, category: "Watches",     img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", description: "Heart rate, GPS, sleep tracking and 7-day battery.",     isNew: true },
];

const FALLBACK_SLIDES = FALLBACK_NEW.slice(0, 5).map((p) => ({
  src: p.img, alt: p.name, caption: p.name,
}));

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest first"      },
  { value: "lowest",  label: "Price: Low → High" },
  { value: "highest", label: "Price: High → Low" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
  return 0;
};

const fmt = (n) => `₹ ${toNum(n).toFixed(2)}`;

const sortNewest  = (arr) => arr.slice().sort((a, b) => Number(b.id) - Number(a.id));
const sortLowest  = (arr) => arr.slice().sort((a, b) => toNum(a.priceNum) - toNum(b.priceNum));
const sortHighest = (arr) => arr.slice().sort((a, b) => toNum(b.priceNum) - toNum(a.priceNum));

function loadProducts() {
  try {
    const raw = localStorage.getItem("products");
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch { return null; }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconHeart = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const IconEmpty = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

// ─── Product Card — memo + useCallback, consistent with Shop and Home ─────────

const ProductCard = memo(function ProductCard({ product, priority = false }) {
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
      priceNum: priceNum,       // ← always priceNum so Cart & Checkout work correctly
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
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
          wished ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-400 hover:bg-red-50"
        }`}
      >
        <IconHeart filled={wished} />
      </button>

      {/* Badges — Deal takes priority over New to avoid overlap */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isDeal ? (
          <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">Deal</span>
        ) : product.isNew ? (
          <span className="bg-green-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">New</span>
        ) : null}
        {discount > 0 && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
        )}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] flex-shrink-0">
        {!imgError && product.img ? (
          <img
            src={product.img}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchpriority={priority ? "high" : "low"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
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
            aria-label={added ? `${product.name} added` : `Add ${product.name} to cart`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-200 active:scale-95 ${
              added
                ? "bg-green-50 text-green-700 border border-green-300"
                : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
            }`}
          >
            {added ? <><IconCheck /> Added!</> : <><IconCart /> Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = memo(() => (
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

function EmptyState({ hasFilter, onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="text-gray-200"><IconEmpty /></div>
      <div>
        <p className="text-base font-semibold text-gray-700">
          {hasFilter ? "No products match this filter" : "No new arrivals yet"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {hasFilter ? "Try a different category or sort." : "Check back soon — new products are on the way."}
        </p>
      </div>
      {hasFilter ? (
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear filters
        </button>
      ) : (
        <Link to="/shop" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Browse all products
        </Link>
      )}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ categories, activeCategory, onCategory, sort, onSort, total }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 flex items-center gap-1.5 mr-1 shrink-0">
          <IconFilter /> Filter:
        </span>
        {["all", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => onCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
              activeCategory === cat
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-400">{total} item{total !== 1 ? "s" : ""}</span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-green-500 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function New() {
  const [allProducts,    setAllProducts]  = useState(FALLBACK_NEW);
  const [heroSlides,     setHeroSlides]   = useState(FALLBACK_SLIDES);
  const [loading,        setLoading]      = useState(true);
  const [sort,           setSort]         = useState("newest");
  const [activeCategory, setCategory]     = useState("all");

  // ── Load products ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = () => {
      const stored = loadProducts();
      if (stored) {
        // Prefer products flagged isNew; fall back to all products
        const newOnes = stored.filter((p) => p.isNew);
        const base    = newOnes.length > 0 ? newOnes : stored;
        setAllProducts(base);
        setHeroSlides(
          sortNewest(base)
            .filter((p) => p.img)
            .slice(0, 5)
            .map((p) => ({ src: p.img, alt: p.name, caption: p.name }))
        );
      }
      // If nothing in storage, FALLBACK_NEW is already set as default state
      setLoading(false);
    };

    load();
    window.addEventListener("productsUpdate", load);
    return () => window.removeEventListener("productsUpdate", load);
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const categories = useMemo(() => (
    [...new Set(allProducts.map((p) => p.category).filter(Boolean))]
  ), [allProducts]);

  const displayed = useMemo(() => {
    let list = activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);
    if (sort === "newest")  return sortNewest(list);
    if (sort === "lowest")  return sortLowest(list);
    if (sort === "highest") return sortHighest(list);
    return list;
  }, [allProducts, sort, activeCategory]);

  const resetFilters = useCallback(() => {
    setCategory("all");
    setSort("newest");
  }, []);

  const hasFilter = activeCategory !== "all" || sort !== "newest";

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero carousel — Unsplash images load fast from CDN ──────────── */}
      {!loading && heroSlides.length > 0 && (
        <section aria-label="New arrivals showcase" className="w-full bg-white">
          <Carousel images={heroSlides} interval={4500} />
        </section>
      )}

      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10"
        aria-labelledby="new-arrivals-heading"
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-600 font-medium">New Arrivals</span>
        </nav>

        {/* Header */}
        <div className="mb-7">
          <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Fresh in</span>
          <h1 id="new-arrivals-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
            New Arrivals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            The latest additions to our collection — updated every week.
          </p>
        </div>

        {/* Filter bar */}
        {!loading && (
          <FilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
            total={displayed.length}
          />
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
            : displayed.length === 0
              ? <EmptyState hasFilter={hasFilter} onReset={resetFilters} />
              : displayed.map((p, i) => (
                  // First 4 above-fold cards load eagerly; rest are lazy
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))
          }
        </div>

        {/* Bottom CTA */}
        {!loading && displayed.length > 0 && (
          <div className="mt-12 rounded-2xl bg-green-700 px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-center sm:text-left">
              <p className="font-extrabold text-white text-lg">Looking for something specific?</p>
              <p className="text-green-200 text-sm mt-0.5">Browse our full catalogue — thousands of products across all categories.</p>
            </div>
            <Link
              to="/shop"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-green-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow"
            >
              Browse all products <IconArrow />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}