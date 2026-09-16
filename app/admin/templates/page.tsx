import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import {deleteTemplate} from "./actions";
export const dynamic="force-dynamic";
export default async function Page(){
 const s=await createClient();
 const {data:templates,error}=await s.from("templates").select("id,name,slug,category,price,is_published,created_at").order("created_at",{ascending:false});
 if(error) throw new Error(error.message);
 return <main><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-sm font-bold uppercase tracking-widest text-slate-500">Admin CMS</p><h1 className="mt-2 text-3xl font-black">Templates</h1><p className="mt-2 text-slate-500">Kelola template melalui Supabase.</p></div><Link className="btn btn-primary" href="/admin/templates/new">+ Add Template</Link></div>
 <div className="mt-8 overflow-hidden rounded-2xl border bg-white overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr><th className="px-5 py-4">Template</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody>
 {(templates||[]).map(t=><tr className="border-b last:border-0" key={t.id}><td className="px-5 py-4"><b>{t.name}</b><div className="text-xs text-slate-500">/{t.slug}</div></td><td className="px-5 py-4">{t.category}</td><td className="px-5 py-4">Rp {Number(t.price).toLocaleString("id-ID")}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{t.is_published?"Published":"Draft"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link className="btn btn-secondary text-xs" href={"/admin/templates/"+t.id+"/edit"}>Edit</Link><form action={deleteTemplate}><input type="hidden" name="id" value={t.id}/><button className="btn border border-red-200 bg-white text-xs text-red-600" type="submit">Delete</button></form></div></td></tr>)}
 {(!templates||!templates.length)&&<tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Belum ada template.</td></tr>}</tbody></table></div></main>
}
