import React, { useContext, useEffect, useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Carousel from "../components/Carousel";

// ─── Fallback products — same Unsplash URLs as Shop (browser caches them) ────
const FALLBACK_FEATURED = [
  { id: 1, name: "Casual Linen Shirt",  priceNum: 59.99,  category: "Clothing",    img: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&q=80", description: "Lightweight and breathable — perfect for Ghana's climate.", isNew: true },
  { id: 2, name: "Studio Headphones",   priceNum: 129.99, category: "Electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", description: "Crystal clear sound with deep bass and 30hr battery." },
  { id: 5, name: "Running Sneakers",    priceNum: 110.00, category: "Shoes",       img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", description: "Lightweight mesh upper with responsive foam sole.", isDeal: true, originalPrice: 150.00 },
  { id: 6, name: "Smartwatch Pro",      priceNum: 249.99, category: "Watches",     img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", description: "Heart rate, GPS, sleep tracking and 7-day battery." },
];

const FALLBACK_SLIDES = [
  { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",  alt: "Running Sneakers", caption: "Up to 30% off — Running sneakers"    },
  { src: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80", alt: "Laptop",         caption: "Powerful laptops — starting ₹ 899" },
  { src: "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=1200&q=80", alt: "Linen Shirt",     caption: "New arrivals — Clothing collection"   },
  { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80", alt: "Smartwatch",      caption: "Smart wearables — Track everything"   },
];

const CATEGORIES = [
  { label: "Shoes",        path: "/shop?category=shoes",       bg: "bg-amber-50",  border: "border-amber-100",  text: "text-amber-800",  icon: ShoeIcon  },
  { label: "Clothing",     path: "/shop?category=clothing",    bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-800",   icon: ShirtIcon },
  { label: "Accessories",  path: "/shop?category=accessories", bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-800", icon: GlassIcon },
  { label: "Bags",         path: "/shop?category=bags",        bg: "bg-rose-50",   border: "border-rose-100",   text: "text-rose-800",   icon: BagIcon   },
  { label: "Watches",      path: "/shop?category=watches",     bg: "bg-teal-50",   border: "border-teal-100",   text: "text-teal-800",   icon: WatchIcon },
  { label: "New Arrivals", path: "/new",                       bg: "bg-green-50",  border: "border-green-100",  text: "text-green-800",  icon: SparkIcon },
];

const TRUST_BADGES = [
  { icon: TruckIcon,   title: "Free Delivery",   desc: "On all orders over ₹ 200"      },
  { icon: ShieldIcon,  title: "Secure Payments", desc: "100% protected transactions"      },
  { icon: ReturnIcon,  title: "Easy Returns",    desc: "14-day hassle-free return policy" },
  { icon: SupportIcon, title: "24/7 Support",    desc: "Reach us anytime on WhatsApp"     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toNum = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^0-9.]/g, "")) || 0;
  return 0;
};
const fmt = (n) => `₹ ${toNum(n).toFixed(2)}`;
function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch { return null; }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function TruckIcon()   { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function ShieldIcon()  { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>; }
function ReturnIcon()  { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>; }
function SupportIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function ShoeIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18l4-8 4 3 4-5 8 10H2z"/></svg>; }
function ShirtIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>; }
function GlassIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><line x1="11" y1="12" x2="13" y2="12"/><line x1="3" y1="12" x2="3" y2="10"/><line x1="21" y1="12" x2="21" y2="10"/></svg>; }
function BagIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function WatchIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82h-4.32a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.32a2 2 0 012 1.82l.35 3.83"/></svg>; }
function SparkIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function CartIconSm()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
function HeartIcon({ filled }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
function CheckIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>; }
function ArrowIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>; }
function WhatsAppIcon(){ return <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.373 0 .04 5.373 0 12c0 2.12.553 4.19 1.6 6.02L0 24l6.12-1.58A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.87 0-3.67-.5-5.24-1.45l-.37-.22-3.64.94.98-3.55-.24-.36A9.46 9.46 0 0 1 2.5 12c0-5.24 4.26-9.5 9.5-9.5 2.54 0 4.92.99 6.7 2.8A9.42 9.42 0 0 1 21.5 12c0 5.24-4.26 9.5-9.5 9.5z"/><path d="M17.5 14.1c-.3-.15-1.8-.9-2.07-1-.27-.1-.47-.15-.67.15-.2.3-.78 1-.95 1.2-.17.2-.33.22-.63.07-1.7-.83-2.8-1.48-3.92-3.36-.3-.5.3-.46.86-1.53.1-.26 0-.5-.05-.65-.05-.17-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.25 5.06 4.6 2.98 1.35 2.98.9 3.52.84.54-.06 1.76-.68 2.01-1.34.25-.66.25-1.22.18-1.34-.07-.12-.27-.2-.57-.35z" fill="#fff"/></svg>; }

// ─── Product Card — identical pattern to Shop.jsx ─────────────────────────────
const ProductCard = memo(function ProductCard({ product, priority = false }) {
  const { addToCart }           = useContext(CartContext);
  const [added,    setAdded]    = useState(false);
  const [wished,   setWished]   = useState(false);
  const [imgError, setImgError] = useState(false);

  const priceNum  = toNum(product.priceNum ?? product.price);
  const origPrice = toNum(product.originalPrice);
  const discount  = origPrice > priceNum ? Math.round(((origPrice - priceNum) / origPrice) * 100) : 0;

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
        <HeartIcon filled={wished} />
      </button>

      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isDeal && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Deal</span>}
        {product.isNew && !product.isDeal && <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>}
        {discount > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
      </div>

      <div className="relative overflow-hidden bg-gray-100 aspect-[4/3] flex-shrink-0">
        {!imgError && product.img ? (
          <img src={product.img} alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchpriority={priority ? "high" : "low"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
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
        {product.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <span className="text-base font-bold text-green-700">{fmt(priceNum)}</span>
            {origPrice > priceNum && <span className="block text-xs text-gray-400 line-through mt-0.5">{fmt(origPrice)}</span>}
          </div>
          <button type="button" onClick={handleAdd}
            aria-label={added ? `${product.name} added` : `Add ${product.name} to cart`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-200 active:scale-95 ${added ? "bg-green-50 text-green-700 border border-green-300" : "bg-green-600 hover:bg-green-700 text-white shadow-sm"}`}>
            {added ? <><CheckIcon /> Added!</> : <><CartIconSm /> Add to cart</>}
          </button>
        </div>
      </div>
    </article>
  );
});

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

function SectionHeader({ eyebrow, title, linkTo, linkLabel }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{eyebrow}</span>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
          {linkLabel} <ArrowIcon />
        </Link>
      )}
    </div>
  );
}

function TrustBadges() {
  return (
    <section aria-label="Why shop with us" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0"><Icon /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section aria-labelledby="categories-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <SectionHeader eyebrow="Browse by category" title="Shop by Category" linkTo="/shop" linkLabel="All categories" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map(({ label, path, bg, border, text, icon: Icon }) => (
          <Link key={label} to={path} aria-label={`Browse ${label}`}
            className={`group flex flex-col items-center gap-2.5 p-4 ${bg} border ${border} rounded-2xl text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200`}>
            <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${text} group-hover:scale-110 transition-transform duration-200 shadow-sm border ${border}`}>
              <Icon />
            </div>
            <span className={`font-semibold text-xs leading-tight ${text}`}>{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/deals" className="group relative col-span-1 md:col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-8 flex flex-col justify-between min-h-[180px] hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" aria-hidden="true"/>
          <div className="absolute -right-4 bottom-0 w-28 h-28 rounded-full bg-black/10 pointer-events-none" aria-hidden="true"/>
          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider mb-3 border border-white/30">🔥 Limited Time</span>
            <h3 className="text-3xl font-extrabold text-white leading-tight">Hot Deals</h3>
            <p className="text-red-100 text-sm mt-1">Up to 50% off selected items today</p>
          </div>
          <span className="relative z-10 inline-flex items-center gap-2 text-white font-bold text-sm mt-6 group-hover:gap-3 transition-all duration-200">Shop deals now <ArrowIcon /></span>
        </Link>
        <Link to="/new" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex flex-col justify-between min-h-[180px] hover:shadow-2xl transition-shadow duration-300">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"/>
          <div className="relative z-10">
            <span className="inline-block bg-white/10 text-gray-300 text-xs font-bold px-3 py-1 rounded-full tracking-wider mb-3 border border-white/10">✨ Just Dropped</span>
            <h3 className="text-3xl font-extrabold text-white leading-tight">New<br/>Arrivals</h3>
            <p className="text-gray-400 text-sm mt-1">Fresh styles every week</p>
          </div>
          <span className="relative z-10 inline-flex items-center gap-2 text-white font-bold text-sm mt-6 group-hover:gap-3 transition-all duration-200">Explore new <ArrowIcon /></span>
        </Link>
      </div>
    </section>
  );
}

function WhatsAppCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative overflow-hidden bg-green-600 rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" aria-hidden="true"/>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-black/10 pointer-events-none" aria-hidden="true"/>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/30 text-white"><WhatsAppIcon /></div>
          <div>
            <p className="font-bold text-white text-lg">Need help choosing?</p>
            <p className="text-green-100 text-sm mt-0.5">Chat with us on WhatsApp — we reply in minutes.</p>
          </div>
        </div>
        <a href="https://api.whatsapp.com/send?phone=0502156703" target="_blank" rel="noopener noreferrer"
          className="relative z-10 flex-shrink-0 bg-white text-green-700 hover:bg-green-50 font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-lg">
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setStatus("error"); return; }
    setStatus("success");
    setEmail("");
  }, [email]);

  return (
    <section aria-labelledby="newsletter-heading" className="bg-gray-900 py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at 15% 50%, rgba(22,163,74,0.15) 0%, transparent 60%), radial-gradient(ellipse at 85% 50%, rgba(2,132,199,0.12) 0%, transparent 60%)" }}/>
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <span className="inline-block bg-green-900 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-5 tracking-widest uppercase border border-green-800">Newsletter</span>
        <h2 id="newsletter-heading" className="text-3xl font-extrabold text-white mb-3">Get exclusive deals<br/>in your inbox</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">Join thousands of shoppers. Be first to hear about new arrivals, flash sales, and style tips.</p>
        {status === "success" ? (
          <div className="bg-green-900/50 border border-green-700 text-white rounded-2xl px-6 py-5 inline-block">
            <p className="font-bold text-lg">You're in! 🎉</p>
            <p className="text-sm text-green-300 mt-1">Watch your inbox for exclusive deals.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input id="nl-email" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 rounded-xl text-sm bg-white/10 border text-white placeholder:text-gray-500 outline-none focus:bg-white/15 focus:border-green-500 transition-colors ${status === "error" ? "border-red-500" : "border-white/10"}`}/>
              {status === "error" && <p className="text-red-400 text-xs mt-1.5 text-left">Please enter a valid email address.</p>}
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap shadow-lg">Subscribe free</button>
          </form>
        )}
        <p className="text-gray-600 text-xs mt-5">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [slides,           setSlides]           = useState(FALLBACK_SLIDES);
  const [featuredProducts, setFeaturedProducts] = useState(FALLBACK_FEATURED);
  const [newArrivals,      setNewArrivals]      = useState([]);
  const [loading,          setLoading]          = useState(false);

  const loadProducts = useCallback(() => {
    const stored = loadFromStorage("products");
    if (stored) {
      setFeaturedProducts(stored.slice(0, 4));
      setNewArrivals(stored.filter((p) => p.isNew).slice(0, 4));
    }
    setLoading(false);
  }, []);

  const loadSlides = useCallback(() => {
    const stored = loadFromStorage("carouselSlides");
    if (stored) setSlides(stored);
  }, []);

  useEffect(() => {
    loadSlides();
    loadProducts();
    window.addEventListener("carouselUpdate",  loadSlides);
    window.addEventListener("productsUpdate",  loadProducts);
    return () => {
      window.removeEventListener("carouselUpdate", loadSlides);
      window.removeEventListener("productsUpdate", loadProducts);
    };
  }, [loadSlides, loadProducts]);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero carousel — full width, images load eagerly as LCP element */}
      <section aria-label="Promotional hero" className="w-full">
        <Carousel images={slides} interval={4000} />
      </section>

      <TrustBadges />

      {/* Featured products — first 2 cards get priority loading */}
      <section aria-labelledby="featured-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <SectionHeader eyebrow="Handpicked for you" title="Featured Products" linkTo="/shop" linkLabel="View all" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : featuredProducts.map((p, i) => <ProductCard key={p.id ?? i} product={p} priority={i < 2} />)
          }
        </div>
      </section>

      <PromoBanners />
      <CategorySection />

      {newArrivals.length > 0 && (
        <section aria-labelledby="new-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <SectionHeader eyebrow="Fresh in" title="New Arrivals" linkTo="/new" linkLabel="See all new" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.map((p, i) => <ProductCard key={p.id ?? i} product={p} priority={false} />)}
          </div>
        </section>
      )}

      <WhatsAppCTA />
      <Newsletter />
    </main>
  );
}