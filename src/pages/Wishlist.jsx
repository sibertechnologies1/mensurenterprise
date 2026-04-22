import React, { useContext, useState, useRef, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Requires in index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
//
// Wishlist state is read from WishlistContext — items saved from Home, Shop,
// New, Deals, or CategoryPage appear here automatically with no extra wiring.

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS — identical to Shop.jsx so currency & formatting are always in sync
// ═══════════════════════════════════════════════════════════════════════════════

function toNum(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

// ✅ ₹ — was ₹ (formatINR) — now matches Shop.jsx and Home.jsx exactly
function formatGHS(price) {
  return `₹ ${toNum(price).toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE — single shared IntersectionObserver (same as Shop.jsx)
// Replaces per-card observers that caused scroll jank
// ═══════════════════════════════════════════════════════════════════════════════

const sharedObserver = {
  _io: null,
  _callbacks: new Map(),

  get() {
    if (!this._io && typeof window !== "undefined") {
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const cb = this._callbacks.get(entry.target);
              if (cb) { cb(); this.unwatch(entry.target); }
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
      );
    }
    return this._io;
  },

  watch(el, cb)  { this._callbacks.set(el, cb); this.get()?.observe(el);   },
  unwatch(el)    { this._callbacks.delete(el);  this.get()?.unobserve(el); },
};

function useSharedReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sharedObserver.watch(el, () => setVisible(true));
    return () => sharedObserver.unwatch(el);
  }, []);
  return [ref, visible];
}

// ─── Placeholder gradients — 6 items, matches Shop.jsx & Home.jsx ──────────────

const PLACEHOLDER_GRADIENTS = [
  "from-green-50  to-emerald-100",
  "from-sky-50    to-blue-100",
  "from-amber-50  to-orange-100",
  "from-violet-50 to-purple-100",
  "from-rose-50   to-pink-100",   // ✅ added to match Shop/Home
  "from-slate-50  to-gray-100",   // ✅ added to match Shop/Home
];

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const IconHeart = ({ filled, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const IconCart = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6"/>
  </svg>
);

const IconShare = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const IconStar = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST CARD
// ✅ Pixel-perfect match to Shop.jsx ProductCard:
//   - White pill category label ON image (was green text above name)
//   - Price left + compact button right (was full-width button below price)
//   - scale-105 image hover (was scale-110 — too aggressive)
//   - CSS class transitions (was inline style — caused jank)
//   - memo() wrapper (prevents re-renders when siblings change)
//   - shared IntersectionObserver (no per-card observer)
//   - ₹ currency (was ₹)
//   - Remove animation: opacity + scale via CSS (no inline transition string)
// ═══════════════════════════════════════════════════════════════════════════════

const WishlistCard = memo(function WishlistCard({ item, index }) {
  const { addToCart }            = useContext(CartContext);
  const { removeItem }           = useWishlist();
  const [added,    setAdded]     = useState(false);
  const [removing, setRemoving]  = useState(false);
  const [imgError, setImgError]  = useState(false);
  const [ref, visible]           = useSharedReveal();

  const priceNum  = toNum(item.price ?? item.priceNum);
  const origPrice = toNum(item.originalPrice);
  const hasImg    = item.img && !imgError;
  const grad      = PLACEHOLDER_GRADIENTS[item.id % PLACEHOLDER_GRADIENTS.length];
  const stars     = 3 + (item.id % 3);
  const reviews   = 8 + ((item.id * 13) % 92);

  const handleAddToCart = useCallback(() => {
    addToCart({ id: item.id, name: item.name, price: priceNum, img: item.img, category: item.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [item, priceNum, addToCart]);

  const handleRemove = useCallback(() => {
    setRemoving(true);
    setTimeout(() => removeItem(item.id), 350);
  }, [item.id, removeItem]);

  // Entrance + remove animations via className only (no inline transition strings)
  const animClass = removing
    ? "opacity-0 scale-95 -translate-y-2"
    : visible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-5";

  const animDuration = removing
    ? "transition-[opacity,transform] duration-300 ease-in"
    : `transition-[opacity,transform,box-shadow] duration-500 ease-out`;

  return (
    <article
      ref={ref}
      className={`group relative bg-white border border-gray-100 rounded-2xl overflow-hidden
        flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1
        focus-within:ring-2 focus-within:ring-green-500
        ${animDuration} ${animClass}`}
      style={!visible && !removing && index > 0
        ? { transitionDelay: `${Math.min(index * 60, 240)}ms` }
        : undefined}
    >
      {/* Remove button — filled red heart, always visible */}
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`Remove ${item.name} from wishlist`}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center
          justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700
          scale-110 transition-all duration-200 shadow-sm
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <IconHeart filled />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {item.isDeal && (
          <span className="bg-red-500 text-white text-[10px] font-bold
            px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
            Deal
          </span>
        )}
        {item.isNew && !item.isDeal && (
          <span className="bg-green-600 text-white text-[10px] font-bold
            px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
            New
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0 bg-gray-50 aspect-[4/3]">
        {hasImg ? (
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            // ✅ scale-105 matches Shop/Home (was scale-110 — too aggressive)
            className="w-full h-full object-cover group-hover:scale-105
              transition-transform duration-500 ease-out"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${grad}
            flex items-center justify-center`}>
            <span className="text-5xl opacity-25 select-none" aria-hidden="true">🛍️</span>
          </div>
        )}

        {/* ✅ Category pill ON the image — matches Shop/Home */}
        {item.category && (
          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm
            text-gray-700 text-[10px] font-bold uppercase tracking-wider
            px-2.5 py-1 rounded-full shadow-sm">
            {item.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.description}</p>
        )}

        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < stars ? "text-amber-400" : "text-gray-200"}>
              <IconStar />
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({reviews})</span>
        </div>

        {/* ✅ Price LEFT + compact button RIGHT — matches Shop/Home layout exactly */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-base font-extrabold text-green-700 tabular-nums">
              {formatGHS(priceNum)}
            </span>
            {origPrice > priceNum && (
              <span className="block text-xs text-gray-400 line-through tabular-nums">
                {formatGHS(origPrice)}
              </span>
            )}
          </div>

          {/* ✅ Compact button px-3 py-2 text-xs — matches Shop/Home */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={added ? `${item.name} added` : `Add ${item.name} to cart`}
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
});

