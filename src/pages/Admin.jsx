import React, { useEffect, useState, useRef } from "react";

// Utility to convert file to data URL
function toDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptySlides = [];

export default function Admin() {
  const [slides, setSlides] = useState(emptySlides);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const dragIndex = useRef(null);

  // Products management
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("slides"); // slides | products | orders
  const [productForm, setProductForm] = useState({ id: null, name: "", price: "", description: "", img: "", isDeal: false });
  
  // Toggle deal flag for a product
  const toggleDeal = (id) => {
    const updated = products.map((x) => (x.id === id ? { ...x, isDeal: !x.isDeal } : x));
    setProducts(updated);
    try {
      localStorage.setItem("products", JSON.stringify(updated));
      window.dispatchEvent(new Event("productsUpdate"));
    } catch (e) {}
  };

  // Orders
  const [orders, setOrders] = useState([]);
  const [currentCart, setCurrentCart] = useState([]);

  const loadProducts = () => {
    try {
      const raw = localStorage.getItem("products");
      if (raw) setProducts(JSON.parse(raw));
      else setProducts([]);
    } catch (e) {
      setProducts([]);
    }
  };

  const loadOrders = () => {
    try {
      const raw = localStorage.getItem("orders");
      if (raw) setOrders(JSON.parse(raw));
      else setOrders([]);
    } catch (e) {
      setOrders([]);
    }
  };

  const loadCart = () => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setCurrentCart(JSON.parse(raw));
      else setCurrentCart([]);
    } catch (e) {
      setCurrentCart([]);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("carouselSlides");
      if (raw) setSlides(JSON.parse(raw));
      else setSlides(emptySlides);
    } catch (e) {
      setSlides(emptySlides);
    }
    loadProducts();
    loadOrders();
    loadCart();

    const prodHandler = () => loadProducts();
    const ordersHandler = () => loadOrders();
    const cartHandler = () => loadCart();

    window.addEventListener("productsUpdate", prodHandler);
    window.addEventListener("ordersUpdate", ordersHandler);
    window.addEventListener("cartUpdate", cartHandler);

    return () => {
      window.removeEventListener("productsUpdate", prodHandler);
      window.removeEventListener("ordersUpdate", ordersHandler);
      window.removeEventListener("cartUpdate", cartHandler);
    };
  }, []);

  const onFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added = [];
    for (const f of files) {
      const src = await toDataURL(f);
      added.push({ src, alt: f.name, caption: "" });
    }

    // Persist immediately so Home updates without needing to click Save
    setSlides((prev) => {
      const updated = [...prev, ...added];
      try {
        localStorage.setItem("carouselSlides", JSON.stringify(updated));
      } catch (e) {}
      window.dispatchEvent(new Event("carouselUpdate"));
      return updated;
    });
    setUploading(false);
  };

  const onDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, index) => {
    e.preventDefault();
    const from = dragIndex.current;
    const to = index;
    if (from === null || to === null || from === to) return;
    const updated = Array.from(slides);
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSlides(() => {
      try {
        localStorage.setItem("carouselSlides", JSON.stringify(updated));
      } catch (e) {}
      window.dispatchEvent(new Event("carouselUpdate"));
      return updated;
    });
    dragIndex.current = null;
  };

  const updateCaption = (i, caption) => {
    setSlides((prev) => {
      const updated = prev.map((x, idx) => (idx === i ? { ...x, caption } : x));
      try {
        localStorage.setItem("carouselSlides", JSON.stringify(updated));
      } catch (e) {}
      window.dispatchEvent(new Event("carouselUpdate"));
      return updated;
    });
  };

  const removeAt = (i) => {
    setSlides((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      try {
        localStorage.setItem("carouselSlides", JSON.stringify(updated));
      } catch (e) {}
      window.dispatchEvent(new Event("carouselUpdate"));
      return updated;
    });
  };

  const save = () => {
    localStorage.setItem("carouselSlides", JSON.stringify(slides));
    window.dispatchEvent(new Event("carouselUpdate"));
    alert("Saved slides");
  };

  const resetDefaults = () => {
    localStorage.removeItem("carouselSlides");
    setSlides(emptySlides);
    window.dispatchEvent(new Event("carouselUpdate"));
    alert("Reset to defaults");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current && fileRef.current.click()}
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Upload Images
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-md">Save</button>
          <button onClick={resetDefaults} className="bg-gray-600 text-white px-4 py-2 rounded-md">Reset</button>
        </div>
      </header>

      <div className="mb-4">
        <nav className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab("slides")} className={`px-3 py-1 rounded ${activeTab === "slides" ? "bg-green-600 text-white" : "bg-gray-100"}`}>Slides</button>
          <button onClick={() => setActiveTab("products")} className={`px-3 py-1 rounded ${activeTab === "products" ? "bg-green-600 text-white" : "bg-gray-100"}`}>Products</button>
          <button onClick={() => setActiveTab("orders")} className={`px-3 py-1 rounded ${activeTab === "orders" ? "bg-green-600 text-white" : "bg-gray-100"}`}>Orders</button>
        </nav>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {activeTab === "slides" && (
            <>
              <h2 className="text-lg font-semibold mb-3">Slides</h2>
              <div className="border rounded-md p-3">
                <div className="space-y-3">
                  {slides.length === 0 && <div className="text-sm text-gray-500">No slides uploaded yet.</div>}
                  {slides.map((s, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => onDragStart(e, i)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, i)}
                      className="flex items-center gap-3 border p-3 rounded-md"
                    >
                      <img src={s.src} alt={s.alt} className="w-36 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={s.caption || ""}
                          onChange={(e) => updateCaption(i, e.target.value)}
                          placeholder="Caption"
                          className="w-full border px-2 py-1 rounded"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => removeAt(i)} className="text-red-500">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "products" && (
            <>
              <h2 className="text-lg font-semibold mb-3">Products</h2>
              <div className="border rounded-md p-3 mb-4">
                <div className="grid grid-cols-1 gap-3">
                  {products.length === 0 && <div className="text-sm text-gray-500">No products yet. Use the form below to add products.</div>}
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 border p-3 rounded-md">
                      {p.img ? <img src={p.img} alt={p.name} className="w-28 h-20 object-cover rounded" /> : <div className="w-28 h-20 bg-gray-100 rounded" />}
                      <div className="flex-1">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">{p.price}</div>
                        <div className="text-sm text-gray-500">{p.description}</div>
                        <div className="mt-1">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!p.isDeal} onChange={() => toggleDeal(p.id)} />
                            <span className="text-sm">Deal</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => {
                          setProductForm(p);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }} className="text-blue-600">Edit</button>
                        <button onClick={() => {
                          const updated = products.filter(x => x.id !== p.id);
                          setProducts(updated);
                          localStorage.setItem('products', JSON.stringify(updated));
                            try { window.dispatchEvent(new Event('productsUpdate')); } catch (e) {}
                            alert('Product removed');
                        }} className="text-red-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">Add / Edit Product</h3>
                <div className="space-y-2">
                  <input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="Name" className="w-full border px-2 py-1 rounded" />
                  <input value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} placeholder="Price (e.g. $29.99)" className="w-full border px-2 py-1 rounded" />
                  <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} placeholder="Description" className="w-full border px-2 py-1 rounded" />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!productForm.isDeal} onChange={(e) => setProductForm({...productForm, isDeal: e.target.checked})} />
                    <span className="text-sm">Mark as Deal</span>
                  </label>
                  <div>
                    <label className="block text-sm mb-1">Image</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      const data = await toDataURL(f);
                      setProductForm((pf) => ({ ...pf, img: data }));
                    }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      // save product
                      const p = { ...productForm };
                      if (!p.name || !p.price) { alert('Please provide name and price'); return; }
                      if (!p.id) p.id = Date.now();
                      const existing = products.filter(x => x.id !== p.id);
                      const updated = [p, ...existing];
                      setProducts(updated);
                        localStorage.setItem('products', JSON.stringify(updated));
                        try { window.dispatchEvent(new Event('productsUpdate')); } catch (e) {}
                      setProductForm({ id: null, name: '', price: '', description: '', img: '' });
                      alert('Product saved');
                    }} className="bg-green-600 text-white px-3 py-1 rounded">Save Product</button>
                    <button onClick={() => setProductForm({ id: null, name: '', price: '', description: '', img: '' })} className="bg-gray-200 px-3 py-1 rounded">Clear</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <>
              <h2 className="text-lg font-semibold mb-3">Orders</h2>
              <div className="border rounded-md p-3">
                {orders.length === 0 && <div className="text-sm text-gray-500">No orders yet.</div>}
                {orders.map((o) => (
                  <div key={o.id} className="border p-3 rounded mb-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">Order #{o.id}</div>
                        <div className="text-sm text-gray-600">{o.name} — {o.email}</div>
                        <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Total: ${ (o.total || 0).toFixed ? (o.total).toFixed(2) : o.total }</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      {o.items && o.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 overflow-hidden rounded">
                            {it.img && <img src={it.img} alt={it.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>{it.name} x {it.quantity || 1} — {it.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Current Cart (this browser)</h3>
                  {currentCart.length === 0 ? (
                    <div className="text-sm text-gray-500">No items in cart.</div>
                  ) : (
                    <div className="space-y-2">
                      {currentCart.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 overflow-hidden rounded">
                            {it.img && <img src={it.img} alt={it.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>{it.name} x {it.quantity || 1} — {it.price}</div>
                        </div>
                      ))}
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => { localStorage.removeItem('cart'); loadCart(); alert('Cleared cart'); }} className="bg-red-600 text-white px-3 py-1 rounded">Clear Cart</button>
                        <button onClick={() => loadCart()} className="bg-gray-200 px-3 py-1 rounded">Refresh</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <aside>
          <h2 className="text-lg font-semibold mb-3">Preview</h2>
          <div className="border rounded-md p-3">
            <div className="w-full h-48 md:h-64 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {slides.length === 0 ? (
                <div className="text-sm text-gray-500">No slides to preview.</div>
              ) : (
                <img src={slides[0].src} alt={slides[0].alt} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">Drag to reorder slides. Edit captions and click Save to publish changes.</div>
            {uploading && <div className="mt-2 text-sm text-green-600">Uploading images...</div>}
            {activeTab === "products" && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Products Summary</h3>
                <div className="text-sm">Total products: {products.length}</div>
              </div>
            )}
            {activeTab === "orders" && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Recent Orders</h3>
                <div className="text-sm">Total orders: {orders.length}</div>
              </div>
            )}
          </div>
        </aside>
      </section>
      </div>
    </div>
  );
}

