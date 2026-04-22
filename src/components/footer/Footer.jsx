import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10 w-full">
      <div className="px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mansur<span className="text-green-500">Enterprises</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed">
            Your trusted destination for quality fashion, accessories, and more.
          </p>

          {/* Contact Info */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt /> Mumbai, India
            </div>
            <div className="flex items-center gap-2">
              <FaPhone /> +233 50 000 0000
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope /> support@mensur.com
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition">Home</a></li>
            <li><a href="/shop" className="hover:text-white transition">Shop</a></li>
            <li><a href="/deals" className="hover:text-white transition">Deals</a></li>
            <li><a href="/new" className="hover:text-white transition">New Arrivals</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Customer Support</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition">Returns</a></li>
            <li><a href="#" className="hover:text-white transition">Shipping</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Stay Updated</h2>
          <p className="text-sm mb-3">
            Subscribe to get special offers and updates.
          </p>

          <div className="flex items-center bg-gray-800 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
            <FaEnvelope className="ml-3 text-gray-400" size={16} />
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent px-2 py-2 outline-none w-full text-sm"
            />
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white text-sm transition">
              Subscribe
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-5 text-lg">
            <FaFacebook className="cursor-pointer hover:text-white transition" />
            <FaInstagram className="cursor-pointer hover:text-white transition" />
            <FaTwitter className="cursor-pointer hover:text-white transition" />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="max-w-7xl mx-auto px-6 pb-6 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>We accept:</div>
        <div className="flex gap-4">
          <span className="bg-gray-800 px-3 py-1 rounded">MTN MoMo</span>
          <span className="bg-gray-800 px-3 py-1 rounded">Visa</span>
          <span className="bg-gray-800 px-3 py-1 rounded">Mastercard</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center text-sm py-4">
        © {new Date().getFullYear()} Mansur Enterprises. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;