// ─── Skeleton — memo'd so it never re-renders ──────────────────────────────────

const WishlistSkeleton = memo(function WishlistSkeleton() {
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
});

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyWishlist() {
  const [ref, visible] = useSharedReveal();
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center py-28 text-center gap-5
        transition-[opacity,transform] duration-600 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-100 animate-ping
          opacity-25 scale-110" aria-hidden="true" />
        <div className="relative w-28 h-28 rounded-full bg-red-50 border-2 border-red-100
          flex items-center justify-center text-red-300">
          <IconHeart filled className="w-12 h-12" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
          Tap the ♥ on any product across Shop, Home, Deals or New Arrivals
          to save it here.
        </p>
      </div>

      <Link
        to="/shop"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
          text-white font-bold px-7 py-3 rounded-xl text-sm transition-all duration-200
          shadow-sm hover:shadow-md active:scale-[0.97]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        Discover products <IconArrowRight />
      </Link>
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────────────────────────────

function WishlistHeader({ count, onClearAll, onShare, shareStatus }) {
  const [ref, visible]          = useSharedReveal();
  const [confirmClear, setConfirm] = useState(false);

  const handleClear = () => {
    if (confirmClear) { onClearAll(); setConfirm(false); }
    else {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
    }
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8
        transition-[opacity,transform] duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div>
        <span className="text-[11px] font-bold text-green-600 uppercase tracking-[0.18em]">
          Saved items
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          My Wishlist
          {count > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          )}
        </h1>
      </div>

      {count > 0 && (
        <div className="flex items-center gap-2">
          <button
            type="button" onClick={onShare}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm
              font-semibold transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
              ${shareStatus === "copied"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700"
              }`}
          >
            {shareStatus === "copied"
              ? <><IconCheck /> Copied!</>
              : <><IconShare /> Share</>
            }
          </button>

          <button
            type="button" onClick={handleClear}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm
              font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2
              ${confirmClear
                ? "border-red-300 bg-red-50 text-red-600 focus-visible:ring-red-400"
                : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-500 focus-visible:ring-gray-400"
              }`}
          >
            <IconTrash />
            {confirmClear ? "Confirm?" : "Clear all"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add-all Banner ────────────────────────────────────────────────────────────

function AddAllBanner({ items, onAddAll, addAllStatus }) {
  const total = items.reduce((s, i) => s + toNum(i.price ?? i.priceNum), 0);
  const [ref, visible] = useSharedReveal();

  return (
    <div
      ref={ref}
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 mb-6
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
        transition-[opacity,transform] duration-500 ease-out delay-100
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">Total value of saved items</p>
        {/* ✅ ₹ — was ₹ */}
        <p className="text-green-700 font-extrabold text-lg tabular-nums mt-0.5">
          {formatGHS(total)}
        </p>
      </div>

      <button
        type="button" onClick={onAddAll}
        disabled={addAllStatus === "added"}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
          transition-all duration-200 active:scale-[0.97] whitespace-nowrap
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1
          ${addAllStatus === "added"
            ? "bg-green-50 text-green-700 border border-green-300 cursor-default"
            : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
          }`}
      >
        {addAllStatus === "added"
          ? <><IconCheck /> All added to cart!</>
          : <><IconCart /> Add all to cart</>
        }
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Wishlist() {
  const { addToCart }                   = useContext(CartContext);
  // ✅ Now correctly reads from WishlistContext — not the old local hook
  const { items, clearAll }             = useWishlist();
  const [addAllStatus, setAddAllStatus] = useState("idle");
  const [shareStatus,  setShareStatus]  = useState("idle");
  const [loading,      setLoading]      = useState(true);

  // Brief skeleton flash on first paint
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const handleAddAll = useCallback(() => {
    items.forEach(item =>
      addToCart({
        id:       item.id,
        name:     item.name,
        price:    toNum(item.price ?? item.priceNum),
        img:      item.img,
        category: item.category,
      })
    );
    setAddAllStatus("added");
    setTimeout(() => setAddAllStatus("idle"), 2200);
  }, [items, addToCart]);

  const handleShare = useCallback(() => {
    const lines = items.map(i =>
      `• ${i.name} — ${formatGHS(toNum(i.price ?? i.priceNum))}`
    ).join("\n");
    const text = `My Wishlist 💚\n\n${lines}\n\nShop at Mensur Enterprises`;
    navigator.clipboard?.writeText(text).then(() => {
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    });
  }, [items]);

  return (
    <main
      className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/"     className="hover:text-green-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-green-600 transition-colors">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700 font-medium">Wishlist</span>
        </nav>

        <WishlistHeader
          count={items.length}
          onClearAll={clearAll}
          onShare={handleShare}
          shareStatus={shareStatus}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <WishlistSkeleton key={i} />)}
          </div>

        ) : items.length === 0 ? (
          <EmptyWishlist />

        ) : (
          <>
            <AddAllBanner
              items={items}
              onAddAll={handleAddAll}
              addAllStatus={addAllStatus}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {items.map((item, i) => (
                <WishlistCard key={item.id} item={item} index={i} />
              ))}
            </div>

            {/* Bottom nav */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between
              gap-4 border-t border-gray-100 pt-8">
              <Link
                to="/shop"
                className="flex items-center gap-1.5 text-sm font-semibold text-green-600
                  hover:text-green-800 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
              >
                <IconArrowLeft /> Continue shopping
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800
                  text-white font-bold px-7 py-3 rounded-xl text-sm
                  transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-700"
              >
                Go to cart <IconArrowRight />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}