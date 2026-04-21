import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Carousel from "../components/Carousel";
import imgShirt      from "../components/images/shirt.jpg";
import imgLaptop     from "../components/images/view-3d-laptop-device-with-screen-keyboard.jpg";
import imgHeadphones from "../components/images/headphones-displayed-against-dark-background.jpg";
import imgUtensils   from "../components/images/closeup-shot-silver-utensils-set-isolated-black-surface.jpg";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PRODUCT CARD
// This is the SINGLE source of truth for product card design.
// Copy this exact component into Shop.jsx to keep both pages in sync.
// Any future style change only needs to happen here once.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Helpers (identical to Shop.jsx) ──────────────────────────────────────────

function toNum(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

function formatGHS(price) {
  const n = toNum(price);
  return `₹ ${n.toFixed(2)}`;
}

function loadFromStorage(key, validator) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validator(parsed) ? parsed : null;
  } catch { return null; }
}

// ─── Scroll reveal hook (identical to Shop.jsx) ────────────────────────────────

function useReveal(threshold = 0.1) {
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

// ─── Placeholder gradients (identical to Shop.jsx) ────────────────────────────

const PLACEHOLDER_GRADIENTS = [
  "from-green-50  to-emerald-100",
  "from-sky-50    to-blue-100",
  "from-amber-50  to-orange-100",
  "from-violet-50 to-purple-100",
  "from-rose-50   to-pink-100",
  "from-slate-50  to-gray-100",
];

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

const IconArrow = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconStar = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.373 0 .04 5.373 0 12c0 2.12.553 4.19 1.6 6.02L0 24l6.12-1.58A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.87 0-3.67-.5-5.24-1.45l-.37-.22-3.64.94.98-3.55-.24-.36A9.46 9.46 0 012.5 12c0-5.24 4.26-9.5 9.5-9.5 2.54 0 4.92.99 6.7 2.8A9.42 9.42 0 0121.5 12c0 5.24-4.26 9.5-9.5 9.5z"/>
    <path d="M17.5 14.1c-.3-.15-1.8-.9-2.07-1-.27-.1-.47-.15-.67.15-.2.3-.78 1-.95 1.2-.17.2-.33.22-.63.07-1.7-.83-2.8-1.48-3.92-3.36-.3-.5.3-.46.86-1.53.1-.26 0-.5-.05-.65-.05-.17-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.25 5.06 4.6 2.98 1.35 2.98.9 3.52.84.54-.06 1.76-.68 2.01-1.34.25-.66.25-1.22.18-1.34-.07-.12-.27-.2-.57-.35z" fill="#fff"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// ★ PRODUCT CARD — exact copy of Shop.jsx's ProductCard
//   Identical tokens: border-radius, shadow, image ratio, badge placement,
//   star logic, price format, button states, hover animations, entrance timing.
// ══════════════════════════════════════════════════════════════════════════════

export function ProductCard({ product, delay = 0 }) {
  const { addToCart }           = useContext(CartContext);
  const [imgError, setImgError] = useState(false);
  const [added,    setAdded]    = useState(false);
  const [wished,   setWished]   = useState(false);
  const [ref, visible]          = useReveal(0.05);

  // Normalise price — handles both `priceNum` (Home default data) and
  // `price` (localStorage products) — identical to Shop.jsx
  const priceNum   = toNum(product.priceNum ?? product.price);
  const origPrice  = toNum(product.originalPrice);
  const hasImg     = product.img && !imgError;
  const grad       = PLACEHOLDER_GRADIENTS[product.id % PLACEHOLDER_GRADIENTS.length];
  const stars      = 3 + (product.id % 3);
  const reviews    = 8 + ((product.id * 13) % 92);

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
      {/* ── Wishlist button ── */}
      <button
        type="button"
        onClick={() => setWished(v => !v)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center
          justify-center transition-all duration-200 shadow-sm
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
          ${wished
            ? "bg-red-50 text-red-500 scale-110"
            : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-red-50"
          }`}
      >
        <IconHeart filled={wished} />
      </button>

      {/* ── Status badges (top-left) ── */}
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
            <span className="text-5xl opacity-25 select-none" aria-hidden="true">🛍️</span>
          </div>
        )}

        {/* Category pill overlaid on image — same as Shop */}
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

        {/* Product name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Description (shown if available) */}
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>
        )}

        {/* Star rating — same seeding logic as Shop */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < stars ? "text-amber-400" : "text-gray-200"}>
              <IconStar />
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({reviews})</span>
        </div>

        {/* Price row — same layout as Shop */}
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

          {/* Add to cart button — identical to Shop */}
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

// ─── Skeleton (identical to Shop.jsx) ─────────────────────────────────────────

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

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, linkTo, linkLabel }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div
      ref={ref}
      className="flex items-end justify-between mb-7"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div>
        <span className="text-[11px] font-bold text-green-600 uppercase tracking-[0.18em]">
          {eyebrow}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{title}</h2>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1.5 text-sm font-semibold text-green-600
            hover:text-green-800 transition-colors focus:outline-none
            focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          {linkLabel} <IconArrow />
        </Link>
      )}
    </div>
  );
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const featuredDefaults = [
  { id: 1, name: "Casual Shirt",       priceNum: 59.99,  img: imgShirt,      category: "Clothing",    isNew: false, isDeal: false },
  { id: 2, name: "Lightweight Laptop", priceNum: 899.99, img: imgLaptop,     category: "Electronics", isNew: true,  isDeal: false },
  { id: 3, name: "Studio Headphones",  priceNum: 129.99, img: imgHeadphones, category: "Accessories", isNew: false, isDeal: true  },
  { id: 4, name: "Dining Set",         priceNum: 49.99,  img: imgUtensils,   category: "Home",        isNew: true,  isDeal: false },
];

const defaultSlides = [
  { src: imgLaptop,     alt: "Laptop",     caption: "Powerful performance — latest laptops"   },
  { src: imgHeadphones, alt: "Headphones", caption: "Crystal clear sound — studio headphones" },
  { src: imgShirt,      alt: "Shirt",      caption: "Comfort & style — casual shirts"         },
  { src: imgUtensils,   alt: "Dining set", caption: "Quality dining — elegant tableware"      },
];

const CATEGORIES = [
  { label: "Shoes",        path: "/categories/shoes",       icon: "👟", color: "#d97706", light: "#fffbeb", accent: "#fde68a" },
  { label: "Clothing",     path: "/categories/clothing",    icon: "👕", color: "#0284c7", light: "#f0f9ff", accent: "#bae6fd" },
  { label: "Accessories",  path: "/categories/accessories", icon: "🕶️", color: "#7c3aed", light: "#faf5ff", accent: "#ddd6fe" },
  { label: "Watches",      path: "/categories/watches",     icon: "⌚", color: "#059669", light: "#ecfdf5", accent: "#a7f3d0" },
  { label: "Bags",         path: "/categories/bags",        icon: "👜", color: "#db2777", light: "#fdf2f8", accent: "#fbcfe8" },
  { label: "New Arrivals", path: "/new",                    icon: "✨", color: "#16a34a", light: "#f0fdf4", accent: "#bbf7d0" },
];

const TRUST_BADGES = [
  { icon: "🚚", title: "Free Delivery",   desc: "On all orders over ₹ 200"      },
  { icon: "🔒", title: "Secure Payments", desc: "100% protected transactions"      },
  { icon: "↩️", title: "Easy Returns",    desc: "14-day hassle-free return policy" },
  { icon: "💬", title: "24/7 Support",    desc: "Reach us anytime on WhatsApp"     },
];

const STATS = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Products"        },
  { value: "50+",  label: "Brands"          },
  { value: "4.9★", label: "Average Rating"  },
];

// ─── Page sections ─────────────────────────────────────────────────────────────

function HeroSection({ slides }) {
  return (
    <section aria-label="Promotional hero">
      <Carousel images={slides} interval={4000} />
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5
          grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-white/10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <span className="text-xl sm:text-2xl font-extrabold text-white leading-none">{value}</span>
              <span className="text-gray-500 text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const [ref, visible] = useReveal(0.1);
  return (
    <section
      ref={ref}
      aria-label="Why shop with us"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_BADGES.map(({ icon, title, desc }, i) => (
          <div
            key={title}
            className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5
              hover:shadow-md hover:border-green-100 transition-all duration-300"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center
              text-2xl shrink-0 border border-green-100">
              {icon}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromoBanners() {
  const [ref, visible] = useReveal(0.1);
  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wide deals banner */}
        <Link to="/deals"
          className="group relative col-span-1 md:col-span-2 overflow-hidden rounded-2xl
            bg-gradient-to-br from-red-600 via-red-500 to-orange-500
            p-8 flex flex-col justify-between min-h-[180px] hover:shadow-2xl
            transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" aria-hidden="true"/>
          <div className="absolute -right-4 bottom-0 w-28 h-28 rounded-full bg-black/10" aria-hidden="true"/>
          <div className="relative z-10">
            <span className="inline-block bg-white/20 text-white text-xs font-bold
              px-3 py-1 rounded-full tracking-wider mb-3 border border-white/30">
              🔥 Limited Time
            </span>
            <h3 className="text-3xl font-extrabold text-white leading-tight">Hot Deals</h3>
            <p className="text-red-100 text-sm mt-1">Up to 50% off selected items today</p>
          </div>
          <span className="relative z-10 inline-flex items-center gap-2 text-white font-bold
            text-sm mt-6 group-hover:gap-3 transition-all duration-200">
            Shop deals now <IconArrow />
          </span>
        </Link>

        {/* Narrow new arrivals banner */}
        <Link to="/new"
          className="group relative overflow-hidden rounded-2xl
            bg-gradient-to-br from-gray-900 to-gray-800
            p-8 flex flex-col justify-between min-h-[180px] hover:shadow-2xl
            transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" aria-hidden="true"/>
          <div className="relative z-10">
            <span className="inline-block bg-white/10 text-gray-300 text-xs font-bold
              px-3 py-1 rounded-full tracking-wider mb-3 border border-white/10">
              ✨ Just Dropped
            </span>
            <h3 className="text-3xl font-extrabold text-white leading-tight">New<br/>Arrivals</h3>
            <p className="text-gray-400 text-sm mt-1">Fresh styles every week</p>
          </div>
          <span className="relative z-10 inline-flex items-center gap-2 text-white font-bold
            text-sm mt-6 group-hover:gap-3 transition-all duration-200">
            Explore new <IconArrow />
          </span>
        </Link>
      </div>
    </section>
  );
}

function CategorySection() {
  const [ref, visible] = useReveal(0.1);
  return (
    <section
      ref={ref}
      aria-labelledby="categories-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <SectionHeader
        eyebrow="Browse by category"
        title="Shop by Category"
        linkTo="/categories"
        linkLabel="All categories"
      />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.label}
            to={cat.path}
            aria-label={`Browse ${cat.label}`}
            className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border
              text-center transition-all duration-200 focus:outline-none
              focus-visible:ring-2 focus-visible:ring-green-500 hover:-translate-y-1 hover:shadow-lg"
            style={{
              backgroundColor: cat.light,
              borderColor:     cat.accent,
              transitionDelay: `${i * 40}ms`,
            }}
          >
            <span
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                transition-transform duration-200 group-hover:scale-110 shadow-sm"
              style={{ backgroundColor: cat.accent }}
              aria-hidden="true"
            >
              {cat.icon}
            </span>
            <span className="font-bold text-xs leading-tight" style={{ color: cat.color }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function WhatsAppCTA() {
  const [ref, visible] = useReveal(0.1);
  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div className="relative overflow-hidden bg-green-600 rounded-2xl px-6 py-8
        flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true"/>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-black/10" aria-hidden="true"/>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center
            shrink-0 border border-white/30">
            <IconWhatsApp />
          </div>
          <div>
            <p className="font-extrabold text-white text-lg">Need help choosing?</p>
            <p className="text-green-100 text-sm mt-0.5">
              Chat with us on WhatsApp — we reply in minutes.
            </p>
          </div>
        </div>
        <a
          href="https://api.whatsapp.com/send?phone=0502156703"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 flex-shrink-0 bg-white text-green-700 hover:bg-green-50
            font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-lg
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white
            focus-visible:ring-offset-2 focus-visible:ring-offset-green-600"
        >
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState("idle");
  const [ref, visible]      = useReveal(0.1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  };

  return (
    <section
      ref={ref}
      aria-labelledby="newsletter-heading"
      className="relative bg-gray-900 py-16 px-4 overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.7s ease" }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(ellipse at 15% 50%, rgba(22,163,74,0.15) 0%, transparent 60%),
                            radial-gradient(ellipse at 85% 50%, rgba(2,132,199,0.12) 0%, transparent 60%)`,
        }}
      />
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <span className="inline-block bg-green-900 text-green-400 text-xs font-bold
          px-3 py-1 rounded-full mb-5 tracking-widest uppercase border border-green-800">
          Newsletter
        </span>
        <h2 id="newsletter-heading" className="text-3xl font-extrabold text-white mb-3">
          Get exclusive deals<br/>in your inbox
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Join thousands of shoppers. Be first to hear about new arrivals,
          flash sales, and style tips.
        </p>

        {status === "success" ? (
          <div className="bg-green-900/50 border border-green-700 text-white rounded-2xl px-6 py-5 inline-block">
            <p className="font-bold text-lg">You're in! 🎉</p>
            <p className="text-sm text-green-300 mt-1">Watch your inbox for exclusive deals.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input
                id="nl-email" type="email" value={email}
                onChange={e => { setEmail(e.target.value); setStatus("idle"); }}
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 rounded-xl text-sm bg-white/10 border
                  text-white placeholder:text-gray-500 outline-none
                  focus:bg-white/15 focus:border-green-500 transition-colors
                  ${status === "error" ? "border-red-500" : "border-white/10"}`}
              />
              {status === "error" && (
                <p className="text-red-400 text-xs mt-1.5 text-left">
                  Please enter a valid email address.
                </p>
              )}
            </div>
            <button type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3
                rounded-xl text-sm transition-colors whitespace-nowrap shadow-lg
                focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400">
              Subscribe free
            </button>
          </form>
        )}
        <p className="text-gray-600 text-xs mt-5">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [slides,           setSlides]           = useState(defaultSlides);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals,      setNewArrivals]      = useState([]);
  const [loading,          setLoading]          = useState(true);

  const loadProducts = () => {
    const parsed = loadFromStorage("products", d => Array.isArray(d) && d.length > 0);
    if (parsed) {
      setFeaturedProducts(parsed.slice(0, 4));
      setNewArrivals(parsed.filter(p => p.isNew).slice(0, 4));
    } else {
      setFeaturedProducts(featuredDefaults);
      setNewArrivals([]);
    }
    setLoading(false);
  };

  const loadSlides = () => {
    const parsed = loadFromStorage("carouselSlides", d => Array.isArray(d) && d.length > 0);
    setSlides(parsed ?? defaultSlides);
  };

  useEffect(() => {
    loadSlides();
    loadProducts();
    window.addEventListener("carouselUpdate", loadSlides);
    window.addEventListener("productsUpdate", loadProducts);
    return () => {
      window.removeEventListener("carouselUpdate", loadSlides);
      window.removeEventListener("productsUpdate", loadProducts);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: "'Sora', sans-serif" }}>

      <HeroSection slides={slides} />
      <TrustBadges />

      {/* Featured Products */}
      <section aria-labelledby="featured-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <SectionHeader
          eyebrow="Handpicked for you"
          title="Featured Products"
          linkTo="/shop"
          linkLabel="View all"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : featuredProducts.map((p, i) => (
                <ProductCard key={p.id ?? i} product={p} delay={i * 80} />
              ))
          }
        </div>
      </section>

      <PromoBanners />
      <CategorySection />

      {/* New Arrivals — only when data exists */}
      {!loading && newArrivals.length > 0 && (
        <section aria-labelledby="new-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <SectionHeader
            eyebrow="Fresh in"
            title="New Arrivals"
            linkTo="/new"
            linkLabel="See all new"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id ?? i} product={p} delay={i * 80} />
            ))}
          </div>
        </section>
      )}

      <WhatsAppCTA />
      <Newsletter />

    </main>
  );
}