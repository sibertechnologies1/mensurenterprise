import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ─── NOTE ──────────────────────────────────────────────────────────────────────
// Add this to your index.html <head> for the Sora font:
// <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// ─── Category Data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "shoes",
    label: "Shoes",
    tagline: "Walk with confidence",
    color: "#16a34a",
    lightColor: "#f0fdf4",
    accent: "#bbf7d0",
    icon: "👟",
    subcategories: [
      { label: "Sneakers",    icon: "👟", path: "sneakers",  tag: "Trending"  },
      { label: "Boots",       icon: "🥾", path: "boots",     tag: null        },
      { label: "Sandals",     icon: "🩴", path: "sandals",   tag: "Summer"    },
      { label: "Formal",      icon: "👞", path: "formal",    tag: null        },
    ],
  },
  {
    id: "clothing",
    label: "Clothing",
    tagline: "Dress your story",
    color: "#0284c7",
    lightColor: "#f0f9ff",
    accent: "#bae6fd",
    icon: "👕",
    subcategories: [
      { label: "T-Shirts",   icon: "👕", path: "t-shirts",   tag: "Bestseller" },
      { label: "Jeans",      icon: "👖", path: "jeans",      tag: null          },
      { label: "Jackets",    icon: "🧥", path: "jackets",    tag: "New"         },
      { label: "Activewear", icon: "🩱", path: "activewear", tag: null          },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    tagline: "Details that define you",
    color: "#d97706",
    lightColor: "#fffbeb",
    accent: "#fde68a",
    icon: "🕶️",
    subcategories: [
      { label: "Hats",       icon: "🧢", path: "hats",       tag: null  },
      { label: "Belts",      icon: "🪢", path: "belts",      tag: null  },
      { label: "Sunglasses", icon: "🕶️", path: "sunglasses", tag: "Hot" },
      { label: "Scarves",    icon: "🧣", path: "scarves",    tag: null  },
    ],
  },
  {
    id: "watches",
    label: "Watches",
    tagline: "Time, elevated",
    color: "#7c3aed",
    lightColor: "#faf5ff",
    accent: "#ddd6fe",
    icon: "⌚",
    subcategories: [
      { label: "Sports",       icon: "🏃", path: "sports",       tag: null      },
      { label: "Digital",      icon: "📟", path: "digital",      tag: null      },
      { label: "Luxury",       icon: "💎", path: "luxury",       tag: "Premium" },
      { label: "Smartwatches", icon: "⌚", path: "smartwatches", tag: "New"     },
    ],
  },
  {
    id: "bags",
    label: "Bags",
    tagline: "Carry what matters",
    color: "#db2777",
    lightColor: "#fdf2f8",
    accent: "#fbcfe8",
    icon: "👜",
    subcategories: [
      { label: "Backpacks", icon: "🎒", path: "backpacks", tag: "Trending" },
      { label: "Handbags",  icon: "👜", path: "handbags",  tag: null       },
      { label: "Crossbody", icon: "👝", path: "crossbody", tag: null       },
      { label: "Travel",    icon: "🧳", path: "travel",    tag: null       },
    ],
  },
];

// ─── Icons ─────────────────────────────────────────────────────────────────────

const ArrowRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// ─── Sub-components ────────────────────────────────────────────────────────────

function SubChip({ sub, catId, color, lightColor, accent }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/categories/${catId}?sub=${sub.path}`}
      aria-label={`Browse ${sub.label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-between gap-2 rounded-xl px-4 py-3
        border transition-all duration-200 overflow-hidden group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{
        borderColor:        hovered ? color    : accent,
        backgroundColor:    hovered ? color    : lightColor,
        "--tw-ring-color":  color,
      }}
    >
      <span className="flex items-center gap-2.5">
        <span className="text-lg leading-none" aria-hidden="true">{sub.icon}</span>
        <span
          className="text-sm font-semibold transition-colors duration-200"
          style={{ color: hovered ? "#fff" : "#1f2937" }}
        >
          {sub.label}
        </span>
        {sub.tag && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full transition-all duration-200"
            style={{
              backgroundColor: hovered ? "rgba(255,255,255,0.25)" : accent,
              color:            hovered ? "#fff"                   : color,
            }}
          >
            {sub.tag}
          </span>
        )}
      </span>
      <span style={{ color: hovered ? "#fff" : "#9ca3af" }} className="transition-colors duration-200">
        <ChevronRight />
      </span>
    </Link>
  );
}

