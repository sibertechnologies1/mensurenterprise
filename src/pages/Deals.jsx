import React, { useEffect, useState, useContext, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import { CartContext } from "../context/CartContext";

// ─── Fallback deals — Unsplash CDN, same as Shop/Home/New ────────────────────
const FALLBACK_DEALS = [
  { id: 9001, name: "Air Runner Pro Sneakers",  priceNum: 89.99,  originalPrice: 150.00, category: "Shoes",       isDeal: true, description: "Lightweight everyday trainer with cushioned sole.",      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"  },
  { id: 9002, name: "Slim Chino Trousers",       priceNum: 49.99,  originalPrice: 80.00,  category: "Clothing",    isDeal: true, description: "Tailored slim-fit chino in stretch cotton.",            img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80" },
  { id: 9003, name: "Aviator Sunglasses",        priceNum: 38.00,  originalPrice: 65.00,  category: "Accessories", isDeal: true, description: "UV400 polarised frames, full wrap protection.",         img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80" },
  { id: 9004, name: "Minimalist Field Watch",    priceNum: 135.00, originalPrice: 210.00, category: "Watches",     isDeal: true, description: "Clean-dial Japanese quartz, leather strap.",            img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80" },
  { id: 9005, name: "Roll-top Backpack 20L",     priceNum: 72.00,  originalPrice: 120.00, category: "Bags",        isDeal: true, description: "Waterproof 20L roll-top pack with laptop sleeve.",     img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"  },
  { id: 9006, name: "Fleece Pullover Hoodie",    priceNum: 55.00,  originalPrice: 95.00,  category: "Clothing",    isDeal: true, description: "Warm brushed fleece, kangaroo pocket, ribbed cuffs.",  img: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80"  },
  { id: 9007, name: "Leather Bifold Wallet",     priceNum: 28.00,  originalPrice: 50.00,  category: "Accessories", isDeal: true, description: "Slim genuine leather wallet, 6 card slots.",           img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80" },
  { id: 9008, name: "Chrono Sport Watch",        priceNum: 195.00, originalPrice: 320.00, category: "Watches",     isDeal: true, description: "Stainless steel chronograph, 50m water resistance.",   img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80" },
];

const CATEGORY_TABS = ["All", "Shoes", "Clothing", "Accessories", "Watches", "Bags"];

const SORT_OPTIONS = [
  { value: "discount",   label: "Biggest discount"   },
  { value: "price-asc",  label: "Price: Low → High"  },
  { value: "price-desc", label: "Price: High → Low"  },
  { value: "name",       label: "Name: A → Z"        },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
  return 0;
};
const fmt = (n) => `₹ ${toNum(n).toFixed(2)}`;
const discountPct = (orig, curr) =>
  orig > curr && curr > 0 ? Math.round(((orig - curr) / orig) * 100) : 0;

function loadDeals() {
  try {
    const raw = localStorage.getItem("products");
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || !arr.length) return null;
    const deals = arr.filter((p) => p.isDeal);
    return deals.length > 0 ? deals : null;
  } catch { return null; }
}

const normalise = (arr) =>
  arr.map((p) => ({
    ...p,
    priceNum:      toNum(p.priceNum ?? p.price),
    originalPrice: toNum(p.originalPrice),
  }));

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCart  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IconCheck = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>;
const IconHeart = ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const IconTag   = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg>;
const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
const IconFire  = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C9 7 4 9 4 14a8 8 0 0016 0c0-5-3-8-8-12zm0 18a5 5 0 01-5-5c0-3 2-5 5-9 3 4 5 6 5 9a5 5 0 01-5 5z"/></svg>;

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function useCountdown() {
  const getRemaining = () => {
    const now = new Date(), midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const d = Math.max(0, midnight - now);
    return { h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) };
  };
  const [time, setTime] = useState(getRemaining);
  useEffect(() => { const id = setInterval(() => setTime(getRemaining()), 1000); return () => clearInterval(id); }, []);
  return time;
}

function CountdownTimer() {
  const { h, m, s } = useCountdown();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-3" aria-live="polite" aria-label="Deal ends in">
      {[{ val: pad(h), label: "HRS" }, { val: pad(m), label: "MIN" }, { val: pad(s), label: "SEC" }].map(({ val, label }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <span className="text-red-300 font-bold text-lg -mt-3" aria-hidden="true">:</span>}
          <div className="flex flex-col items-center">
            <div className="bg-white/20 rounded-xl w-14 h-14 flex items-center justify-center border border-white/30">
              <span className="text-white font-extrabold text-xl tabular-nums leading-none">{val}</span>
            </div>
            <span className="text-red-200 text-[9px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({ dealCount }) {
  return (
    <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 overflow-hidden">
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" aria-hidden="true"/>
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/10 pointer-events-none" aria-hidden="true"/>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4 border border-white/30">
              <span className="text-white text-xs font-bold uppercase tracking-widest">Limited time offers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
              Today's<br/><span className="text-yellow-300">Hot Deals</span>
            </h1>
            <p className="text-red-100 text-sm sm:text-base max-w-sm">
              {dealCount > 0
                ? `${dealCount} hand-picked deal${dealCount !== 1 ? "s" : ""} — at prices too good to miss.`
                : "Fresh deals added daily — don't miss out on massive savings."}
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-red-100 text-xs font-bold uppercase tracking-widest">
              <IconClock /> Deals reset in
            </div>
            <CountdownTimer />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card — consistent with Shop, Home, New ──────────────────────────────

const DealCard = memo(function DealCard({ product, rank, priority = false }) {
  const { addToCart }           = useContext(CartContext);
  const [added,    setAdded]    = useState(false);
  const [wished,   setWished]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const priceNum  = toNum(product.priceNum ?? product.price);
  const origPrice = toNum(product.originalPrice);
  const pct       = discountPct(origPrice, priceNum);
  const savings   = origPrice > priceNum ? origPrice - priceNum : 0;

  const handleAdd = useCallback(() => {
    addToCart({ id: product.id, name: product.name, priceNum, img: product.img });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [product, priceNum, addToCart]);

  return (
    <article className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">

      <button type="button" onClick={() => setWished((v) => !v)}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${wished ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-400 hover:bg-red-50"}`}>
        <IconHeart filled={wished} />
      </button>

      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Deal</span>
        {pct > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{pct}%</span>}
        {rank <= 3 && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <IconFire /> Hot
          </span>
        )}
      </div>

      <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] flex-shrink-0">
        {!imgError && product.img ? (
          <img src={product.img} alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchpriority={priority ? "high" : "low"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
        {product.category && (
          <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{product.name}</h3>
        {product.description && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>}

        {savings > 0 && (
          <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-2 py-0.5 rounded-full mb-3 self-start">
            You save {fmt(savings)}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <span className="text-base font-bold text-green-700">{fmt(priceNum)}</span>
            {origPrice > priceNum && <span className="block text-xs text-gray-400 line-through mt-0.5">{fmt(origPrice)}</span>}
          </div>
          <button type="button" onClick={handleAdd}
            aria-label={added ? `${product.name} added` : `Add ${product.name} to cart`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-200 active:scale-95 ${added ? "bg-green-50 text-green-700 border border-green-300" : "bg-green-600 hover:bg-green-700 text-white shadow-sm"}`}>
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
    <div className="bg-gray-200 aspect-[4/3]"/>
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-4/5"/>
      <div className="h-3 bg-gray-200 rounded w-3/5"/>
      <div className="h-3 bg-gray-200 rounded w-1/2"/>
      <div className="flex justify-between items-center mt-3">
        <div className="h-5 bg-gray-200 rounded w-1/3"/>
        <div className="h-8 bg-gray-200 rounded-xl w-24"/>
      </div>
    </div>
  </div>
));

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-24 gap-5">
      <div className="text-gray-200"><IconTag /></div>
      <div>
        <p className="text-xl font-bold text-gray-700">No deals right now</p>
        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">Check back soon — new offers drop daily!</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link to="/shop" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">Browse all products <IconArrow /></Link>
        <Link to="/new" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors">New arrivals</Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Deals() {
  const [allDeals,   setAllDeals]   = useState(() => normalise(loadDeals() ?? FALLBACK_DEALS));
  const [heroSlides, setHeroSlides] = useState(() =>
    normalise(loadDeals() ?? FALLBACK_DEALS).filter((p) => p.img).slice(0, 5).map((p) => ({ src: p.img, alt: p.name, caption: p.name }))
  );
  const [loading,   setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [sort,      setSort]      = useState("discount");

  const reload = useCallback(() => {
    const deals = normalise(loadDeals() ?? FALLBACK_DEALS);
    setAllDeals(deals);
    setHeroSlides(deals.filter((p) => p.img).slice(0, 5).map((p) => ({ src: p.img, alt: p.name, caption: p.name })));
  }, []);

  useEffect(() => {
    window.addEventListener("productsUpdate", reload);
    return () => window.removeEventListener("productsUpdate", reload);
  }, [reload]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORY_TABS.forEach((tab) => {
      if (tab !== "All") counts[tab] = allDeals.filter((p) => (p.category || "").toLowerCase() === tab.toLowerCase()).length;
    });
    return counts;
  }, [allDeals]);

  const filtered = useMemo(() =>
    activeTab === "All" ? allDeals : allDeals.filter((p) => (p.category || "").toLowerCase() === activeTab.toLowerCase()),
    [allDeals, activeTab]
  );

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
    <main className="min-h-screen bg-gray-50">

      <HeroBanner dealCount={allDeals.length} />

      {heroSlides.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <Carousel images={heroSlides} interval={5000} />
        </div>
      )}

      <div className="bg-white border-b border-gray-100 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700 font-medium">Deals</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Flash sale</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-0.5">All Deals</h2>
            {!loading && <p className="text-sm text-gray-400 mt-0.5">{sorted.length} deal{sorted.length !== 1 ? "s" : ""} available</p>}
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="deals-sort" className="sr-only">Sort deals</label>
            <select id="deals-sort" value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-green-500 shadow-sm cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
              All products <IconArrow />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }} role="tablist" aria-label="Filter by category">
          {CATEGORY_TABS.map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                activeTab === tab ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}>
              {tab}
              {tab !== "All" && categoryCounts[tab] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {categoryCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sorted.map((product, i) => (
              <DealCard key={product.id} product={product} rank={i + 1} priority={i < 4} />
            ))}
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-400 px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div className="text-center sm:text-left">
              <p className="text-white font-extrabold text-lg">Want more options?</p>
              <p className="text-red-100 text-sm mt-0.5">Browse our full catalogue — hundreds of products across all categories.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold text-sm px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow">
                Shop all <IconArrow />
              </Link>
              <Link to="/new" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
                New arrivals
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}