"use client";
import { useState } from "react";

export function DomainSearch() {
  const [domain,setDomain] = useState(""); const [message,setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("Registrar API belum terhubung. Endpoint siap di /api/domains/check.");
  }
  return <form onSubmit={submit} className="card max-w-2xl">
    <label className="mb-2 block text-sm font-bold">Domain</label>
    <div className="flex gap-2"><input className="input" value={domain} onChange={e=>setDomain(e.target.value)} placeholder="contoh: perusahaananda.com"/><button className="btn btn-primary" type="submit">Check</button></div>
    {message && <p className="mt-4 text-sm text-slate-500">{message}</p>}
  </form>;
}