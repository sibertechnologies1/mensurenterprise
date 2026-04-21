import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────

const DELIVERY_FEE      = 15;
const FREE_DELIVERY_MIN = 200;

const PAYMENT_METHODS = [
  { id: "cod",  label: "Cash on Delivery", desc: "Pay when your order arrives",         icon: CashIcon     },
  { id: "momo", label: "Mobile Money",     desc: "MTN MoMo, Telecel Cash, AirtelTigo",  icon: MoMoIcon     },
  { id: "wa",   label: "WhatsApp Order",   desc: "We'll confirm payment via WhatsApp",  icon: WhatsAppIcon },
];

// ─── Validation ───────────────────────────────────────────────────────────────

const validate = ({ name, email, phone, address }) => {
  const e = {};
  if (!name.trim())    e.name    = "Full name is required.";
  if (!email.trim())   e.email   = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
  if (!phone.trim())   e.phone   = "Phone number is required.";
  else if (!/^[0-9+\s\-()]{7,15}$/.test(phone))       e.phone = "Enter a valid phone number.";
  if (!address.trim()) e.address = "Delivery address is required.";
  return e;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function CashIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>;
}
function MoMoIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>;
}
function WhatsAppIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.373 0 .04 5.373 0 12c0 2.12.553 4.19 1.6 6.02L0 24l6.12-1.58A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.87 0-3.67-.5-5.24-1.45l-.37-.22-3.64.94.98-3.55-.24-.36A9.46 9.46 0 0 1 2.5 12c0-5.24 4.26-9.5 9.5-9.5 2.54 0 4.92.99 6.7 2.8A9.42 9.42 0 0 1 21.5 12c0 5.24-4.26 9.5-9.5 9.5z"/><path d="M17.5 14.1c-.3-.15-1.8-.9-2.07-1-.27-.1-.47-.15-.67.15-.2.3-.78 1-.95 1.2-.17.2-.33.22-.63.07-1.7-.83-2.8-1.48-3.92-3.36-.3-.5.3-.46.86-1.53.1-.26 0-.5-.05-.65-.05-.17-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.25 5.06 4.6 2.98 1.35 2.98.9 3.52.84.54-.06 1.76-.68 2.01-1.34.25-.66.25-1.22.18-1.34-.07-.12-.27-.2-.57-.35z" fill="#fff"/></svg>;
}
function ShieldIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function TruckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function EmptyBagIcon() {
  return <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

// ─── Progress Steps ───────────────────────────────────────────────────────────

function Steps({ current }) {
  const steps = ["Cart", "Delivery", "Confirmation"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                done   ? "bg-green-600 text-white" :
                active ? "bg-green-600 text-white ring-4 ring-green-100" :
                         "bg-gray-100 text-gray-400"
              }`}>
                {done ? <CheckIcon /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${active || done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mb-5 mx-1 transition-colors ${done ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, id, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400 text-xs">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Payment Selector ─────────────────────────────────────────────────────────

function PaymentSelector({ selected, onSelect }) {
  return (
    <div className="space-y-2.5">
      {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon }) => (
        <button key={id} type="button" onClick={() => onSelect(id)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
            selected === id ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
          }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            selected === id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}><Icon /></div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${selected === id ? "text-green-800" : "text-gray-800"}`}>{label}</p>
            <p className={`text-xs mt-0.5 ${selected === id ? "text-green-600" : "text-gray-400"}`}>{desc}</p>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
            selected === id ? "border-green-500 bg-green-500" : "border-gray-300"
          }`}>
            {selected === id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Order Summary Panel ──────────────────────────────────────────────────────

function OrderSummary({ cart, subtotal, deliveryFee, total, freeDelivery }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sticky top-24">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Order Summary</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {cart.map((item) => {
          const qty       = item.quantity || 1;
          const lineTotal = (item.priceNum || 0) * qty;
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative shrink-0">
                {item.img ? (
                  <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{qty}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-400">₹ {(item.priceNum || 0).toFixed(2)} each</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">₹ {lineTotal.toFixed(2)}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-600"><TruckIcon /> Delivery</span>
          {freeDelivery
            ? <span className="text-green-600 font-semibold">Free</span>
            : <span className="text-gray-700">₹ {deliveryFee.toFixed(2)}</span>}
        </div>
        {!freeDelivery && (
          <p className="text-[11px] text-gray-400 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
            Add ₹ {(FREE_DELIVERY_MIN - subtotal).toFixed(2)} more for free delivery
          </p>
        )}
        {freeDelivery && (
          <p className="text-[11px] text-green-700 font-medium bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5">
            🎉 You qualify for free delivery!
          </p>
        )}
        <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-200 pt-3 mt-2">
          <span>Total</span>
          <span>₹ {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        {[
          { icon: ShieldIcon, text: "Secure checkout — your data is safe" },
          { icon: TruckIcon,  text: "Fast delivery across Ghana"          },
          { icon: LockIcon,   text: "Easy returns within 14 days"         },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-green-500"><Icon /></span>{text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ order }) {
  const orderRef = `ME-${String(order.id).slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-5">
        <Steps current={2} />

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Confirmed! 🎉</h2>
          <p className="text-gray-500 text-sm mt-1">
            Thank you, <span className="font-semibold text-gray-700">{order.name}</span>. Your order has been received.
          </p>
        </div>

        {/* Order reference */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 w-full">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Order Reference</p>
          <p className="text-3xl font-bold text-green-700 mt-1 tracking-widest">{orderRef}</p>
          <p className="text-xs text-green-600 mt-1">Keep this number for tracking your delivery</p>
        </div>

        {/* What happens next */}
        <div className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">What happens next</p>
          <div className="space-y-4">
            {[
              { step: "1", text: `We'll call or WhatsApp you on ${order.phone} to confirm your order.`       },
              { step: "2", text: "Your items will be packed and dispatched within 24 hours."                  },
              { step: "3", text: `Delivery to ${order.address.split(",")[0]} — typically 1–3 business days.` },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Summary</p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity || 1}</span>
                <span className="font-medium text-gray-900">₹ {((item.priceNum || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>₹ {order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? "Free 🎉" : `₹ ${order.deliveryFee?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total paid</span><span>₹ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={`https://api.whatsapp.com/send?phone=0502156703&text=Hi! I just placed order *${orderRef}*. Please confirm.`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            <WhatsAppIcon /> Confirm on WhatsApp
          </a>
          <Link to="/shop"
            className="flex-1 flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-3 rounded-xl text-sm font-semibold transition-colors">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);

  const [fields,        setFields]  = useState({ name: "", email: "", phone: "", address: "", note: "" });
  const [errors,        setErrors]  = useState({});
  const [loading,       setLoading] = useState(false);
  const [paymentMethod, setPayment] = useState("cod");
  const [completedOrder, setOrder]  = useState(null);

  const subtotal     = cart.reduce((s, p) => s + (p.priceNum || 0) * (p.quantity || 1), 0);
  const freeDelivery = subtotal >= FREE_DELIVERY_MIN;
  const deliveryFee  = freeDelivery ? 0 : DELIVERY_FEE;
  const total        = subtotal + deliveryFee;

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const inputCls = (key) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 bg-white text-gray-900 placeholder:text-gray-400 ${
      errors[key]
        ? "border-red-400 focus:border-red-500 bg-red-50/30"
        : "border-gray-200 focus:border-green-500 hover:border-gray-300"
    }`;

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const order = { id: Date.now(), ...fields, paymentMethod, items: cart, subtotal, deliveryFee, total, createdAt: new Date().toISOString() };
      try {
        const orders = JSON.parse(localStorage.getItem("orders") || "[]");
        orders.unshift(order);
        localStorage.setItem("orders",    JSON.stringify(orders));
        localStorage.setItem("lastOrder", JSON.stringify(order));
        window.dispatchEvent(new Event("ordersUpdate"));
      } catch {}
      clearCart();
      try { window.dispatchEvent(new Event("cartUpdate")); } catch {}
      setLoading(false);
      setOrder(order);
    }, 900);
  };

  if (completedOrder) return <SuccessScreen order={completedOrder} />;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-4">
        <div className="text-gray-200"><EmptyBagIcon /></div>
        <p className="font-semibold text-gray-700">Your cart is empty</p>
        <p className="text-sm text-gray-400">Add items before checking out.</p>
        <Link to="/shop" className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">Browse shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <Steps current={1} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Step 2 of 3</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Delivery Details</h1>
          </div>
          <Link to="/cart" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">← Back to cart</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8 items-start">

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="lg:col-span-3 space-y-5">

            {/* Delivery info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-1">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Delivery Information</h2>
              </div>

              <Field label="Full name" id="name" error={errors.name} required>
                <input id="name" type="text" value={fields.name} onChange={set("name")}
                  placeholder="e.g. Kwame Mensah" disabled={loading} className={inputCls("name")} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email address" id="email" error={errors.email} required>
                  <input id="email" type="email" value={fields.email} onChange={set("email")}
                    placeholder="you@example.com" disabled={loading} className={inputCls("email")} />
                </Field>
                <Field label="Phone number" id="phone" error={errors.phone} required>
                  <input id="phone" type="tel" value={fields.phone} onChange={set("phone")}
                    placeholder="0502156703" disabled={loading} className={inputCls("phone")} />
                </Field>
              </div>

              <Field label="Delivery address" id="address" error={errors.address} required>
                <textarea id="address" value={fields.address} onChange={set("address")}
                  placeholder="Street, area, city, region…" rows={2} disabled={loading}
                  className={`${inputCls("address")} resize-none`} />
              </Field>

              <Field label="Delivery note (optional)" id="note">
                <input id="note" type="text" value={fields.note} onChange={set("note")}
                  placeholder="E.g. Ring the gate bell, leave with security…"
                  disabled={loading} className={inputCls("note")} />
              </Field>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Payment Method</h2>
              </div>
              <PaymentSelector selected={paymentMethod} onSelect={setPayment} />
            </div>

            {/* Submit */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Processing your order…
                  </>
                ) : `Place order — ₹ ${total.toFixed(2)}`}
              </button>

              <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
                {[{ icon: LockIcon, text: "SSL Secured" }, { icon: ShieldIcon, text: "Safe Checkout" }, { icon: TruckIcon, text: "Fast Delivery" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="text-green-500"><Icon /></span>{text}
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <OrderSummary cart={cart} subtotal={subtotal} deliveryFee={deliveryFee} total={total} freeDelivery={freeDelivery} />
          </div>
        </div>
      </div>
    </div>
  );
}