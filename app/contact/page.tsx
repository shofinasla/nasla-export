"use client";
import { useState } from "react";
export default function Contact(){
  const [done,setDone]=useState(false);
  return <main className="container py-16"><div className="max-w-2xl"><h1 className="text-4xl font-black">Contact / Buyer Inquiry</h1><p className="mt-3 text-slate-500">Lead form foundation. Connect to Supabase and notification provider.</p>
  <form className="mt-8 grid gap-4" onSubmit={e=>{e.preventDefault();setDone(true)}}><input className="input" placeholder="Nama / Company"/><input className="input" type="email" placeholder="Email"/><input className="input" placeholder="Country"/><textarea className="input min-h-36" placeholder="What do you need?"/><button className="btn btn-primary" type="submit">Send Inquiry</button>{done&&<p className="text-sm text-green-700">UI berhasil dikirim. Hubungkan submit ke Supabase pada tahap integration.</p>}</form></div></main>
}