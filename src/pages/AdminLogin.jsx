import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminLogin() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const res = login({ email, password });
    if (!res.ok) return setError(res.error || "Login failed");
    if (res.user.role !== "admin") return setError("Not an admin account");
    nav("/admin");
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input className="w-full border px-2 py-2 mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full border px-2 py-2 mb-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded">Login</button>
        </div>
      </form>
    </main>
  );
}
