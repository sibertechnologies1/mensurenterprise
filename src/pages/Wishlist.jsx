import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Requires in index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
//
// This component manages its own wishlist state via localStorage key "wishlist".
// To share wishlist state app-wide, lift it into a WishlistContext (same pattern
// as CartContext) and replace the local useWishlist hook with that context.

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toNum(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

function formatINR(price) {
  const n = toNum(price);
  return `₹ ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Wishlist hook (localStorage-backed) ──────────────────────────────────────

function useWishlist() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const save = (next) => {
    setItems(next);
    try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
  };

  const removeItem  = useCallback((id) => save(items.filter(i => i.id !== id)), [items]);
  const clearAll    = useCallback(() => save([]), []);
  const hasItem     = useCallback((id) => items.some(i => i.id === id), [items]);

  return { items, removeItem, clearAll, hasItem };
}

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────

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

const IconHeart = ({ filled, className = "w-5 h-5" }) => (
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
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
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

const IconBrokenImage = () => (
  <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const IconStar = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// ─── Product Image with fallback ───────────────────────────────────────────────

function ProductImage({ src, alt }) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100
        flex items-center justify-center">
        <IconBrokenImage />
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt} loading="lazy"
      onError={() => setErrored(true)}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
  );
}

// ─── Wishlist Card ─────────────────────────────────────────────────────────────

const GRADS = [
  "from-green-50 to-emerald-100",
  "from-sky-50 to-blue-100",
  "from-amber-50 to-orange-100",
  "from-violet-50 to-purple-100",
];

function WishlistCard({ item, index, onRemove }) {
  const { addToCart }           = useContext(CartContext);
  const [added,    setAdded]    = useState(false);
  const [removing, setRemoving] = useState(false);
  const [ref, visible]          = useReveal(0.05);

  const priceNum     = toNum(item.price ?? item.priceNum);
  const stars        = 3 + (item.id % 3);
  const reviews      = 8 + ((item.id * 13) % 92);

  const handleAddToCart = () => {
    addToCart({ id: item.id, name: item.name, price: priceNum, img: item.img, category: item.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 350);
  };

  return (
    <article
      ref={ref}
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden
        flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1.5
        focus-within:ring-2 focus-within:ring-green-500"
      style={{
        opacity:    removing ? 0 : visible ? 1 : 0,
        transform:  removing
          ? "scale(0.92) translateY(-8px)"
          : visible ? "translateY(0)" : "translateY(24px)",
        transition: removing
          ? "opacity 0.35s ease, transform 0.35s ease"
          : `opacity 0.6s ease ${index * 70}ms, transform 0.6s ease ${index * 70}ms, box-shadow 0.3s ease`,
      }}
    >
      {/* Remove from wishlist */}
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`Remove ${item.name} from wishlist`}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center
          justify-center bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600
          transition-all duration-200 shadow-sm
          focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <IconHeart filled className="w-4 h-4" />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {item.isDeal && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5
            rounded-full tracking-wide shadow">DEAL</span>
        )}
        {item.isNew && !item.isDeal && (
          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5
            rounded-full tracking-wide shadow">NEW</span>
        )}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3] flex-shrink-0">
        <ProductImage src={item.img} alt={item.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true"/>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {item.category && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">
            {item.category}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {item.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < stars ? "text-amber-400" : "text-gray-200"}>
              <IconStar />
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto mb-4">
          <span className="text-green-700 font-extrabold text-base tabular-nums">
            {formatINR(priceNum)}
          </span>
          {item.originalPrice && toNum(item.originalPrice) > priceNum && (
            <span className="text-gray-400 text-xs line-through tabular-nums">
              {formatINR(item.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to cart CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`Add ${item.name} to cart`}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            text-sm font-semibold transition-all duration-200 active:scale-[0.97]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1
            ${added
              ? "bg-green-50 text-green-700 border border-green-300 cursor-default"
              : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
            }`}
        >
          {added ? <><IconCheck /> Added to cart!</> : <><IconCart /> Add to cart</>}
        </button>
      </div>
    </article>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse shadow-sm">
      <div className="bg-gray-200 aspect-[4/3]" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-2/5 mt-1" />
        <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="h-10 bg-gray-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyWishlist() {
  const [ref, visible] = useReveal(0.1);
  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center py-28 text-center gap-5"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Decorative pulsing ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-30
          scale-110" aria-hidden="true" />
        <div className="relative w-32 h-32 rounded-full bg-red-50 border-2 border-red-100
          flex items-center justify-center text-red-300">
          <IconHeart filled className="w-14 h-14" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
          Save items you love by tapping the heart icon on any product. They'll all appear here.
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
  const [ref, visible] = useReveal(0.1);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div
      ref={ref}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
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
          {/* Share button */}
          <button
            type="button"
            onClick={onShare}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold
              transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
              ${shareStatus === "copied"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700"
              }`}
          >
            {shareStatus === "copied" ? <><IconCheck /> Copied!</> : <><IconShare /> Share</>}
          </button>

          {/* Clear all */}
          <button
            type="button"
            onClick={handleClear}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold
              transition-all duration-200 focus:outline-none focus-visible:ring-2
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

// ─── Add-all-to-cart Banner ────────────────────────────────────────────────────

function AddAllBanner({ items, onAddAll, addAllStatus }) {
  const total = items.reduce((s, i) => s + toNum(i.price ?? i.priceNum), 0);
  const [ref, visible] = useReveal(0.05);

  return (
    <div
      ref={ref}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 mb-6
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(12px)",
        transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
      }}
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Total value of saved items
        </p>
        <p className="text-green-700 font-extrabold text-lg tabular-nums mt-0.5">
          {formatINR(total)}
        </p>
      </div>

      <button
        type="button"
        onClick={onAddAll}
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Wishlist() {
  const { addToCart }                   = useContext(CartContext);
  const { items, removeItem, clearAll } = useWishlist();
  const [addAllStatus, setAddAllStatus] = useState("idle");
  const [shareStatus,  setShareStatus]  = useState("idle");
  const [loading,      setLoading]      = useState(true);

  // Brief artificial load so skeletons show on first paint
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const handleAddAll = () => {
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
  };

  const handleShare = () => {
    const text = items.map(i => `• ${i.name} — ${formatINR(toNum(i.price ?? i.priceNum))}`).join("\n");
    const shareText = `My Wishlist 💚\n\n${text}\n\nShop at Mensur Enterprises`;
    navigator.clipboard?.writeText(shareText).then(() => {
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    });
  };

  return (
    <main
      className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-green-600 transition-colors">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700 font-medium">Wishlist</span>
        </nav>

        {/* Header */}
        <WishlistHeader
          count={items.length}
          onClearAll={clearAll}
          onShare={handleShare}
          shareStatus={shareStatus}
        />

        {loading ? (
          /* Skeleton grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <WishlistSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Add-all banner */}
            <AddAllBanner
              items={items}
              onAddAll={handleAddAll}
              addAllStatus={addAllStatus}
            />

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {items.map((item, i) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  index={i}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between
              gap-4 border-t border-gray-200 pt-8">
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
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700
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