function CategoryCard({ cat, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm
        hover:shadow-xl transition-all duration-700"
      style={{
        opacity:          visible ? 1 : 0,
        transform:        visible ? "translateY(0)" : "translateY(28px)",
        transitionDelay:  `${index * 90}ms`,
      }}
    >
      {/* Coloured header */}
      <div className="relative px-6 pt-7 pb-6 overflow-hidden" style={{ backgroundColor: cat.lightColor }}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-20"
          style={{ backgroundColor: cat.color }} aria-hidden="true" />
        <div className="absolute bottom-0 right-6 w-14 h-14 rounded-full opacity-10"
          style={{ backgroundColor: cat.color }} aria-hidden="true" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm"
              style={{ backgroundColor: cat.accent }}
              aria-hidden="true"
            >
              {cat.icon}
            </div>
            <h2 className="text-xl font-bold leading-tight" style={{ color: cat.color }}>
              {cat.label}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{cat.tagline}</p>
          </div>
          <span
            className="flex-shrink-0 mt-1 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: cat.accent, color: cat.color }}
          >
            {cat.subcategories.length} types
          </span>
        </div>
      </div>

      {/* Subcategory chips */}
      <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cat.subcategories.map(sub => (
          <SubChip
            key={sub.path}
            sub={sub}
            catId={cat.id}
            color={cat.color}
            lightColor={cat.lightColor}
            accent={cat.accent}
          />
        ))}
      </div>

      {/* View All button */}
      <div className="px-5 pb-5">
        <Link
          to={`/categories/${cat.id}`}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold
            border-2 transition-all duration-200 active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor:       cat.color,
            backgroundColor:   btnHovered ? cat.color       : "transparent",
            color:             btnHovered ? "#fff"          : cat.color,
            "--tw-ring-color": cat.color,
          }}
        >
          View all {cat.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

function HeroStrip() {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 50%, #16a34a 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, #7c3aed 0%, transparent 45%),
            radial-gradient(ellipse at 65% 85%, #db2777 0%, transparent 45%)
          `,
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <p className="text-green-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">
          Mensur Enterprises
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-5 leading-[1.1]">
          Shop by Category
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed">
          From everyday essentials to premium statement pieces — explore our
          curated collections and find exactly what you need.
        </p>

        {/* Quick-jump pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5" role="list" aria-label="Jump to category">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/categories/${cat.id}`}
              role="listitem"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                text-white border border-white/20 hover:border-white/70 hover:scale-105
                backdrop-blur-sm transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BottomCTA() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-4">
      <div className="relative rounded-3xl overflow-hidden bg-green-600 px-8 py-14 text-center shadow-2xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-16 -right-8 w-64 h-64 rounded-full bg-black/10"  aria-hidden="true" />
        <div className="relative z-10">
          <p className="text-green-200 text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Can't decide?
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Browse everything at once
          </h2>
          <p className="text-green-100 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Our full shop has every product from every category — with smart filters
            to help you find it fast.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold text-sm
                px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors duration-150 shadow-lg
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                focus-visible:ring-offset-2 focus-visible:ring-offset-green-600"
            >
              Shop All Products <ArrowRight />
            </Link>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 text-white font-semibold text-sm
                px-8 py-3.5 rounded-xl border-2 border-white/40 hover:border-white
                transition-colors duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Categories() {
  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: "'Sora', sans-serif" }}>

      <HeroStrip />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-700 font-medium">Categories</span>
          </nav>
        </div>
      </div>

      {/* Section header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Collections</h2>
            <p className="text-sm text-gray-400 mt-1">
              {CATEGORIES.length} categories &middot; {CATEGORIES.reduce((a, c) => a + c.subcategories.length, 0)} subcategories
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold
              text-green-600 hover:text-green-800 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Cards grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </div>

      <BottomCTA />
    </main>
  );
}