import { useState, useContext, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

const IconMenu = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconX = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M6 6l12 12M6 18L18 6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconCart = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="11" cy="11" r="6" strokeWidth="2" />
    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconChevronDown = ({ open }) => (
  <svg
    className="w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"
  >
    <path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconWhatsApp = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.92 11.92 0 0012 0C5.373 0 .04 5.373 0 12c0 2.12.553 4.19 1.6 6.02L0 24l6.12-1.58A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.87 0-3.67-.5-5.24-1.45l-.37-.22-3.64.94.98-3.55-.24-.36A9.46 9.46 0 012.5 12c0-5.24 4.26-9.5 9.5-9.5 2.54 0 4.92.99 6.7 2.8A9.42 9.42 0 0121.5 12c0 5.24-4.26 9.5-9.5 9.5z" />
    <path d="M17.5 14.1c-.3-.15-1.8-.9-2.07-1-.27-.1-.47-.15-.67.15-.2.3-.78 1-.95 1.2-.17.2-.33.22-.63.07-1.7-.83-2.8-1.48-3.92-3.36-.3-.5.3-.46.86-1.53.1-.26 0-.5-.05-.65-.05-.17-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.25 5.06 4.6 2.98 1.35 2.98.9 3.52.84.54-.06 1.76-.68 2.01-1.34.25-.66.25-1.22.18-1.34-.07-.12-.27-.2-.57-.35z" fill="#fff" />
  </svg>
);
const IconHeart = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconPackage = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

const CATEGORIES = [
  { label: "Shoes",       path: "shoes"       },
  { label: "Clothing",    path: "clothing"    },
  { label: "Accessories", path: "accessories" },
  { label: "Watches",     path: "watches"     },
  { label: "Bags",        path: "bags"        },
];

const NAV_LINKS = [
  { to: "/shop",  label: "Shop"         },
  { to: "/deals", label: "Deals"        },
  { to: "/new",   label: "New Arrivals" },
];

function IconBtn({ as: Tag = "button", className = "", children, ...props }) {
  return (
    <Tag
      className={`relative flex items-center justify-center rounded-lg
        w-11 h-11 sm:w-9 sm:h-9 text-gray-500
        hover:bg-gray-100 hover:text-gray-900
        transition-colors duration-150 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-green-500
        focus-visible:ring-offset-1 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white
      text-[9px] font-bold min-w-[16px] h-4 px-0.5
      rounded-full flex items-center justify-center leading-none ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavLink({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative px-3.5 py-2 rounded-lg text-sm transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
        ${active
          ? "text-green-700 font-semibold bg-green-50"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-600" />
      )}
    </Link>
  );
}

function SearchBar({ className = "", inputId = "search", onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 bg-gray-50
      border border-gray-200 rounded-lg px-3 py-2
      focus-within:border-green-500 focus-within:bg-white
      transition-all duration-150 ${className}`}>
      <label htmlFor={inputId} className="sr-only">Search products</label>
      <IconSearch />
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        autoComplete="off"
        className="bg-transparent outline-none text-sm text-gray-900
          placeholder:text-gray-400 w-full min-w-0"
      />
      {query && (
        <button type="submit" className="text-xs text-green-600 font-medium shrink-0 hover:text-green-700">
          Go
        </button>
      )}
    </form>
  );
}

function AccountMenu({ currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const displayName = currentUser?.name || currentUser?.email || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg
          hover:bg-gray-50 transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
      >
        <div className="w-7 h-7 rounded-full bg-green-100 text-green-700
          flex items-center justify-center text-xs font-semibold shrink-0">
          {initials}
        </div>
        <span className="text-sm text-gray-700 max-w-[80px] truncate hidden lg:block">
          {currentUser?.name?.split(" ")[0] || "Account"}
        </span>
        <IconChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 bg-white border
          border-gray-100 rounded-xl shadow-xl w-48 p-1.5 z-50">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-[11px] text-gray-400 truncate">{currentUser?.email}</p>
          </div>
          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
              text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-100"
          >
            <IconPackage /> My orders
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
              text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-100"
          >
            <IconHeart /> Wishlist
          </Link>
          <div className="h-px bg-gray-100 my-1" />
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md
              text-sm text-red-500 hover:bg-red-50 transition-colors duration-100"
          >
            <IconLogout /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const Navbar = () => {
  const [menuOpen,      setMenuOpen]  = useState(false);
  const [dropdown,      setDropdown]  = useState(false);
  const [mobileCatOpen, setMobileCat] = useState(false);
  const [bannerVisible, setBanner]    = useState(true);

  const { cart }                                 = useContext(CartContext);
  const { currentUser, logout, isAuthenticated } = useContext(AuthContext);
  const cartCount = cart?.length ?? 0;

  const ddRef      = useRef(null);
  const menuBtnRef = useRef(null);
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  useEffect(() => {
    const onPointer = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDropdown(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") { setDropdown(false); setMenuOpen(false); }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileCat(false);
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu    = useCallback(() => setMenuOpen(false), []);
  const handleLogout = useCallback(() => { logout(); navigate("/"); }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-50">

      {/* Announcement bar */}
      {bannerVisible && (
        <div className="bg-green-700 text-white text-xs text-center py-2 px-8 flex items-center justify-center gap-2 relative">
          <span>Free delivery on orders over ₹ 200 —</span>
          <Link to="/shop" className="underline font-semibold hover:text-green-100 transition-colors">
            Shop now
          </Link>
          <button
            type="button"
            onClick={() => setBanner(false)}
            aria-label="Dismiss"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
          >
            <IconX />
          </button>
        </div>
      )}

      <nav role="navigation" aria-label="Main navigation"
        className="bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" aria-label="Mensur Enterprises homepage"
            className="flex items-baseline gap-0 shrink-0 focus:outline-none
              focus-visible:ring-2 focus-visible:ring-green-500 rounded">
            <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">Mensur</span>
            <span className="text-lg sm:text-xl font-semibold text-green-600 tracking-tight">Enterprises</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} label={label} />
            ))}

            {/* Categories dropdown */}
            <div className="relative" ref={ddRef}>
              <button type="button" onClick={() => setDropdown((v) => !v)}
                aria-haspopup="true" aria-expanded={dropdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm
                  text-gray-500 hover:bg-gray-50 hover:text-gray-900
                  transition-colors duration-150 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-green-500">
                Categories <IconChevronDown open={dropdown} />
              </button>

              {dropdown && (
                <div role="menu" className="absolute top-[calc(100%+6px)] left-0 bg-white border
                  border-gray-100 rounded-xl shadow-xl w-48 p-1.5">
                  <Link to="/shop" role="menuitem" onClick={() => setDropdown(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-800
                      hover:bg-green-50 hover:text-green-700 transition-colors duration-100
                      border-b border-gray-100 mb-1">
                    All products
                  </Link>
                  {CATEGORIES.map(({ label, path }) => (
                    <Link key={path} to={`/shop?category=${path}`} role="menuitem"
                      onClick={() => setDropdown(false)}
                      className="block px-3 py-2 rounded-md text-sm text-gray-600
                        hover:bg-green-50 hover:text-green-700 transition-colors duration-100">
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <SearchBar inputId="desktop-search"
            className="hidden md:flex flex-1 max-w-[220px] lg:max-w-[280px]" />

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-0.5">
            <IconBtn as="a" href="https://api.whatsapp.com/send?phone=0502156703"
              target="_blank" rel="noopener noreferrer"
              aria-label="Chat on WhatsApp" title="WhatsApp">
              <span className="text-green-500"><IconWhatsApp /></span>
            </IconBtn>

            <IconBtn as={Link} to="/wishlist" aria-label="Wishlist" title="Wishlist">
              <IconHeart />
            </IconBtn>

            <IconBtn as={Link} to="/cart"
              aria-label={`Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`} title="Cart">
              <IconCart />
              <Badge count={cartCount} />
            </IconBtn>

            <div className="w-px h-5 bg-gray-200 mx-1.5" aria-hidden="true" />

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg text-sm text-gray-600
                  hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150">
                  Login
                </Link>
                <Link to="/signup" className="ml-1 px-3.5 py-2 rounded-lg text-sm text-white
                  bg-green-600 hover:bg-green-700 font-medium transition-colors duration-150">
                  Sign up
                </Link>
              </>
            ) : (
              <AccountMenu currentUser={currentUser} onLogout={handleLogout} />
            )}
          </div>

          {/* Mobile right cluster */}
          <div className="flex md:hidden items-center gap-1">
            <IconBtn as={Link} to="/wishlist" aria-label="Wishlist">
              <IconHeart />
            </IconBtn>
            <IconBtn as={Link} to="/cart" aria-label={`Cart, ${cartCount} items`}>
              <IconCart />
              <Badge count={cartCount} />
            </IconBtn>
            <button ref={menuBtnRef} type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen} aria-controls="mobile-menu"
              className="w-11 h-11 rounded-lg flex items-center justify-center
                text-gray-700 hover:bg-gray-100 transition-colors duration-150">
              {menuOpen ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100
            ${menuOpen ? "max-h-[calc(100vh-60px)] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
          <div className="px-4 py-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-60px)] bg-white">

            <SearchBar inputId="mobile-search" className="mb-2" onClose={closeMenu} />

            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} label={label} onClick={closeMenu} />
            ))}

            <div>
              <button type="button" onClick={() => setMobileCat((v) => !v)}
                aria-expanded={mobileCatOpen}
                className="flex items-center justify-between w-full px-3.5 py-2.5
                  rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors duration-150">
                <span>Categories</span>
                <IconChevronDown open={mobileCatOpen} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ease-in-out
                ${mobileCatOpen ? "max-h-72" : "max-h-0"}`}>
                <div className="pt-1 pl-4 flex flex-col gap-0.5">
                  <Link to="/shop" onClick={closeMenu}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium
                      text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-100">
                    All products
                  </Link>
                  {CATEGORIES.map(({ label, path }) => (
                    <Link key={path} to={`/shop?category=${path}`} onClick={closeMenu}
                      className="block px-3 py-2.5 rounded-lg text-sm text-gray-500
                        hover:bg-green-50 hover:text-green-700 transition-colors duration-100">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-1" />

            <a href="https://api.whatsapp.com/send?phone=0502156703"
              target="_blank" rel="noopener noreferrer" onClick={closeMenu}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm
                text-gray-600 hover:bg-gray-50 transition-colors duration-150">
              <span className="text-green-500"><IconWhatsApp /></span>
              Chat on WhatsApp
            </a>

            {isAuthenticated && (
              <Link to="/orders" onClick={closeMenu}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm
                  text-gray-600 hover:bg-gray-50 transition-colors duration-150">
                <span className="text-gray-400"><IconPackage /></span>
                My orders
              </Link>
            )}

            <div className="h-px bg-gray-100 my-1" />

            {!isAuthenticated ? (
              <div className="flex gap-2 pt-1 pb-2">
                <Link to="/login" onClick={closeMenu}
                  className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm
                    border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-150">
                  Login
                </Link>
                <Link to="/signup" onClick={closeMenu}
                  className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm
                    text-white bg-green-600 hover:bg-green-700 font-medium transition-colors duration-150">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                    {currentUser?.name || "Account"}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[180px]">
                    {currentUser?.email}
                  </p>
                </div>
                <button type="button" onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                    text-red-500 hover:bg-red-50 transition-colors duration-150">
                  <IconLogout /> Sign out
                </button>
              </div>
            )}

            <div className="pb-4" />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;