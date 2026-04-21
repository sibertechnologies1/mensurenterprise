import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Carousel from "../components/Carousel";

// ─── Image fallbacks via Vite glob ───────────────────────────────────────────
const imageModules = import.meta.glob(
  "../components/images/*.{jpg,jpeg,png}",
  { eager: true, as: "url" }
);

const generatedProducts = Object.entries(imageModules).map(([path, url], idx) => {
  const file    = path.split("/").pop();
  const rawName = file.replace(/\.(jpg|jpeg|png)$/i, "").replace(/[-_]/g, " ");
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return {
    id:          1000 + idx,
    name,
    priceNum:    29.99 + idx * 10,
    img:         url,
    description: `${name} — fresh arrival.`,
    isNew:       true,
    category:    "General",
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatGHS = (num) => {
  const n = typeof num === "string" ? parseFloat(num.replace(/[^0-9.]/g, "")) : num;
  return isNaN(n) ? "₹ —" : `₹ ${n.toFixed(2)}`;
};

const sortNewest  = (arr) => arr.slice().sort((a, b) => Number(b.id) - Number(a.id));
const sortLowest  = (arr) => arr.slice().sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
const sortHighest = (arr) => arr.slice().sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
const toSlides    = (arr) => arr.slice(0, 5).map((p) => ({ src: p.img, alt: p.name, caption: p.name }));

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h9v-2h-9l1.1-2h6.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49-.03-.02L20.42 6H6.21"/>
  </svg>
);

const IconHeart = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconEmpty = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onAddToCart }) {
  const [added,     setAdded]    = useState(false);
  const [imgError,  setImgError] = useState(false);
  const [wished,    setWished]   = useState(false);

  const priceNum = product.priceNum || (typeof product.price === "number" ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, ""))) || 0;

  const handleAdd = () => {
    onAddToCart({ id: product.id, name: product.name, priceNum, img: product.img });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

      {/* Wishlist */}
      <button
        onClick={() => setWished((v) => !v)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
          wished ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-400 hover:bg-red-50"
        }`}
      >
        <IconHeart filled={wished} />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            New
          </span>
        )}
        {product.isDeal && (
          <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Deal
          </span>
        )}
        {product.originalPrice && product.originalPrice > priceNum && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{Math.round(((product.originalPrice - priceNum) / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        {imgError || !product.img ? (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        ) : (
          <img
            src={product.img}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-green-700 font-bold text-base">{formatGHS(priceNum)}</span>
          {product.originalPrice && product.originalPrice > priceNum && (
            <span className="text-gray-400 text-xs line-through">{formatGHS(product.originalPrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
            added
              ? "bg-green-50 text-green-700 border border-green-300 cursor-default"
              : "bg-green-600 hover:bg-green-700 active:scale-95 text-white"
          }`}
        >
          {added ? <><IconCheck /> Added to cart</> : <><IconCart /> Add to cart</>}
        </button>
      </div>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
        <div className="h-9 bg-gray-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilter, onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="text-gray-200"><IconEmpty /></div>
      <div>
        <p className="text-base font-semibold text-gray-700">
          {hasFilter ? "No products match this filter" : "No new arrivals yet"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {hasFilter ? "Try a different category or sort option." : "Check back soon — new products are on the way."}
        </p>
      </div>
      {hasFilter ? (
        <button
          onClick={onReset}
          className="mt-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear filters
        </button>
      ) : (
        <Link to="/shop" className="mt-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Browse all products
        </Link>
      )}
    </div>
  );
}

// ─── Sort & Filter bar ────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "newest",   label: "Newest first"   },
  { value: "lowest",   label: "Price: Low → High" },
  { value: "highest",  label: "Price: High → Low" },
];

function FilterBar({ categories, activeCategory, onCategory, sort, onSort, total }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
          <IconFilter /> Filter:
        </span>
        <button
          onClick={() => onCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
            activeCategory === "all"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
              activeCategory === cat
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-400">{total} item{total !== 1 ? "s" : ""}</span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-green-500 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function New() {
  const { addToCart } = useContext(CartContext);

  const [allProducts,  setAllProducts]  = useState([]);
  const [heroSlides,   setHeroSlides]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [sort,         setSort]         = useState("newest");
  const [activeCategory, setCategory]  = useState("all");

  // Load products from localStorage or fallback
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("products");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const newOnes = parsed.filter((p) => p.isNew);
            const base    = newOnes.length > 0 ? newOnes : parsed;
            setAllProducts(base);
            setHeroSlides(toSlides(sortNewest(base)));
            setLoading(false);
            return;
          }
        }
      } catch {}
      setAllProducts(generatedProducts);
      setHeroSlides(toSlides(generatedProducts));
      setLoading(false);
    };

    load();
    window.addEventListener("productsUpdate", load);
    return () => window.removeEventListener("productsUpdate", load);
  }, []);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];
    return cats;
  }, [allProducts]);

  // Apply filter + sort
  const displayed = useMemo(() => {
    let list = activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

    if (sort === "newest")  return sortNewest(list);
    if (sort === "lowest")  return sortLowest(list);
    if (sort === "highest") return sortHighest(list);
    return list;
  }, [allProducts, sort, activeCategory]);

  const resetFilters = () => { setCategory("all"); setSort("newest"); };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero carousel */}
      {!loading && heroSlides.length > 0 && (
        <div className="w-full bg-white mb-2">
          <Carousel images={heroSlides} interval={4500} />
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10" aria-labelledby="new-arrivals-heading">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">New Arrivals</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Fresh in</span>
          <h1 id="new-arrivals-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
            New Arrivals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            The latest additions to our collection — added fresh every week.
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
              ? <EmptyState hasFilter={activeCategory !== "all" || sort !== "newest"} onReset={resetFilters} />
              : displayed.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                ))
          }
        </div>

        {/* Bottom CTA */}
        {!loading && displayed.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 mb-3">Looking for something specific?</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-green-500 hover:text-green-700 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            >
              Browse all products →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}