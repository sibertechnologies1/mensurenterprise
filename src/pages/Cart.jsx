import React, { useContext, useState, useRef, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Requires in index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toNum(price) {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  return 0;
}

function formatINR(price) {
  const n = toNum(price);
  return `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Scroll reveal hook ────────────────────────────────────────────────────────

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

const IconTrash = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const IconBag = () => (
  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6"/>
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

const IconShield = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconTruck = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const IconTag = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconBrokenImage = () => (
  <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

// ─── Cart Item Image ───────────────────────────────────────────────────────────

function CartItemImage({ src, alt }) {
  const [errored, setErrored] = useState(false);
  if (errored || !src) {
    return (
      <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <IconBrokenImage />
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt} loading="lazy"
      onError={() => setErrored(true)}
      className="w-24 h-24 object-cover rounded-xl shrink-0 bg-gray-100"
    />
  );
}

// ─── Single Cart Row ───────────────────────────────────────────────────────────

function CartRow({ item, index }) {
  const { removeFromCart, updateQuantity } = useContext(CartContext);
  const [removing, setRemoving] = useState(false);
  const [ref, visible] = useReveal(0.05);

  const qty      = item.quantity || 1;
  const price    = toNum(item.price ?? item.priceNum);
  const lineTotal = price * qty;

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(item.id), 320);
  };

  return (
    <div
      ref={ref}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm
        hover:shadow-lg hover:border-green-100 transition-all duration-300"
      style={{
        opacity:    removing ? 0 : visible ? 1 : 0,
        transform:  removing ? "translateX(40px)" : visible ? "translateY(0)" : "translateY(20px)",
        transition: removing
          ? "opacity 0.3s ease, transform 0.3s ease"
          : `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms, box-shadow 0.3s ease`,
      }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Image */}
        <CartItemImage src={item.img} alt={item.name} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {item.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
              {item.category}
            </span>
          )}
          <p className="font-semibold text-gray-900 text-sm leading-snug mt-0.5 line-clamp-2">
            {item.name}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatINR(price)} each</p>

          {/* Quantity controls */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, Math.max(1, qty - 1))}
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200
                text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700
                disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200
                text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-800 tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, qty + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200
                text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700
                transition-all duration-200 text-base font-semibold
                focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              +
            </button>
          </div>
        </div>

        {/* Line total + remove */}
        <div className="flex flex-col items-end gap-3 shrink-0 pl-2">
          <span className="text-green-700 font-extrabold text-base tabular-nums">
            {formatINR(lineTotal)}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${item.name}`}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600
              hover:bg-red-50 px-2.5 py-1.5 rounded-xl border border-transparent
              hover:border-red-100 transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <IconTrash /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Summary Card ────────────────────────────────────────────────────────

function OrderSummary({ cart, total }) {
  const [coupon,       setCoupon]       = useState("");
  const [couponStatus, setCouponStatus] = useState("idle"); // idle | applied | error
  const [confirmClear, setConfirmClear] = useState(false);
  const { clearCart } = useContext(CartContext);
  const [ref, visible] = useReveal(0.05);

  const VALID_COUPON = "INDIA10";
  const discount     = couponStatus === "applied" ? total * 0.10 : 0;
  const shipping     = total >= 5000 ? 0 : 199;
  const grandTotal   = total - discount + shipping;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === VALID_COUPON) {
      setCouponStatus("applied");
    } else {
      setCouponStatus("error");
      setTimeout(() => setCouponStatus("idle"), 2500);
    }
  };

  const handleClear = () => {
    if (confirmClear) {
      clearCart();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden
        sticky top-6"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
      }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-base">Order Summary</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="px-6 py-5 space-y-3">
        {/* Line items */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900 tabular-nums">{formatINR(total)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium flex items-center gap-1">
              <IconTag /> Coupon (10% off)
            </span>
            <span className="font-semibold text-green-600 tabular-nums">−{formatINR(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <IconTruck />
            Shipping
          </span>
          {shipping === 0
            ? <span className="font-semibold text-green-600">Free</span>
            : <span className="font-semibold text-gray-900 tabular-nums">{formatINR(shipping)}</span>
          }
        </div>

        {shipping > 0 && (
          <p className="text-[11px] text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            Add {formatINR(5000 - total)} more for free shipping
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-green-700 font-extrabold text-xl tabular-nums">
              {formatINR(grandTotal)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>
        </div>
      </div>

      {/* Coupon */}
      <div className="px-6 pb-5">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <IconTag />
            </div>
            <input
              type="text"
              value={coupon}
              onChange={e => { setCoupon(e.target.value); setCouponStatus("idle"); }}
              onKeyDown={e => e.key === "Enter" && applyCoupon()}
              placeholder="Coupon code"
              disabled={couponStatus === "applied"}
              className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-colors
                focus:outline-none focus:ring-1
                ${couponStatus === "applied"
                  ? "bg-green-50 border-green-300 text-green-700"
                  : couponStatus === "error"
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                    : "border-gray-200 focus:border-green-500 focus:ring-green-500"
                }`}
            />
          </div>
          {couponStatus === "applied" ? (
            <span className="flex items-center gap-1 text-green-600 text-xs font-bold px-3 py-2.5
              bg-green-50 border border-green-200 rounded-xl whitespace-nowrap">
              <IconCheck /> Applied
            </span>
          ) : (
            <button
              type="button"
              onClick={applyCoupon}
              className="px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold
                rounded-xl transition-colors whitespace-nowrap
                focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-700"
            >
              Apply
            </button>
          )}
        </div>
        {couponStatus === "error" && (
          <p className="text-red-500 text-xs mt-1.5 ml-1">Invalid coupon code. Try INDIA10.</p>
        )}
      </div>

      {/* CTAs */}
      <div className="px-6 pb-6 space-y-3">
        <Link
          to="/checkout"
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-600
            hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-sm
            hover:shadow-md transition-all duration-200 active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1"
        >
          Proceed to Checkout <IconArrowRight />
        </Link>

        <button
          type="button"
          onClick={handleClear}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200
            focus:outline-none focus-visible:ring-2
            ${confirmClear
              ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-400"
              : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus-visible:ring-gray-400"
            }`}
        >
          {confirmClear ? "Tap again to clear cart" : "Clear cart"}
        </button>
      </div>

      {/* Trust badges */}
      <div className="px-6 pb-6 space-y-2.5 border-t border-gray-100 pt-5">
        {[
          { icon: <IconShield />, text: "100% secure & encrypted checkout" },
          { icon: <IconTruck />,  text: "Free delivery on orders over ₹ 5,000" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-xs text-gray-500">
            <span className="text-green-500 shrink-0">{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyCart() {
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
      {/* Decorative ring */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-green-50 border-2 border-green-100
          flex items-center justify-center text-green-300">
          <IconBag />
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 rounded-full
          flex items-center justify-center text-xs font-bold text-gray-500">
          0
        </span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
          Looks like you haven't added anything yet. Browse our collection and find something you love.
        </p>
      </div>

      <Link
        to="/shop"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
          text-white font-bold px-7 py-3 rounded-xl text-sm transition-all duration-200
          shadow-sm hover:shadow-md active:scale-[0.97]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        Browse Shop <IconArrowRight />
      </Link>

      {/* Trust line */}
      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <IconShield />
        Secure payments · Free returns
      </p>
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────────────────────────────

function CartHeader({ count }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div
      ref={ref}
      className="flex items-center justify-between mb-8"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "none" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div>
        <span className="text-[11px] font-bold text-green-600 uppercase tracking-[0.18em]">
          Your selection
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Shopping Cart
          {count > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          )}
        </h1>
      </div>
      <Link
        to="/shop"
        className="flex items-center gap-1.5 text-sm font-semibold text-green-600
          hover:text-green-800 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
      >
        <IconArrowLeft /> Continue shopping
      </Link>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Cart() {
  const { cart } = useContext(CartContext);

  const total = cart.reduce((sum, item) => {
    const price = toNum(item.price ?? item.priceNum);
    return sum + price * (item.quantity || 1);
  }, 0);

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
          <span className="text-gray-700 font-medium">Cart</span>
        </nav>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <CartHeader count={cart.length} />

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* Left — cart rows */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                {cart.map((item, i) => (
                  <CartRow key={item.id} item={item} index={i} />
                ))}
              </div>

              {/* Right — order summary */}
              <div className="lg:col-span-1">
                <OrderSummary cart={cart} total={total} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}