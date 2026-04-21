import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import New from "./pages/New";
import Categories from "./pages/Categories";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatWidget from "./components/ChatWidget";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdmin from "./components/ProtectedAdmin";
import AdminLayout from "./components/admin/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/new" element={<New />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedAdmin>
                    <AdminLayout>
                      <Admin />
                    </AdminLayout>
                  </ProtectedAdmin>
                } />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path= "/wishlist" element={<Wishlist />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}