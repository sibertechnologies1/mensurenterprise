import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function AdminLayout({ children }) {
  const { currentUser, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const doLogout = () => {
    logout();
    nav("/");
  };

  return (
    <div>
      <header className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-bold text-lg">Admin</Link>
            <Link to="/admin" className="text-sm">Dashboard</Link>
            <Link to="/admin" className="text-sm">Slides</Link>
            <Link to="/admin" className="text-sm">Products</Link>
            <Link to="/admin" className="text-sm">Orders</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">{currentUser?.name || currentUser?.email}</div>
            <button onClick={doLogout} className="bg-red-600 px-3 py-1 rounded text-sm">Logout</button>
          </div>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
